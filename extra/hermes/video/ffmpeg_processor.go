package video

import (
	"bytes"
	"context"
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
	duration, err := p.getVideoDuration(ctx, videoPath)
	if err != nil {
		log.Printf("[ERROR] Error getting video duration: %v", err)
		return fmt.Errorf("error getting video duration: %w", err)
	}
	log.Printf("[DEBUG] Video duration: %f seconds", duration)

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
		"-vf", fmt.Sprintf("fps=1/%f,scale=%d:%d,tile=%dx%d",
			config.GetInterval(),
			config.GetWidth(),
			config.GetHeight(),
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
	if err := p.generateVTTFile(vttFile, duration, config, filepath.Base(outputDir)); err != nil {
		log.Printf("[ERROR] Error generating VTT file: %v", err)
		return fmt.Errorf("error generating VTT file: %w", err)
	}
	log.Printf("[DEBUG] Successfully created VTT file at: %s", vttFile)

	return nil
}

// CreateTrailer generates a trailer from the input video
func (p *FFmpegProcessor) CreateTrailer(ctx context.Context, inputPath string, outputPath string, config task.TrailerConfig) error {
	duration, err := p.getVideoDuration(ctx, inputPath)
	if err != nil {
		log.Printf("[ERROR] Error getting video duration: %v", err)
		return fmt.Errorf("failed to get video duration: %w", err)
	}
	log.Printf("[DEBUG] Video duration: %f seconds", duration)

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
			"-vf", fmt.Sprintf("scale=%d:%d", config.GetWidth(), config.GetHeight()),
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

// getVideoDuration returns the duration of a video in seconds
func (p *FFmpegProcessor) getVideoDuration(ctx context.Context, inputPath string) (float64, error) {
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
	if _, err := os.Stat(outputPath); err != nil {
		return fmt.Errorf("output file not created: %w", err)
	}
	return nil
}

func (p *FFmpegProcessor) generateVTTFile(vttFile string, duration float64, config task.WebVTTConfig, baseDir string) error {
	vttContent := []string{"WEBVTT", ""}

	numThumbnails := int(math.Ceil(duration / config.GetInterval()))
	for i := 0; i < numThumbnails; i++ {
		startTime := float64(i) * config.GetInterval()
		endTime := math.Min(float64(i+1)*config.GetInterval(), duration)

		row := i / config.GetNumColumns()
		col := i % config.GetNumColumns()
		x := col * config.GetWidth()
		y := row * config.GetHeight()

		vttContent = append(vttContent,
			formatTime(startTime)+" --> "+formatTime(endTime),
			fmt.Sprintf("/uploads/%s/storyboard.jpg#xywh=%d,%d,%d,%d", baseDir, x, y, config.GetWidth(), config.GetHeight()),
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
