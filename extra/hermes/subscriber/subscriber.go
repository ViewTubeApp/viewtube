package subscriber

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"path/filepath"

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
	channel   *amqp.Channel
	db        *sql.DB
	exchange  string
	queueName string
}

func New(ch *amqp.Channel, db *sql.DB) *Subscriber {
	return &Subscriber{
		channel:   ch,
		db:        db,
		exchange:  "video/processing",
		queueName: "video/completions",
	}
}

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
		nil,        // arguments
	)
	if err != nil {
		return fmt.Errorf("failed to declare queue: %w", err)
	}

	// Bind queue to exchange
	if err := s.channel.QueueBind(
		queue.Name,                    // queue name
		"video.completion.#",          // routing key
		s.exchange,                    // exchange
		false,                        // no-wait
		nil,                         // arguments
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

			if err := s.handleMessage(ctx, msg.Body); err != nil {
				log.Printf("Error handling message: %v", err)
				// Reject message without requeue on processing error
				if err := msg.Reject(false); err != nil {
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

func (s *Subscriber) handleMessage(ctx context.Context, message []byte) error {
	var completion VideoCompletion
	if err := json.Unmarshal(message, &completion); err != nil {
		return fmt.Errorf("failed to unmarshal completion: %w", err)
	}

	// Extract videoId from file path if not provided
	videoID := completion.VideoID
	if videoID == "" {
		videoID = filepath.Base(filepath.Dir(completion.FilePath))
	}

	// Update video record when all tasks are completed
	query := `UPDATE viewtube_video SET processed = true WHERE url LIKE $1`
	result, err := s.db.ExecContext(ctx, query, "%"+videoID+"%")
	if err != nil {
		return fmt.Errorf("failed to update video: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		log.Printf("Video %q processed before entity creation", videoID)
		return nil
	}

	log.Printf("Video %q processing completed", videoID)
	return nil
}

