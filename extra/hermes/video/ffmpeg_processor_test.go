package video

import (
	"context"
	"os"
	"os/exec"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestCreatePoster tests the CreatePoster method
func TestCreatePoster(t *testing.T) {
	// Check if ffmpeg is available
	_, err := exec.LookPath("ffmpeg")
	if err != nil {
		// Instead of skipping, we'll test what we can without ffmpeg
		t.Log("ffmpeg not found, running limited test")

		// Create a temporary directory for testing
		tempDir, err := os.MkdirTemp("", "poster_test")
		assert.NoError(t, err)
		defer os.RemoveAll(tempDir)

		// Create test paths
		videoPath := filepath.Join(tempDir, "test.mp4")
		outputPath := filepath.Join(tempDir, "poster.jpg")

		// Create an empty file to simulate the video
		err = os.WriteFile(videoPath, []byte("mock video data"), 0644)
		assert.NoError(t, err)

		// Create a processor
		processor := NewFFmpegProcessor()

		// We expect an error since ffmpeg is not available
		err = processor.CreatePoster(context.Background(), videoPath, outputPath)
		assert.Error(t, err)

		return
	}

	// If ffmpeg is available, run a real test
	// Create a temporary directory for testing
	tempDir, err := os.MkdirTemp("", "poster_test")
	assert.NoError(t, err)
	defer os.RemoveAll(tempDir)

	// Create test paths
	videoPath := filepath.Join(tempDir, "test.mp4")
	outputPath := filepath.Join(tempDir, "poster.jpg")

	// Create an empty file to simulate the video
	err = os.WriteFile(videoPath, []byte("mock video data"), 0644)
	assert.NoError(t, err)

	// Create a processor
	processor := NewFFmpegProcessor()

	// We expect an error since the video file is not a real video
	err = processor.CreatePoster(context.Background(), videoPath, outputPath)
	assert.Error(t, err)
}

// TestGetVideoDuration tests the GetVideoDuration method
func TestGetVideoDuration(t *testing.T) {
	// Check if ffprobe is available
	_, err := exec.LookPath("ffprobe")
	if err != nil {
		// Instead of skipping, we'll test what we can without ffprobe
		t.Log("ffprobe not found, running limited test")

		// Create a temporary directory for testing
		tempDir, err := os.MkdirTemp("", "duration_test")
		assert.NoError(t, err)
		defer os.RemoveAll(tempDir)

		// Create test path
		videoPath := filepath.Join(tempDir, "test.mp4")

		// Create an empty file to simulate the video
		err = os.WriteFile(videoPath, []byte("mock video data"), 0644)
		assert.NoError(t, err)

		// Create a processor
		processor := NewFFmpegProcessor()

		// We expect an error since ffprobe is not available
		_, err = processor.GetVideoDuration(context.Background(), videoPath)
		assert.Error(t, err)

		return
	}

	// If ffprobe is available, run a real test
	// Create a temporary directory for testing
	tempDir, err := os.MkdirTemp("", "duration_test")
	assert.NoError(t, err)
	defer os.RemoveAll(tempDir)

	// Create test path
	videoPath := filepath.Join(tempDir, "test.mp4")

	// Create an empty file to simulate the video
	err = os.WriteFile(videoPath, []byte("mock video data"), 0644)
	assert.NoError(t, err)

	// Create a processor
	processor := NewFFmpegProcessor()

	// We expect an error since the video file is not a real video
	_, err = processor.GetVideoDuration(context.Background(), videoPath)
	assert.Error(t, err)
}
