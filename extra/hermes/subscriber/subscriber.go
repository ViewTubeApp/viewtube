package subscriber

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"path/filepath"

	"github.com/redis/go-redis/v9"
)

type TaskType string

const (
	TaskTypePoster  TaskType = "poster"
	TaskTypeWebVTT  TaskType = "webvtt"
	TaskTypeTrailer TaskType = "trailer"
)

// String converts TaskType to string for Redis operations
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
	redis *redis.Client
	db    *sql.DB
}

func New(redisClient *redis.Client, db *sql.DB) *Subscriber {
	return &Subscriber{
		redis: redisClient,
		db:    db,
	}
}

func (s *Subscriber) Start(ctx context.Context) error {
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
			// BRPOP blocks until a message is available
			result, err := s.redis.BRPop(ctx, 0, "video_completions").Result()
			if err != nil {
				log.Printf("Error polling completions: %v", err)
				continue
			}

			message := result[1]
			if err := s.handleMessage(ctx, message); err != nil {
				log.Printf("Error handling message: %v", err)
			}
		}
	}
}

func (s *Subscriber) handleMessage(ctx context.Context, message string) error {
	var completion VideoCompletion
	if err := json.Unmarshal([]byte(message), &completion); err != nil {
		return fmt.Errorf("failed to unmarshal completion: %w", err)
	}

	// Extract videoId from either the message or the file path
	videoID := completion.VideoID
	if videoID == "" {
		videoID = filepath.Base(filepath.Dir(completion.FilePath))
	}

	// Remove the completed task
	if err := s.redis.SRem(ctx, videoID, completion.TaskType.String()).Err(); err != nil {
		return fmt.Errorf("failed to remove task: %w", err)
	}
	log.Printf("Video %q task completed: %s", videoID, completion.TaskType)

	// Get remaining tasks
	remaining, err := s.redis.SMembers(ctx, videoID).Result()
	if err != nil {
		return fmt.Errorf("failed to get remaining tasks: %w", err)
	}

	// If there are remaining tasks, log and return
	if len(remaining) > 0 {
		log.Printf("Video %q has remaining tasks: %v", videoID, remaining)
		return nil
	}

	// No tasks remaining, clean up Redis key
	if err := s.redis.Del(ctx, videoID).Err(); err != nil {
		return fmt.Errorf("failed to delete key: %w", err)
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

