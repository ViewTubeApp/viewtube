package processor

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"path/filepath"
	"time"

	"viewtube/task"
	"viewtube/video"

	amqp "github.com/rabbitmq/amqp091-go"
)

type Processor struct {
	channel    *amqp.Channel
	processor  *video.Processor
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

func New(ch *amqp.Channel, processor *video.Processor, config Config) *Processor {
	return &Processor{
		channel:    ch,
		processor:  processor,
		config:     config,
		queueName:  "video/tasks",
		exchange:   "video/processing",
		routingKey: "video.task.*",
	}
}

func (p *Processor) Start(ctx context.Context) error {
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

	// Declare queue with unique name for consumer group
	queueName := fmt.Sprintf("%s.worker", p.queueName)
	queue, err := p.channel.QueueDeclare(
		queueName, 	// name
		true,      	// durable
		false,     	// delete when unused
		false,     	// exclusive
		false,     	// no-wait
		amqp.Table{},
	)
	if err != nil {
		return fmt.Errorf("failed to declare queue: %w", err)
	}

	// Bind queue to exchange with specific routing pattern
	if err := p.channel.QueueBind(
		queue.Name,   // queue name
		p.routingKey, // routing key
		p.exchange,   // exchange
		false,        // no-wait
		nil,         // arguments
	); err != nil {
		return fmt.Errorf("failed to bind queue: %w", err)
	}

	// Set QoS for fair dispatch
	if err := p.channel.Qos(
		1,     // prefetch count
		0,     // prefetch size
		false, // global
	); err != nil {
		return fmt.Errorf("failed to set QoS: %w", err)
	}

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

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case msg, ok := <-msgs:
			if !ok {
				return fmt.Errorf("channel closed")
			}

			// Process the task
			if err := p.handleTask(ctx, string(msg.Body)); err != nil {
				log.Printf("Error handling task: %v", err)
				// Reject message and requeue
				if err := msg.Reject(true); err != nil {
					log.Printf("Error rejecting message: %v", err)
				}
				continue
			}

			// Acknowledge message
			if err := msg.Ack(false); err != nil {
				log.Printf("Error acknowledging message: %v", err)
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

	// Publish completion to RabbitMQ
	return p.channel.PublishWithContext(ctx,
		p.exchange,           // exchange
		"video.completion",   // routing key
		false,               // mandatory
		false,               // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        data,
		},
	)
}
