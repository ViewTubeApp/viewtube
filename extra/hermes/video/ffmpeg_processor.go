package video

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"math/rand"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"viewtube/task"
)

// FFmpegProcessor handles video processing operations
type FFmpegProcessor struct{}

// NewFFmpegProcessor creates a new FFmpeg processor
func NewFFmpegProcessor() *FFmpegProcessor {
	return &FFmpegProcessor{}
}

// CreatePoster generates a thumbnail from a video
func (p *FFmpegProcessor) CreatePoster(ctx context.Context, videoPath string, outputPath string) error {
	cmd := exec.CommandContext(ctx, "ffmpeg",
		"-i", videoPath,
		"-ss", "00:00:01",
		"-vframes", "1",
		"-y",
		outputPath,
	)

	if err := cmd.Run(); err != nil {
		log.Printf("[ERROR] Error creating poster: %v", err)
		return fmt.Errorf("error creating poster: %w", err)
	}

	log.Printf("[DEBUG] Successfully created poster at: %s", outputPath)
	return p.verifyOutput(outputPath)
}

// CreateWebVTT generates WebVTT thumbnails from a video
func (p *FFmpegProcessor) CreateWebVTT(ctx context.Context, videoPath string, outputDir string, config task.WebVTTConfig) error {
	duration, err := p.GetVideoDuration(ctx, videoPath)
	if err != nil {
		log.Printf("[ERROR] Error getting video duration: %v", err)
		return fmt.Errorf("error getting video duration: %w", err)
	}
	log.Printf("[DEBUG] Video duration: %f seconds", duration)

	// Get video dimensions to determine orientation
	width, height, err := p.GetVideoDimensions(ctx, videoPath)
	if err != nil {
		log.Printf("[ERROR] Error getting video dimensions: %v", err)
		return fmt.Errorf("failed to get video dimensions: %w", err)
	}
	log.Printf("[DEBUG] Original video dimensions: %dx%d", width, height)

	// Determine if this is a portrait video
	isPortrait := height > width
	spriteWidth := config.GetWidth()
	spriteHeight := config.GetHeight()

	// For portrait videos, swap width and height to maintain aspect ratio
	if isPortrait {
		spriteWidth = config.GetHeight()
		spriteHeight = config.GetWidth()
		log.Printf("[DEBUG] Portrait video detected, using dimensions: %dx%d", spriteWidth, spriteHeight)
	}

	// Limit duration if maxDuration is set
	if config.GetMaxDuration() > 0 && duration > config.GetMaxDuration() {
		duration = config.GetMaxDuration()
		log.Printf("[DEBUG] Duration limited to: %f seconds", duration)
	}

	numThumbnails := int(math.Ceil(duration / config.GetInterval()))
	numRows := int(math.Ceil(float64(numThumbnails) / float64(config.GetNumColumns())))
	log.Printf("[DEBUG] Generating %d thumbnails in %d rows", numThumbnails, numRows)

	spriteFile := filepath.Join(outputDir, "storyboard.jpg")
	cmd := exec.CommandContext(ctx, "ffmpeg",
		"-i", videoPath,
		"-vf", fmt.Sprintf("fps=1/%f,scale=%d:%d:force_original_aspect_ratio=decrease,pad=%d:%d:(ow-iw)/2:(oh-ih)/2,tile=%dx%d",
			config.GetInterval(),
			spriteWidth,
			spriteHeight,
			spriteWidth,
			spriteHeight,
			config.GetNumColumns(),
			numRows,
		),
		"-frames:v", "1",
		spriteFile,
	)

	setProcessAttributes(cmd)

	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		log.Printf("[ERROR] Error creating sprite image: %v, stderr: %s", err, stderr.String())
		return fmt.Errorf("error creating sprite image: %w, stderr: %s", err, stderr.String())
	}
	log.Printf("[DEBUG] Successfully created sprite image at: %s", spriteFile)

	vttFile := filepath.Join(outputDir, "thumbnails.vtt")
	if err := p.generateVTTFile(vttFile, duration, config, filepath.Base(outputDir), videoPath, isPortrait, spriteWidth, spriteHeight); err != nil {
		log.Printf("[ERROR] Error generating VTT file: %v", err)
		return fmt.Errorf("error generating VTT file: %w", err)
	}
	log.Printf("[DEBUG] Successfully created VTT file at: %s", vttFile)

	return nil
}

// CreateTrailer generates a trailer from the input video
func (p *FFmpegProcessor) CreateTrailer(ctx context.Context, inputPath string, outputPath string, config task.TrailerConfig) error {
	duration, err := p.GetVideoDuration(ctx, inputPath)
	if err != nil {
		log.Printf("[ERROR] Error getting video duration: %v", err)
		return fmt.Errorf("failed to get video duration: %w", err)
	}
	log.Printf("[DEBUG] Video duration: %f seconds", duration)

	// Get video dimensions to determine orientation
	width, height, err := p.GetVideoDimensions(ctx, inputPath)
	if err != nil {
		log.Printf("[ERROR] Error getting video dimensions: %v", err)
		return fmt.Errorf("failed to get video dimensions: %w", err)
	}
	log.Printf("[DEBUG] Original video dimensions: %dx%d", width, height)

	// Determine scale filter based on orientation and aspect ratio strategy
	scaleFilter := p.getScaleFilter(width, height, config)
	log.Printf("[DEBUG] Using scale filter: %s", scaleFilter)

	// Calculate clip start times based on strategy
	var clipStartTimes []float64
	if config.GetSelectionStrategy() == "uniform" {
		interval := duration / float64(config.GetClipCount())
		log.Printf("[DEBUG] Using uniform strategy with interval: %f seconds", interval)
		for i := 0; i < config.GetClipCount(); i++ {
			startTime := interval * float64(i)
			if startTime+config.GetClipDuration() > duration {
				log.Printf("[DEBUG] Stopping at clip %d due to duration limit", i)
				break
			}
			clipStartTimes = append(clipStartTimes, startTime)
		}
	} else if config.GetSelectionStrategy() == "random" {
		log.Printf("[DEBUG] Using random strategy for clip selection")
		for i := 0; i < config.GetClipCount(); i++ {
			maxStart := duration - config.GetClipDuration()
			if maxStart < 0 {
				log.Printf("[DEBUG] Stopping at clip %d due to duration limit", i)
				break
			}
			startTime := rand.Float64() * maxStart
			clipStartTimes = append(clipStartTimes, startTime)
		}
		sort.Float64s(clipStartTimes)
	} else {
		log.Printf("[ERROR] Unknown selection strategy: %s", config.GetSelectionStrategy())
		return fmt.Errorf("unknown selection strategy: %s", config.GetSelectionStrategy())
	}
	log.Printf("[DEBUG] Selected %d clip start times", len(clipStartTimes))

	// Create temporary directory for clips
	tempDir, err := os.MkdirTemp("", "trailer_clips_")
	if err != nil {
		return fmt.Errorf("failed to create temp directory: %w", err)
	}
	defer os.RemoveAll(tempDir)

	// Generate list of clip files for concatenation
	var clipPaths []string
	for i, startTime := range clipStartTimes {
		clipPath := filepath.Join(tempDir, fmt.Sprintf("clip_%d.mp4", i))
		clipPaths = append(clipPaths, clipPath)

		// Extract clip using ffmpeg
		args := []string{
			"-ss", fmt.Sprintf("%f", startTime),
			"-t", fmt.Sprintf("%f", config.GetClipDuration()),
			"-i", inputPath,
			"-vf", scaleFilter,
			"-c:v", "libx264",
			"-c:a", "aac",
			"-y",
			clipPath,
		}

		cmd := exec.CommandContext(ctx, "ffmpeg", args...)
		if err := cmd.Run(); err != nil {
			return fmt.Errorf("failed to extract clip %d: %w", i, err)
		}
	}

	// Create concat file
	concatFile := filepath.Join(tempDir, "concat.txt")
	var concatContent strings.Builder
	for _, clipPath := range clipPaths {
		concatContent.WriteString(fmt.Sprintf("file '%s'\n", clipPath))
	}
	if err := os.WriteFile(concatFile, []byte(concatContent.String()), 0644); err != nil {
		return fmt.Errorf("failed to create concat file: %w", err)
	}

	// Concatenate clips into final trailer
	args := []string{
		"-f", "concat",
		"-safe", "0",
		"-i", concatFile,
		"-c", "copy",
		"-y",
		outputPath,
	}

	cmd := exec.CommandContext(ctx, "ffmpeg", args...)
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to concatenate clips: %w", err)
	}

	return nil
}

// getScaleFilter determines the appropriate FFmpeg scale filter based on video orientation and config
func (p *FFmpegProcessor) getScaleFilter(width, height int, config task.TrailerConfig) string {
	isPortrait := height > width
	strategy := config.GetAspectRatioStrategy()

	// Default dimensions from config
	targetWidth := config.GetWidth()
	targetHeight := config.GetHeight()

	// Check if we need to adjust dimensions based on orientation
	if isPortrait {
		// For portrait videos, we might want to swap dimensions or use different logic
		maxWidth := config.GetMaxWidth()
		maxHeight := config.GetMaxHeight()

		// Adjust target dimensions based on orientation while respecting max dimensions
		if strategy == "fit" {
			// Calculate scaled dimensions while maintaining aspect ratio
			aspectRatio := float64(width) / float64(height)

			// Try scaling by height first
			newWidth := int(float64(maxHeight) * aspectRatio)
			if newWidth <= maxWidth {
				// Height-constrained
				targetWidth = newWidth
				targetHeight = maxHeight
			} else {
				// Width-constrained
				targetWidth = maxWidth
				targetHeight = int(float64(maxWidth) / aspectRatio)
			}
		}
	}

	switch strategy {
	case "fit":
		// Maintain aspect ratio and fit within dimensions (may add letterboxing/pillarboxing)
		return fmt.Sprintf("scale=%d:%d:force_original_aspect_ratio=decrease,pad=%d:%d:(ow-iw)/2:(oh-ih)/2",
			targetWidth, targetHeight, targetWidth, targetHeight)
	case "crop":
		// Maintain aspect ratio and crop to fill dimensions
		return fmt.Sprintf("scale=%d:%d:force_original_aspect_ratio=increase,crop=%d:%d",
			targetWidth, targetHeight, targetWidth, targetHeight)
	case "stretch":
		// Stretch to fill dimensions (may distort)
		return fmt.Sprintf("scale=%d:%d", targetWidth, targetHeight)
	default:
		// Default to "fit" if unknown strategy
		return fmt.Sprintf("scale=%d:%d:force_original_aspect_ratio=decrease,pad=%d:%d:(ow-iw)/2:(oh-ih)/2",
			targetWidth, targetHeight, targetWidth, targetHeight)
	}
}

// GetVideoDimensions returns the width and height of a video
func (p *FFmpegProcessor) GetVideoDimensions(ctx context.Context, inputPath string) (int, int, error) {
	args := []string{
		"-v", "error",
		"-select_streams", "v:0",
		"-show_entries", "stream=width,height",
		"-of", "csv=s=x:p=0",
		inputPath,
	}

	cmd := exec.CommandContext(ctx, "ffprobe", args...)
	output, err := cmd.Output()
	if err != nil {
		return 0, 0, fmt.Errorf("failed to get video dimensions: %w", err)
	}

	dimensions := strings.TrimSpace(string(output))
	// Remove any trailing 'x' characters that might appear in some ffprobe outputs
	dimensions = strings.TrimSuffix(dimensions, "x")

	parts := strings.Split(dimensions, "x")
	if len(parts) != 2 {
		// Try alternative approach if the format is unexpected
		log.Printf("[DEBUG] Unexpected dimensions format: %s, trying alternative approach", dimensions)
		return p.getVideoDimensionsAlternative(ctx, inputPath)
	}

	width, err := strconv.Atoi(parts[0])
	if err != nil {
		return 0, 0, fmt.Errorf("failed to parse width: %w", err)
	}

	height, err := strconv.Atoi(parts[1])
	if err != nil {
		return 0, 0, fmt.Errorf("failed to parse height: %w", err)
	}

	return width, height, nil
}

// getVideoDimensionsAlternative is a fallback method to get video dimensions
func (p *FFmpegProcessor) getVideoDimensionsAlternative(ctx context.Context, inputPath string) (int, int, error) {
	// Use a different ffprobe format that's more reliable
	args := []string{
		"-v", "error",
		"-select_streams", "v:0",
		"-show_entries", "stream=width,height",
		"-of", "json",
		inputPath,
	}

	cmd := exec.CommandContext(ctx, "ffprobe", args...)
	output, err := cmd.Output()
	if err != nil {
		return 0, 0, fmt.Errorf("failed to get video dimensions (alternative): %w", err)
	}

	// Parse the JSON output
	type ffprobeOutput struct {
		Streams []struct {
			Width  int `json:"width"`
			Height int `json:"height"`
		} `json:"streams"`
	}

	var result ffprobeOutput
	if err := json.Unmarshal(output, &result); err != nil {
		return 0, 0, fmt.Errorf("failed to parse ffprobe JSON output: %w", err)
	}

	if len(result.Streams) == 0 {
		return 0, 0, fmt.Errorf("no video streams found")
	}

	width := result.Streams[0].Width
	height := result.Streams[0].Height

	if width == 0 || height == 0 {
		return 0, 0, fmt.Errorf("invalid dimensions: %dx%d", width, height)
	}

	log.Printf("[DEBUG] Alternative approach found dimensions: %dx%d", width, height)
	return width, height, nil
}

// GetVideoDuration returns the duration of a video in seconds
func (p *FFmpegProcessor) GetVideoDuration(ctx context.Context, inputPath string) (float64, error) {
	args := []string{
		"-v", "error",
		"-show_entries", "format=duration",
		"-of", "default=noprint_wrappers=1:nokey=1",
		inputPath,
	}

	cmd := exec.CommandContext(ctx, "ffprobe", args...)
	output, err := cmd.Output()
	if err != nil {
		return 0, fmt.Errorf("failed to get video duration: %w", err)
	}

	duration, err := strconv.ParseFloat(strings.TrimSpace(string(output)), 64)
	if err != nil {
		return 0, fmt.Errorf("failed to parse duration: %w", err)
	}

	return duration, nil
}

func (p *FFmpegProcessor) verifyOutput(outputPath string) error {
	fileInfo, err := os.Stat(outputPath)
	if err != nil {
		return fmt.Errorf("output file not created or inaccessible: %w", err)
	}

	// Check if the file is empty
	if fileInfo.Size() == 0 {
		return fmt.Errorf("output file is empty: %s", outputPath)
	}

	log.Printf("[DEBUG] Verified output file: %s (size: %d bytes)", outputPath, fileInfo.Size())
	return nil
}

func (p *FFmpegProcessor) generateVTTFile(vttFile string, duration float64, config task.WebVTTConfig, baseDir string, videoPath string, isPortrait bool, spriteWidth, spriteHeight int) error {
	vttContent := []string{"WEBVTT", ""}

	numThumbnails := int(math.Ceil(duration / config.GetInterval()))
	for i := 0; i < numThumbnails; i++ {
		startTime := float64(i) * config.GetInterval()
		endTime := math.Min(float64(i+1)*config.GetInterval(), duration)

		row := i / config.GetNumColumns()
		col := i % config.GetNumColumns()
		x := col * spriteWidth
		y := row * spriteHeight

		vttContent = append(vttContent,
			formatTime(startTime)+" --> "+formatTime(endTime),
			fmt.Sprintf("/uploads/%s/storyboard.jpg#xywh=%d,%d,%d,%d", baseDir, x, y, spriteWidth, spriteHeight),
			"",
		)
	}

	return os.WriteFile(vttFile, []byte(strings.Join(vttContent, "\n")), 0644)
}

func formatTime(seconds float64) string {
	h := int(seconds / 3600)
	m := int(seconds/60) % 60
	s := seconds - float64(h*3600+m*60)
	return fmt.Sprintf("%02d:%02d:%06.3f", h, m, s)
}
