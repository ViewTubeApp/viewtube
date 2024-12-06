package worker

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"path/filepath"
	"time"

	"viewtube/amqpconfig"
	"viewtube/task"
	"viewtube/video"

	amqp "github.com/rabbitmq/amqp091-go"
)

// TaskProcessor handles video processing tasks from the queue
type TaskProcessor struct {
	channel    *amqp.Channel
	processor  *video.FFmpegProcessor
	config     Config
	queueName  string
	exchange   string
	routingKey string
}

type Config struct {
	TaskTimeout    time.Duration
	MaxRetries     int
	RetryBaseDelay time.Duration
	UploadsVolume  string
}

func NewTaskProcessor(ch *amqp.Channel, processor *video.FFmpegProcessor, config Config) *TaskProcessor {
	return &TaskProcessor{
		channel:    ch,
		processor:  processor,
		config:     config,
		queueName:  amqpconfig.Queues.Tasks,
		exchange:   amqpconfig.Exchange,
		routingKey: amqpconfig.RoutingKeys.Task,
	}
}

func (p *TaskProcessor) Start(ctx context.Context) error {
	// Set QoS for fair dispatch
	if err := p.channel.Qos(
		1,     // prefetch count
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

	// Declare queue
	queue, err := p.channel.QueueDeclare(
		p.queueName, // name
		true,        // durable
		false,       // delete when unused
		false,       // exclusive
		false,       // no-wait
		nil,         // args
	)
	if err != nil {
		return fmt.Errorf("failed to declare queue: %w", err)
	}

	// Bind queue to exchange
	if err := p.channel.QueueBind(
		queue.Name,   // queue name
		p.routingKey, // routing key
		p.exchange,   // exchange
		false,        // no-wait
		nil,          // args
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

				// Process all tasks in the message
				var tasks []task.VideoTask
				if err := json.Unmarshal(msg.Body, &tasks); err != nil {
					log.Printf("[ERROR] Error unmarshaling tasks: %v", err)
					msg.Nack(false, true)
					continue
				}

				// Process each task
				var failed bool
				for _, task := range tasks {
					if err := p.handleTask(ctx, task); err != nil {
						log.Printf("[ERROR] Error handling task: %v", err)
						failed = true
						break
					}
				}

				if failed {
					msg.Nack(false, true)
				} else {
					msg.Ack(false)
				}
			}
		}
	}()

	return nil
}

func (p *TaskProcessor) handleTask(ctx context.Context, task task.VideoTask) error {
	// Extract videoId from file path if not provided
	if task.VideoID == "" {
		task.VideoID = filepath.Base(filepath.Dir(task.FilePath))
	}

	// Process the task with retries
	var lastErr error
	for i := 0; i < p.config.MaxRetries; i++ {
		taskCtx, cancel := context.WithTimeout(ctx, p.config.TaskTimeout)
		defer cancel()

		log.Printf("[DEBUG] Processing attempt %d for task: %s, file: %s, id: %s", i+1, task.TaskType, task.FilePath, task.VideoID)

		if err := p.processTask(taskCtx, task); err != nil {
			lastErr = err
			log.Printf("[ERROR] Attempt %d failed: %v", i+1, err)
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
			log.Printf("[ERROR] Missing WebVTT config for video: %s", videoTask.VideoID)
			return fmt.Errorf("missing WebVTT config")
		}
		rawConfig, ok := videoTask.Config["webvtt"]
		if !ok {
			log.Printf("[ERROR] Missing WebVTT config key for video: %s", videoTask.VideoID)
			return fmt.Errorf("missing WebVTT config")
		}
		configMap, ok := rawConfig.(map[string]interface{})
		if !ok {
			log.Printf("[ERROR] Invalid WebVTT config type for video: %s", videoTask.VideoID)
			return fmt.Errorf("invalid WebVTT config type")
		}
		configData, err := json.Marshal(configMap)
		if err != nil {
			log.Printf("[ERROR] Failed to marshal WebVTT config for video: %s: %v", videoTask.VideoID, err)
			return fmt.Errorf("failed to marshal WebVTT config: %w", err)
		}
		var configImpl task.WebVTTConfigImpl
		if err := json.Unmarshal(configData, &configImpl); err != nil {
			log.Printf("[ERROR] Failed to unmarshal WebVTT config for video: %s: %v", videoTask.VideoID, err)
			return fmt.Errorf("failed to unmarshal WebVTT config: %w", err)
		}
		return p.processor.CreateWebVTT(ctx, inputPath, outputPath, &configImpl)
	case "trailer":
		if videoTask.Config == nil {
			log.Printf("[ERROR] Missing trailer config for video: %s", videoTask.VideoID)
			return fmt.Errorf("missing trailer config")
		}
		rawConfig, ok := videoTask.Config["trailer"]
		if !ok {
			log.Printf("[ERROR] Missing trailer config key for video: %s", videoTask.VideoID)
			return fmt.Errorf("missing trailer config")
		}
		configMap, ok := rawConfig.(map[string]interface{})
		if !ok {
			log.Printf("[ERROR] Invalid trailer config type for video: %s", videoTask.VideoID)
			return fmt.Errorf("invalid trailer config type")
		}
		configData, err := json.Marshal(configMap)
		if err != nil {
			log.Printf("[ERROR] Failed to marshal trailer config for video: %s: %v", videoTask.VideoID, err)
			return fmt.Errorf("failed to marshal trailer config: %w", err)
		}
		var configImpl task.TrailerConfigImpl
		if err := json.Unmarshal(configData, &configImpl); err != nil {
			log.Printf("[ERROR] Failed to unmarshal trailer config for video: %s: %v", videoTask.VideoID, err)
			return fmt.Errorf("failed to unmarshal trailer config: %w", err)
		}
		return p.processor.CreateTrailer(ctx, inputPath, filepath.Join(outputPath, "trailer.mp4"), &configImpl)
	default:
		log.Printf("[ERROR] Unknown task type: %s for video: %s", videoTask.TaskType, videoTask.VideoID)
		return fmt.Errorf("unknown task type: %s", videoTask.TaskType)
	}
}

func (p *TaskProcessor) publishCompletion(ctx context.Context, videoTask task.VideoTask, status string, err error) error {
	log.Printf("[DEBUG] Publishing completion for task: %s, video: %s, status: %s", videoTask.TaskType, videoTask.VideoID, status)
	completion := task.TaskCompletion{
		VideoID:    videoTask.VideoID,
		TaskType:   videoTask.TaskType,
		FilePath:   videoTask.FilePath,
		OutputPath: videoTask.OutputPath,
		Status:     status,
	}

	if err != nil {
		completion.Error = err.Error()
		log.Printf("[ERROR] Task failed: %s for video: %s: %v", videoTask.TaskType, videoTask.VideoID, err)
	}

	data, err := json.Marshal(completion)
	if err != nil {
		return fmt.Errorf("failed to marshal completion: %w", err)
	}

	// Publish completion to RabbitMQ
	return p.channel.PublishWithContext(ctx,
		p.exchange,                        // exchange
		amqpconfig.RoutingKeys.Completion, // routing key
		false,                             // mandatory
		false,                             // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        data,
		},
	)
}
