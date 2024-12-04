package processor

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"sync"
	"syscall"
	"time"

	"github.com/redis/go-redis/v9"
	"viewtube/config"
	"viewtube/task"
	"viewtube/video"
)

// TaskProcessor handles video processing tasks
type TaskProcessor struct {
	config        config.Config
	rdbPub        *redis.Client
	rdbSub        *redis.Client
	taskQueue     chan task.VideoTask
	ctx           context.Context
	cancel        context.CancelFunc
	videoProcessor *video.Processor
}

// New creates a new task processor
func New(cfg config.Config) (*TaskProcessor, error) {
	ctx, cancel := context.WithCancel(context.Background())

	opt := &redis.Options{
		Addr: fmt.Sprintf("%s:%s", cfg.RedisHost, cfg.RedisPort),
	}

	rdbPub := redis.NewClient(opt)
	rdbSub := redis.NewClient(opt)

	if err := rdbPub.Ping(ctx).Err(); err != nil {
		cancel()
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return &TaskProcessor{
		config:        cfg,
		rdbPub:        rdbPub,
		rdbSub:        rdbSub,
		taskQueue:     make(chan task.VideoTask),
		ctx:           ctx,
		cancel:        cancel,
		videoProcessor: video.NewProcessor(cfg.FFmpegThreads),
	}, nil
}

// Start begins processing tasks
func (p *TaskProcessor) Start() error {
	var wg sync.WaitGroup
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, syscall.SIGINT, syscall.SIGTERM)

	pubsub := p.rdbSub.Subscribe(p.ctx, "video_tasks")
	defer pubsub.Close()

	wg.Add(1)
	go p.processTasksWorker(&wg)

	wg.Add(1)
	go p.receiveMessages(pubsub, &wg)

	<-shutdown
	log.Println("Shutting down gracefully...")

	p.cancel()
	close(p.taskQueue)
	wg.Wait()

	return nil
}

func (p *TaskProcessor) receiveMessages(pubsub *redis.PubSub, wg *sync.WaitGroup) {
	defer wg.Done()
	ch := pubsub.Channel()

	for {
		select {
		case msg := <-ch:
			var videoTask task.VideoTask
			if err := json.Unmarshal([]byte(msg.Payload), &videoTask); err != nil {
				log.Printf("Error unmarshaling task: %v", err)
				continue
			}

			select {
			case p.taskQueue <- videoTask:
				log.Printf("Queued task: %s for file: %s", videoTask.TaskType, videoTask.FilePath)
			case <-p.ctx.Done():
				return
			}

		case <-p.ctx.Done():
			return
		}
	}
}

func (p *TaskProcessor) processTasksWorker(wg *sync.WaitGroup) {
	defer wg.Done()

	for videoTask := range p.taskQueue {
		taskCtx, cancel := context.WithTimeout(p.ctx, p.config.TaskTimeout)
		err := p.processVideoTaskWithRetry(taskCtx, videoTask)
		if err != nil {
			var procErr *task.ProcessingError
			if errors.As(err, &procErr) {
				log.Printf("Task failed permanently: %v", err)
			}
		}
		cancel()
	}
}

func (p *TaskProcessor) processVideoTaskWithRetry(ctx context.Context, videoTask task.VideoTask) error {
	var lastErr error

	for attempt := 0; attempt < p.config.MaxRetries; attempt++ {
		if ctx.Err() != nil {
			return fmt.Errorf("task cancelled: %w", ctx.Err())
		}

		if attempt > 0 {
			backoff := time.Duration(attempt) * p.config.RetryBaseDelay
			time.Sleep(backoff)
		}

		log.Printf("Processing attempt %d for task: %s, file: %s", attempt+1, videoTask.TaskType, videoTask.FilePath)
		
		if err := p.processVideoTask(ctx, videoTask); err != nil {
			lastErr = err
			log.Printf("Attempt %d failed: %v", attempt+1, err)
			continue
		}

		return nil
	}

	return &task.ProcessingError{
		TaskType: videoTask.TaskType,
		Err:      lastErr,
	}
}

func (p *TaskProcessor) processVideoTask(ctx context.Context, videoTask task.VideoTask) error {
	log.Printf("Processing task: %s for file: %s", videoTask.TaskType, videoTask.FilePath)

	absFilePath := filepath.Join(p.config.UploadsVolume, videoTask.FilePath)
	absOutputPath := filepath.Join(p.config.UploadsVolume, videoTask.OutputPath)

	var err error
	switch videoTask.TaskType {
	case "poster":
		err = p.videoProcessor.CreatePoster(ctx, absFilePath, filepath.Join(absOutputPath, "poster.jpg"))
	case "webvtt":
		config := task.WebVTTConfig{
			Interval:   1.0,
			NumColumns: 5,
			Width:     160,
			Height:    90,
		}
		if cfg, ok := videoTask.Config["webvtt"]; ok {
			config = cfg
		}
		err = p.videoProcessor.CreateWebVTT(ctx, absFilePath, absOutputPath, config)
	case "trailer":
		err = p.videoProcessor.CreateTrailer(ctx, absFilePath, filepath.Join(absOutputPath, "trailer.mp4"))
	default:
		return fmt.Errorf("unknown task type: %s", videoTask.TaskType)
	}

	if err != nil {
		return fmt.Errorf("failed to process %s: %w", videoTask.TaskType, err)
	}

	return p.notifyCompletion(ctx, videoTask, absOutputPath)
}

func (p *TaskProcessor) notifyCompletion(ctx context.Context, videoTask task.VideoTask, outputPath string) error {
	completion := task.TaskCompletion{
		TaskType:   videoTask.TaskType,
		FilePath:   videoTask.FilePath,
		OutputPath: outputPath,
		Status:     "completed",
	}

	payload, err := json.Marshal(completion)
	if err != nil {
		return fmt.Errorf("failed to marshal completion: %w", err)
	}

	var lastErr error
	for attempt := 0; attempt < p.config.MaxRetries; attempt++ {
		if ctx.Err() != nil {
			return ctx.Err()
		}

		if attempt > 0 {
			backoff := time.Duration(attempt) * p.config.RetryBaseDelay
			time.Sleep(backoff)
		}

		if err := p.rdbPub.Publish(ctx, "video_completions", payload).Err(); err != nil {
			lastErr = err
			log.Printf("Publish attempt %d failed: %v", attempt+1, err)
			continue
		}

		return nil
	}

	return fmt.Errorf("failed to publish completion after %d attempts: %w", p.config.MaxRetries, lastErr)
} 