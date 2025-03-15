package worker

import (
	"context"
	"testing"
	"time"

	"viewtube/amqpconfig"
	"viewtube/repository"
	"viewtube/task"
	"viewtube/test/mocks"
	"viewtube/video"

	"github.com/rabbitmq/amqp091-go"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// Define repository status constants for testing
const (
	StatusCompleted = "completed"
	StatusFailed    = "failed"
)

// TestNewTaskProcessor tests the NewTaskProcessor function
func TestNewTaskProcessor(t *testing.T) {
	// Create config
	config := Config{
		TaskTimeout:    30 * time.Second,
		MaxRetries:     3,
		RetryBaseDelay: 1 * time.Second,
		UploadsVolume:  "/uploads",
	}

	// Create task processor
	processor := NewTaskProcessor(
		&amqp091.Channel{},            // Using a real Channel type but it won't be used
		&video.FFmpegProcessor{},      // Using a real FFmpegProcessor type but it won't be used
		&repository.VideoRepository{}, // Using a real VideoRepository type but it won't be used
		config,
	)

	// Verify processor
	assert.NotNil(t, processor)
	assert.Equal(t, amqpconfig.Queues.Tasks, processor.queueName)
	assert.Equal(t, amqpconfig.Exchange, processor.exchange)
}

// TestHandlePosterTask tests handling a poster task
func TestHandlePosterTask(t *testing.T) {
	// Create mock dependencies
	mockChannel := &mocks.MockChannel{}
	mockFFmpeg := &mocks.MockFFmpegProcessor{}
	mockRepo := &mocks.MockVideoRepository{}

	// Create config
	config := mocks.TaskProcessorConfig{
		TaskTimeout:    30 * time.Second,
		MaxRetries:     3,
		RetryBaseDelay: 1 * time.Second,
		UploadsVolume:  "/uploads",
	}

	// Create a test-specific task processor
	processor := &mocks.TestTaskProcessor{
		Channel:    mockChannel,
		Processor:  mockFFmpeg,
		Repository: mockRepo,
		Config:     config,
		QueueName:  amqpconfig.Queues.Tasks,
		Exchange:   amqpconfig.Exchange,
	}

	// Create test video task
	videoTask := task.VideoTask{
		VideoId:    123,
		FilePath:   "test/video.mp4",
		TaskType:   "poster",
		OutputPath: "test/output",
	}

	// Set up expectations
	mockRepo.On("BeginTask", mock.Anything, videoTask.VideoId, "poster").Return(nil)

	// Expect CreatePoster to be called with correct paths
	inputPath := "/uploads/test/video.mp4"
	outputPath := "/uploads/test/output/poster.jpg"
	mockFFmpeg.On("GeneratePoster", mock.Anything, inputPath, outputPath).Return(nil)

	// Expect CompleteTask to be called with success status
	mockRepo.On("CompleteTask", mock.Anything, videoTask.VideoId, "poster", StatusCompleted, nil).Return(nil)

	// Call the method under test
	ctx := context.Background()
	err := processor.HandleTask(ctx, videoTask)

	// Verify expectations
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
	mockFFmpeg.AssertExpectations(t)
}

// TestHandleWebVTTTask tests handling a WebVTT task
func TestHandleWebVTTTask(t *testing.T) {
	// Create mock dependencies
	mockChannel := &mocks.MockChannel{}
	mockFFmpeg := &mocks.MockFFmpegProcessor{}
	mockRepo := &mocks.MockVideoRepository{}

	// Create config
	config := mocks.TaskProcessorConfig{
		TaskTimeout:    30 * time.Second,
		MaxRetries:     3,
		RetryBaseDelay: 1 * time.Second,
		UploadsVolume:  "/uploads",
	}

	// Create a test-specific task processor
	processor := &mocks.TestTaskProcessor{
		Channel:    mockChannel,
		Processor:  mockFFmpeg,
		Repository: mockRepo,
		Config:     config,
		QueueName:  amqpconfig.Queues.Tasks,
		Exchange:   amqpconfig.Exchange,
	}

	// Create WebVTT config
	webVTTConfig := map[string]interface{}{
		"webvtt": map[string]interface{}{
			"interval":    5.0,
			"numColumns":  4,
			"width":       160,
			"height":      90,
			"maxDuration": 600.0,
		},
	}

	// Create test video task
	videoTask := task.VideoTask{
		VideoId:    456,
		FilePath:   "test/video.mp4",
		TaskType:   "webvtt",
		OutputPath: "test/output",
		Config:     webVTTConfig,
	}

	// Set up expectations
	mockRepo.On("BeginTask", mock.Anything, videoTask.VideoId, "webvtt").Return(nil)

	// Expect GenerateWebVTT to be called with correct paths and config
	inputPath := "/uploads/test/video.mp4"
	outputPath := "/uploads/test/output"
	mockFFmpeg.On("GenerateWebVTT", mock.Anything, inputPath, outputPath, mock.AnythingOfType("*task.WebVTTConfigImpl")).Return(nil)

	// Expect CompleteTask to be called with success status
	mockRepo.On("CompleteTask", mock.Anything, videoTask.VideoId, "webvtt", StatusCompleted, nil).Return(nil)

	// Call the method under test
	ctx := context.Background()
	err := processor.HandleTask(ctx, videoTask)

	// Verify expectations
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
	mockFFmpeg.AssertExpectations(t)
}

// TestHandleTrailerTask tests handling a trailer task
func TestHandleTrailerTask(t *testing.T) {
	// Create mock dependencies
	mockChannel := &mocks.MockChannel{}
	mockFFmpeg := &mocks.MockFFmpegProcessor{}
	mockRepo := &mocks.MockVideoRepository{}

	// Create config
	config := mocks.TaskProcessorConfig{
		TaskTimeout:    30 * time.Second,
		MaxRetries:     3,
		RetryBaseDelay: 1 * time.Second,
		UploadsVolume:  "/uploads",
	}

	// Create a test-specific task processor
	processor := &mocks.TestTaskProcessor{
		Channel:    mockChannel,
		Processor:  mockFFmpeg,
		Repository: mockRepo,
		Config:     config,
		QueueName:  amqpconfig.Queues.Tasks,
		Exchange:   amqpconfig.Exchange,
	}

	// Create trailer config
	trailerConfig := map[string]interface{}{
		"trailer": map[string]interface{}{
			"clipDuration":        3.0,
			"clipCount":           5,
			"selectionStrategy":   "uniform",
			"width":               640,
			"height":              360,
			"targetDuration":      15.0,
			"aspectRatioStrategy": "fit",
			"maxWidth":            1280,
			"maxHeight":           720,
		},
	}

	// Create test video task
	videoTask := task.VideoTask{
		VideoId:    789,
		FilePath:   "test/video.mp4",
		TaskType:   "trailer",
		OutputPath: "test/output",
		Config:     trailerConfig,
	}

	// Set up expectations
	mockRepo.On("BeginTask", mock.Anything, videoTask.VideoId, "trailer").Return(nil)

	// Expect GenerateTrailer to be called with correct paths and config
	inputPath := "/uploads/test/video.mp4"
	outputPath := "/uploads/test/output/trailer.mp4"
	mockFFmpeg.On("GenerateTrailer", mock.Anything, inputPath, outputPath, mock.AnythingOfType("*task.TrailerConfigImpl")).Return(nil)

	// Expect CompleteTask to be called with success status
	mockRepo.On("CompleteTask", mock.Anything, videoTask.VideoId, "trailer", StatusCompleted, nil).Return(nil)

	// Call the method under test
	ctx := context.Background()
	err := processor.HandleTask(ctx, videoTask)

	// Verify expectations
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
	mockFFmpeg.AssertExpectations(t)
}

// TestHandleUnknownTask tests handling an unknown task type
func TestHandleUnknownTask(t *testing.T) {
	// Create mock dependencies
	mockChannel := &mocks.MockChannel{}
	mockFFmpeg := &mocks.MockFFmpegProcessor{}
	mockRepo := &mocks.MockVideoRepository{}

	// Create config
	config := mocks.TaskProcessorConfig{
		TaskTimeout:    30 * time.Second,
		MaxRetries:     3,
		RetryBaseDelay: 1 * time.Second,
		UploadsVolume:  "/uploads",
	}

	// Create a test-specific task processor
	processor := &mocks.TestTaskProcessor{
		Channel:    mockChannel,
		Processor:  mockFFmpeg,
		Repository: mockRepo,
		Config:     config,
		QueueName:  amqpconfig.Queues.Tasks,
		Exchange:   amqpconfig.Exchange,
	}

	// Create test video task with unknown task type
	videoTask := task.VideoTask{
		VideoId:    999,
		FilePath:   "test/video.mp4",
		TaskType:   "unknown_task_type",
		OutputPath: "test/output",
	}

	// Set up expectations
	mockRepo.On("BeginTask", mock.Anything, videoTask.VideoId, "unknown_task_type").Return(nil)

	// Expect CompleteTask to be called with failure status and error
	mockRepo.On("CompleteTask", mock.Anything, videoTask.VideoId, "unknown_task_type", StatusFailed, mock.MatchedBy(func(err error) bool {
		return err != nil && err.Error() == "unknown task type: unknown_task_type"
	})).Return(nil)

	// Call the method under test
	ctx := context.Background()
	err := processor.HandleTask(ctx, videoTask)

	// Verify expectations
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "unknown task type: unknown_task_type")
	mockRepo.AssertExpectations(t)
}

// TestHandleDurationTask tests handling a duration task
func TestHandleDurationTask(t *testing.T) {
	// Create mock dependencies
	mockChannel := &mocks.MockChannel{}
	mockFFmpeg := &mocks.MockFFmpegProcessor{}
	mockRepo := &mocks.MockVideoRepository{}

	// Create config
	config := mocks.TaskProcessorConfig{
		TaskTimeout:    30 * time.Second,
		MaxRetries:     3,
		RetryBaseDelay: 1 * time.Second,
		UploadsVolume:  "/uploads",
	}

	// Create a test-specific task processor
	processor := &mocks.TestTaskProcessor{
		Channel:    mockChannel,
		Processor:  mockFFmpeg,
		Repository: mockRepo,
		Config:     config,
		QueueName:  amqpconfig.Queues.Tasks,
		Exchange:   amqpconfig.Exchange,
	}

	// Create test video task
	videoTask := task.VideoTask{
		VideoId:    555,
		FilePath:   "test/video.mp4",
		TaskType:   "duration",
		OutputPath: "test/output",
	}

	// Set up expectations
	mockRepo.On("BeginTask", mock.Anything, videoTask.VideoId, "duration").Return(nil)

	// Expect GetVideoDuration to be called with correct path
	inputPath := "/uploads/test/video.mp4"
	mockFFmpeg.On("GetVideoDuration", mock.Anything, inputPath).Return(120.5, nil)

	// Expect UpdateVideoDuration to be called with the duration
	mockRepo.On("UpdateVideoDuration", mock.Anything, videoTask.VideoId, 120.5).Return(nil)

	// Expect CompleteTask to be called with success status
	mockRepo.On("CompleteTask", mock.Anything, videoTask.VideoId, "duration", StatusCompleted, nil).Return(nil)

	// Call the method under test
	ctx := context.Background()
	err := processor.HandleTask(ctx, videoTask)

	// Verify expectations
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
	mockFFmpeg.AssertExpectations(t)
}
