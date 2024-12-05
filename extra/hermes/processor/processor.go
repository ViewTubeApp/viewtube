package processor

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"path/filepath"
	"time"

	"github.com/redis/go-redis/v9"
	"viewtube/task"
	"viewtube/video"
)

type Processor struct {
	redis     *redis.Client
	processor *video.Processor
	config    Config
}

type Config struct {
	TaskTimeout    time.Duration
	MaxRetries     int
	RetryBaseDelay time.Duration
	UploadsVolume  string
}

func New(redis *redis.Client, processor *video.Processor, config Config) *Processor {
	return &Processor{
		redis:     redis,
		processor: processor,
		config:    config,
	}
}

func (p *Processor) Start(ctx context.Context) error {
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
			// BRPOP blocks until a message is available
			result, err := p.redis.BRPop(ctx, 0, "video_tasks").Result()
			if err != nil {
				log.Printf("Error polling tasks: %v", err)
				continue
			}

			message := result[1]
			if err := p.handleTask(ctx, message); err != nil {
				log.Printf("Error handling task: %v", err)
			}
		}
	}
}

func (p *Processor) handleTask(ctx context.Context, message string) error {
	var task task.VideoTask
	if err := json.Unmarshal([]byte(message), &task); err != nil {
		return fmt.Errorf("failed to unmarshal task: %w", err)
	}

	// Extract videoId from file path if not provided
	if task.VideoID == "" {
		task.VideoID = filepath.Base(filepath.Dir(task.FilePath))
	}

	// Process the task with retries
	var lastErr error
	for i := 0; i < p.config.MaxRetries; i++ {
		taskCtx, cancel := context.WithTimeout(ctx, p.config.TaskTimeout)
		defer cancel()

		log.Printf("Processing attempt %d for task: %s, file: %s, id: %s", i+1, task.TaskType, task.FilePath, task.VideoID)

		if err := p.processTask(taskCtx, task); err != nil {
			lastErr = err
			log.Printf("Attempt %d failed: %v", i+1, err)
			time.Sleep(p.config.RetryBaseDelay * time.Duration(i+1))
			continue
		}

		// Publish successful completion
		if err := p.publishCompletion(ctx, task, "completed", nil); err != nil {
			return fmt.Errorf("failed to publish completion: %w", err)
		}

		return nil
	}

	// Publish failed completion
	if err := p.publishCompletion(ctx, task, "failed", lastErr); err != nil {
		return fmt.Errorf("failed to publish failure: %w", err)
	}

	return fmt.Errorf("task failed after %d retries: %v", p.config.MaxRetries, lastErr)
}

func (p *Processor) processTask(ctx context.Context, task task.VideoTask) error {
	log.Printf("Processing task: %s for file: %s", task.TaskType, task.VideoID)

	// Construct absolute paths
	inputPath := filepath.Join(p.config.UploadsVolume, task.FilePath)
	outputPath := filepath.Join(p.config.UploadsVolume, task.OutputPath)

	switch task.TaskType {
	case "poster":
		return p.processor.CreatePoster(ctx, inputPath, filepath.Join(outputPath, "poster.jpg"))
	case "webvtt":
		if task.Config == nil {
			return fmt.Errorf("missing WebVTT config")
		}
		config, ok := task.Config["webvtt"]
		if !ok {
			return fmt.Errorf("missing WebVTT config")
		}
		return p.processor.CreateWebVTT(ctx, inputPath, outputPath, config)
	case "trailer":
		return p.processor.CreateTrailer(ctx, inputPath, filepath.Join(outputPath, "trailer.mp4"))
	default:
		return fmt.Errorf("unknown task type: %s", task.TaskType)
	}
}

func (p *Processor) publishCompletion(ctx context.Context, videoTask task.VideoTask, status string, err error) error {
	completion := task.TaskCompletion{
		VideoID:    videoTask.VideoID,
		TaskType:   videoTask.TaskType,
		FilePath:   videoTask.FilePath,
		OutputPath: videoTask.OutputPath,
		Status:     status,
	}

	if err != nil {
		completion.Error = err.Error()
	}

	data, err := json.Marshal(completion)
	if err != nil {
		return fmt.Errorf("failed to marshal completion: %w", err)
	}

	if err := p.redis.LPush(ctx, "video_completions", data).Err(); err != nil {
		return fmt.Errorf("failed to publish completion: %w", err)
	}

	return nil
}

