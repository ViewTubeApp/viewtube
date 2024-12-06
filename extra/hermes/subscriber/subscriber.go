package subscriber

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"path/filepath"

	"viewtube/repository"

	amqp "github.com/rabbitmq/amqp091-go"
)

type TaskType string

const (
	TaskTypePoster  TaskType = "poster"
	TaskTypeWebVTT  TaskType = "webvtt"
	TaskTypeTrailer TaskType = "trailer"
)

// String converts TaskType to string
func (t TaskType) String() string {
	return string(t)
}

type VideoCompletion struct {
	VideoID    string   `json:"videoId"`
	TaskType   TaskType `json:"taskType"`
	FilePath   string   `json:"filePath"`
	OutputPath string   `json:"outputPath"`
	Status     string   `json:"status"`
}

type Subscriber struct {
	channel     *amqp.Channel
	repository  *repository.VideoRepository
	exchange    string
	queueName   string
	completions map[string]map[TaskType]bool
}

func New(ch *amqp.Channel, db *sql.DB) *Subscriber {
	return &Subscriber{
		channel:     ch,
		repository:  repository.NewVideoRepository(db),
		exchange:    "video/processing",
		queueName:   "video/completions",
		completions: make(map[string]map[TaskType]bool),
	}
}

// Start initializes and starts the subscriber
func (s *Subscriber) Start(ctx context.Context) error {
	// Declare exchange
	if err := s.channel.ExchangeDeclare(
		s.exchange, // name
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
	queue, err := s.channel.QueueDeclare(
		s.queueName, // name
		true,        // durable
		false,       // delete when unused
		false,       // exclusive
		false,       // no-wait
		nil,         // arguments
	)
	if err != nil {
		return fmt.Errorf("failed to declare queue: %w", err)
	}

	// Bind queue to exchange
	if err := s.channel.QueueBind(
		queue.Name,         // queue name
		"video.completion", // routing key
		s.exchange,         // exchange
		false,              // no-wait
		nil,                // arguments
	); err != nil {
		return fmt.Errorf("failed to bind queue: %w", err)
	}

	// Set QoS for fair dispatch
	if err := s.channel.Qos(
		1,     // prefetch count
		0,     // prefetch size
		false, // global
	); err != nil {
		return fmt.Errorf("failed to set QoS: %w", err)
	}

	msgs, err := s.channel.Consume(
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

			// Process the completion
			if err := s.handleCompletion(ctx, msg.Body); err != nil {
				log.Printf("[ERROR] Error handling completion: %v", err)
				if err := msg.Reject(false); err != nil {
					log.Printf("[ERROR] Error rejecting message: %v", err)
				}
				continue
			}

			if err := msg.Ack(false); err != nil {
				log.Printf("[ERROR] Error acknowledging message: %v", err)
			}
		}
	}
}

// extractVideoID gets video ID from completion data or file path
func extractVideoID(completion *VideoCompletion) string {
	if completion.VideoID != "" {
		return completion.VideoID
	}
	return filepath.Base(filepath.Dir(completion.FilePath))
}

// parseCompletion parses the message body into a VideoCompletion
func parseCompletion(message []byte) (*VideoCompletion, error) {
	var completion VideoCompletion
	if err := json.Unmarshal(message, &completion); err != nil {
		return nil, fmt.Errorf("failed to unmarshal completion: %w", err)
	}
	return &completion, nil
}

// handleCompletion processes a completion message
func (s *Subscriber) handleCompletion(ctx context.Context, message []byte) error {
	// Parse completion message
	completion, err := parseCompletion(message)
	if err != nil {
		return err
	}

	// Get video ID
	videoID := extractVideoID(completion)
	log.Printf("[DEBUG] Received completion for video %q, task type: %s", videoID, completion.TaskType)

	// Initialize completion tracking for this video if not exists
	if _, exists := s.completions[videoID]; !exists {
		s.completions[videoID] = make(map[TaskType]bool)
		log.Printf("[DEBUG] Initialized completion tracking for video %q", videoID)
	}

	// Mark this task as completed
	s.completions[videoID][completion.TaskType] = true
	log.Printf("[DEBUG] Marked task %s as completed for video %q", completion.TaskType, videoID)

	// Log current completion status
	log.Printf("[DEBUG] Current completion status for video %q:", videoID)
	allCompleted := true
	for taskType, completed := range s.completions[videoID] {
		log.Printf("[DEBUG] - %s: %v", taskType, completed)
		if !completed {
			allCompleted = false
			log.Printf("[DEBUG] Task %s still pending for video %q", taskType, videoID)
		}
	}

	// If all tasks are completed, mark video as processed
	if allCompleted {
		log.Printf("[DEBUG] All tasks completed for video %q, marking as processed", videoID)
		if err := s.markVideoAsProcessed(ctx, videoID); err != nil {
			return fmt.Errorf("failed to mark video as processed: %w", err)
		}
		// Clean up completion tracking
		delete(s.completions, videoID)
		log.Printf("[DEBUG] Cleaned up completion tracking for video %q", videoID)
	} else {
		log.Printf("[DEBUG] Video %q still has pending tasks", videoID)
	}

	return nil
}

func (s *Subscriber) markVideoAsProcessed(ctx context.Context, videoID string) error {
	// Check if video entity exists
	if _, err := s.repository.GetVideo(ctx, videoID); err != nil {
		log.Printf("[DEBUG] Video %q processed before entity creation", videoID)
		return nil
	}

	if err := s.repository.MarkVideoAsProcessed(ctx, videoID); err != nil {
		return fmt.Errorf("failed to mark video as processed: %w", err)
	}

	log.Printf("[DEBUG] Video %q processing completed", videoID)
	return nil
}
