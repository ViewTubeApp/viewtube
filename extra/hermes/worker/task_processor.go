package worker

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"path/filepath"
	"time"

	"viewtube/amqpconfig"
	"viewtube/repository"
	"viewtube/task"
	"viewtube/video"

	amqp "github.com/rabbitmq/amqp091-go"
)

// TaskProcessor handles video processing tasks from the queue
type TaskProcessor struct {
	channel    *amqp.Channel
	processor  *video.FFmpegProcessor
	repository *repository.VideoRepository
	config     Config
	queueName  string
	exchange   string
}

type Config struct {
	TaskTimeout    time.Duration
	MaxRetries     int
	RetryBaseDelay time.Duration
	UploadsVolume  string
}

func NewTaskProcessor(ch *amqp.Channel, processor *video.FFmpegProcessor, repo *repository.VideoRepository, config Config) *TaskProcessor {
	return &TaskProcessor{
		channel:    ch,
		processor:  processor,
		repository: repo,
		config:     config,
		queueName:  amqpconfig.Queues.Tasks,
		exchange:   amqpconfig.Exchange,
	}
}

func (p *TaskProcessor) Start(ctx context.Context) error {
	// Set QoS for parallel processing
	if err := p.channel.Qos(
		3,     // prefetch count - adjust based on your needs
		0,     // prefetch size
		false, // global
	); err != nil {
		return fmt.Errorf("failed to set QoS: %w", err)
	}

	// Declare exchange
	if err := p.channel.ExchangeDeclare(
		p.exchange, // name
		"topic",    // type
		true,       // durable
		false,      // auto-deleted
		false,      // internal
		false,      // no-wait
		nil,        // arguments
	); err != nil {
		return fmt.Errorf("failed to declare exchange: %w", err)
	}

	// Declare queue with quorum settings
	queue, err := p.channel.QueueDeclare(
		p.queueName, // name
		true,        // durable
		false,       // delete when unused
		false,       // exclusive
		false,       // no-wait
		amqp.Table{
			"x-queue-type":           "quorum",
			"x-max-in-memory-length": 100,
		},
	)
	if err != nil {
		return fmt.Errorf("failed to declare queue: %w", err)
	}

	// Bind queue to exchange
	if err := p.channel.QueueBind(
		queue.Name,                  // queue name
		amqpconfig.RoutingKeys.Task, // routing key
		p.exchange,                  // exchange
		false,                       // no-wait
		nil,                         // args
	); err != nil {
		return fmt.Errorf("failed to bind queue: %w", err)
	}

	// Start consuming messages
	msgs, err := p.channel.Consume(
		queue.Name, // queue
		"",         // consumer
		false,      // auto-ack
		false,      // exclusive
		false,      // no-local
		false,      // no-wait
		nil,        // args
	)
	if err != nil {
		return fmt.Errorf("failed to register a consumer: %w", err)
	}

	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case msg, ok := <-msgs:
				if !ok {
					return
				}

				// Process the task
				var videoTask task.VideoTask
				if err := json.Unmarshal(msg.Body, &videoTask); err != nil {
					log.Printf("[ERROR] Error unmarshaling task: %v", err)
					msg.Nack(false, true)
					continue
				}

				if err := p.handleTask(ctx, videoTask); err != nil {
					log.Printf("[ERROR] Error handling task: %v", err)
					msg.Nack(false, true)
					continue
				}

				msg.Ack(false)
			}
		}
	}()

	return nil
}

func (p *TaskProcessor) handleTask(ctx context.Context, videoTask task.VideoTask) error {
	// Begin task processing
	if err := p.repository.BeginTask(ctx, videoTask.VideoID, repository.TaskType(videoTask.TaskType)); err != nil {
		return fmt.Errorf("failed to begin task: %w", err)
	}

	// Process the task
	err := p.processTask(ctx, videoTask)

	// Complete task with appropriate status
	status := repository.StatusCompleted
	if err != nil {
		status = repository.StatusFailed
	}

	if completeErr := p.repository.CompleteTask(ctx, videoTask.VideoID, repository.TaskType(videoTask.TaskType), status, err); completeErr != nil {
		if err != nil {
			return fmt.Errorf("task failed with: %v, and failed to update status: %v", err, completeErr)
		}
		return fmt.Errorf("failed to complete task: %w", completeErr)
	}

	return err
}

func (p *TaskProcessor) processTask(ctx context.Context, videoTask task.VideoTask) error {
	log.Printf("[DEBUG] Processing task: %s for video: %s", videoTask.TaskType, videoTask.VideoID)

	// Construct absolute paths
	inputPath := filepath.Join(p.config.UploadsVolume, videoTask.FilePath)
	outputPath := filepath.Join(p.config.UploadsVolume, videoTask.OutputPath)

	switch videoTask.TaskType {
	case "poster":
		return p.processor.CreatePoster(ctx, inputPath, filepath.Join(outputPath, "poster.jpg"))
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
		configData, err := json.Marshal(configMap)
		if err != nil {
			return fmt.Errorf("failed to marshal WebVTT config: %w", err)
		}
		var configImpl task.WebVTTConfigImpl
		if err := json.Unmarshal(configData, &configImpl); err != nil {
			return fmt.Errorf("failed to unmarshal WebVTT config: %w", err)
		}
		return p.processor.CreateWebVTT(ctx, inputPath, outputPath, &configImpl)
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
		configData, err := json.Marshal(configMap)
		if err != nil {
			return fmt.Errorf("failed to marshal trailer config: %w", err)
		}
		var configImpl task.TrailerConfigImpl
		if err := json.Unmarshal(configData, &configImpl); err != nil {
			return fmt.Errorf("failed to unmarshal trailer config: %w", err)
		}
		return p.processor.CreateTrailer(ctx, inputPath, filepath.Join(outputPath, "trailer.mp4"), &configImpl)
	default:
		return fmt.Errorf("unknown task type: %s", videoTask.TaskType)
	}
}
