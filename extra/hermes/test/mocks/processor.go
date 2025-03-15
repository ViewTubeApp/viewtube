package mocks

import (
	"context"
	"fmt"

	"viewtube/task"
)

// AMQPChannel defines the AMQP channel interface needed for testing
type AMQPChannel interface{}

// VideoProcessor defines the video processor interface needed for testing
type VideoProcessor interface {
	GeneratePoster(ctx context.Context, videoPath string, outputPath string) error
	GenerateWebVTT(ctx context.Context, videoPath string, outputDir string, config task.WebVTTConfig) error
	GenerateTrailer(ctx context.Context, inputPath string, outputPath string, config task.TrailerConfig) error
	GetVideoDuration(ctx context.Context, inputPath string) (float64, error)
}

// VideoRepo defines the repository interface needed for testing
type VideoRepo interface {
	BeginTask(ctx context.Context, videoID int, taskType string) error
	CompleteTask(ctx context.Context, videoID int, taskType string, status string, err error) error
	UpdateVideoDuration(ctx context.Context, videoID int, duration float64) error
}

// TaskProcessorConfig represents the configuration for the test task processor
type TaskProcessorConfig struct {
	TaskTimeout    interface{}
	MaxRetries     int
	RetryBaseDelay interface{}
	UploadsVolume  string
}

// TestTaskProcessor is a test-specific version of TaskProcessor that accepts interfaces
type TestTaskProcessor struct {
	Channel    AMQPChannel
	Processor  VideoProcessor
	Repository VideoRepo
	Config     TaskProcessorConfig
	QueueName  string
	Exchange   string
}

// HandleTask implements the same logic as TaskProcessor.handleTask
func (p *TestTaskProcessor) HandleTask(ctx context.Context, videoTask task.VideoTask) error {
	// Begin task processing
	if err := p.Repository.BeginTask(ctx, videoTask.VideoId, videoTask.TaskType); err != nil {
		return err
	}

	// Process the task
	err := p.ProcessTask(ctx, videoTask)

	// Complete task with appropriate status
	status := "completed"
	if err != nil {
		status = "failed"
	}

	if completeErr := p.Repository.CompleteTask(ctx, videoTask.VideoId, videoTask.TaskType, status, err); completeErr != nil {
		if err != nil {
			return err
		}
		return completeErr
	}

	return err
}

// ProcessTask implements the same logic as TaskProcessor.processTask
func (p *TestTaskProcessor) ProcessTask(ctx context.Context, videoTask task.VideoTask) error {
	// Construct absolute paths
	inputPath := p.Config.UploadsVolume + "/" + videoTask.FilePath
	outputPath := p.Config.UploadsVolume + "/" + videoTask.OutputPath

	switch videoTask.TaskType {
	case "poster":
		return p.Processor.GeneratePoster(ctx, inputPath, outputPath+"/poster.jpg")
	case "webvtt":
		if videoTask.Config == nil {
			return fmt.Errorf("missing WebVTT config")
		}
		rawConfig, ok := videoTask.Config["webvtt"]
		if !ok {
			return fmt.Errorf("missing WebVTT config")
		}
		configMap, ok := rawConfig.(map[string]interface{})
		if !ok {
			return fmt.Errorf("invalid WebVTT config type")
		}

		// Create WebVTT config implementation with safe type conversions
		webVTTConfig := &task.WebVTTConfigImpl{
			Interval:    getFloat64(configMap, "interval"),
			NumColumns:  getInt(configMap, "numColumns"),
			Width:       getInt(configMap, "width"),
			Height:      getInt(configMap, "height"),
			MaxDuration: getFloat64(configMap, "maxDuration"),
		}

		return p.Processor.GenerateWebVTT(ctx, inputPath, outputPath, webVTTConfig)
	case "trailer":
		if videoTask.Config == nil {
			return fmt.Errorf("missing trailer config")
		}
		rawConfig, ok := videoTask.Config["trailer"]
		if !ok {
			return fmt.Errorf("missing trailer config")
		}
		configMap, ok := rawConfig.(map[string]interface{})
		if !ok {
			return fmt.Errorf("invalid trailer config type")
		}

		// Create trailer config implementation with safe type conversions
		trailerConfig := &task.TrailerConfigImpl{
			ClipDuration:        getFloat64(configMap, "clipDuration"),
			ClipCount:           getInt(configMap, "clipCount"),
			SelectionStrategy:   getString(configMap, "selectionStrategy"),
			Width:               getInt(configMap, "width"),
			Height:              getInt(configMap, "height"),
			TargetDuration:      getFloat64(configMap, "targetDuration"),
			AspectRatioStrategy: getString(configMap, "aspectRatioStrategy"),
			MaxWidth:            getInt(configMap, "maxWidth"),
			MaxHeight:           getInt(configMap, "maxHeight"),
		}

		return p.Processor.GenerateTrailer(ctx, inputPath, outputPath+"/trailer.mp4", trailerConfig)
	case "duration":
		duration, err := p.Processor.GetVideoDuration(ctx, inputPath)
		if err != nil {
			return fmt.Errorf("failed to get video duration: %w", err)
		}
		return p.Repository.UpdateVideoDuration(ctx, videoTask.VideoId, duration)
	default:
		return fmt.Errorf("unknown task type: %s", videoTask.TaskType)
	}
}

// Helper functions for safe type conversions
func getFloat64(m map[string]interface{}, key string) float64 {
	v, ok := m[key]
	if !ok {
		return 0
	}

	switch val := v.(type) {
	case float64:
		return val
	case int:
		return float64(val)
	case float32:
		return float64(val)
	default:
		return 0
	}
}

func getInt(m map[string]interface{}, key string) int {
	v, ok := m[key]
	if !ok {
		return 0
	}

	switch val := v.(type) {
	case int:
		return val
	case float64:
		return int(val)
	case float32:
		return int(val)
	default:
		return 0
	}
}

func getString(m map[string]interface{}, key string) string {
	v, ok := m[key]
	if !ok {
		return ""
	}

	if s, ok := v.(string); ok {
		return s
	}
	return ""
}
