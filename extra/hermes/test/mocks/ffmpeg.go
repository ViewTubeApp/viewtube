package mocks

import (
	"context"

	"viewtube/task"

	"github.com/stretchr/testify/mock"
)

// MockFFmpegProcessor is a mock implementation of the FFmpegProcessor
type MockFFmpegProcessor struct {
	mock.Mock
}

// GeneratePoster mocks the GeneratePoster method
func (m *MockFFmpegProcessor) GeneratePoster(ctx context.Context, videoPath, outputPath string) error {
	args := m.Called(ctx, videoPath, outputPath)
	return args.Error(0)
}

// GenerateWebVTT mocks the GenerateWebVTT method
func (m *MockFFmpegProcessor) GenerateWebVTT(ctx context.Context, videoPath, outputDir string, config task.WebVTTConfig) error {
	args := m.Called(ctx, videoPath, outputDir, config)
	return args.Error(0)
}

// GenerateTrailer mocks the GenerateTrailer method
func (m *MockFFmpegProcessor) GenerateTrailer(ctx context.Context, videoPath, outputPath string, config task.TrailerConfig) error {
	args := m.Called(ctx, videoPath, outputPath, config)
	return args.Error(0)
}

// GetVideoDuration mocks the GetVideoDuration method
func (m *MockFFmpegProcessor) GetVideoDuration(ctx context.Context, videoPath string) (float64, error) {
	args := m.Called(ctx, videoPath)
	return args.Get(0).(float64), args.Error(1)
}
