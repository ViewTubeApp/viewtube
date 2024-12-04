package video

import (
	"bytes"
	"context"
	"fmt"
	"math"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"

	"viewtube/task"
)

// Processor handles video processing operations
type Processor struct {
	ffmpegThreads string
}

// NewProcessor creates a new video processor
func NewProcessor(ffmpegThreads string) *Processor {
	return &Processor{
		ffmpegThreads: ffmpegThreads,
	}
}

// CreatePoster generates a poster image from a video
func (p *Processor) CreatePoster(ctx context.Context, videoPath, outputPath string) error {
	if err := os.MkdirAll(filepath.Dir(outputPath), 0755); err != nil {
		return fmt.Errorf("failed to create output directory: %w", err)
	}

	cmd := exec.CommandContext(ctx, "ffmpeg",
		"-i", videoPath,
		"-ss", "00:00:01",
		"-vframes", "1",
		"-vf", "scale=1280:720",
		"-threads", p.ffmpegThreads,
		outputPath,
	)

	setProcessAttributes(cmd)

	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("ffmpeg error: %v, stderr: %s", err, stderr.String())
	}

	return p.verifyOutput(outputPath)
}

// CreateWebVTT generates WebVTT thumbnails from a video
func (p *Processor) CreateWebVTT(ctx context.Context, videoPath string, outputDir string, config task.WebVTTConfig) error {
	duration, err := p.getVideoDuration(videoPath)
	if err != nil {
		return fmt.Errorf("error getting video duration: %w", err)
	}

	spriteFile := filepath.Join(outputDir, "storyboard.jpg")
	cmd := exec.CommandContext(ctx, "ffmpeg",
		"-i", videoPath,
		"-vf", fmt.Sprintf("fps=1/%f,scale=%d:%d,tile=%dx%d",
			config.Interval,
			config.Width,
			config.Height,
			config.NumColumns,
			int(math.Ceil(duration/config.Interval/float64(config.NumColumns)))),
		"-frames:v", "1",
		spriteFile,
	)

	setProcessAttributes(cmd)

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("error creating sprite image: %w", err)
	}

	vttFile := filepath.Join(outputDir, "thumbnails.vtt")
	if err := p.generateVTTFile(vttFile, duration, config, filepath.Base(outputDir)); err != nil {
		return fmt.Errorf("error generating VTT file: %w", err)
	}

	return nil
}

// CreateTrailer generates a trailer from a video
func (p *Processor) CreateTrailer(ctx context.Context, videoPath, outputPath string) error {
	cmd := exec.CommandContext(ctx, "ffmpeg",
		"-i", videoPath,
		"-ss", "00:00:00",
		"-t", "30",
		"-c:v", "libx264",
		"-c:a", "aac",
		"-strict", "experimental",
		outputPath,
	)

	setProcessAttributes(cmd)

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("error creating trailer: %w", err)
	}

	return p.verifyOutput(outputPath)
}

func (p *Processor) verifyOutput(path string) error {
	info, err := os.Stat(path)
	if err != nil {
		return fmt.Errorf("failed to stat output file: %w", err)
	}
	if info.Size() == 0 {
		return fmt.Errorf("output file is empty")
	}
	return nil
}

func (p *Processor) getVideoDuration(filePath string) (float64, error) {
	cmd := exec.Command("ffprobe",
		"-v", "error",
		"-show_entries", "format=duration",
		"-of", "default=noprint_wrappers=1:nokey=1",
		filePath,
	)
	output, err := cmd.Output()
	if err != nil {
		return 0, err
	}
	return strconv.ParseFloat(strings.TrimSpace(string(output)), 64)
}

func (p *Processor) generateVTTFile(vttFile string, duration float64, config task.WebVTTConfig, baseDir string) error {
	vttContent := []string{"WEBVTT", ""}

	numThumbnails := int(math.Ceil(duration / config.Interval))
	for i := 0; i < numThumbnails; i++ {
		startTime := float64(i) * config.Interval
		endTime := math.Min(float64(i+1)*config.Interval, duration)

		row := i / config.NumColumns
		col := i % config.NumColumns
		x := col * config.Width
		y := row * config.Height

		vttContent = append(vttContent,
			formatTime(startTime)+" --> "+formatTime(endTime),
			fmt.Sprintf("/uploads/%s/storyboard.jpg#xywh=%d,%d,%d,%d", baseDir, x, y, config.Width, config.Height),
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