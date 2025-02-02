package repository

import (
	"context"
	"database/sql"
	"fmt"
)

type VideoStatus string
type TaskType string

const (
	StatusPending    VideoStatus = "pending"
	StatusProcessing VideoStatus = "processing"
	StatusCompleted  VideoStatus = "completed"
	StatusFailed     VideoStatus = "failed"
)

type VideoRepository struct {
	db *sql.DB
}

// NewVideoRepository creates a new video repository instance
func NewVideoRepository(db *sql.DB) *VideoRepository {
	return &VideoRepository{db: db}
}

// BeginTask marks a task as processing
func (r *VideoRepository) BeginTask(ctx context.Context, videoId int, taskType TaskType) error {
	query := `
		UPDATE viewtube_video_task 
		SET status = $1, started_at = NOW() 
		WHERE video_id = $2 AND task_type = $3 AND status = $4
	`
	result, err := r.db.ExecContext(ctx, query,
		StatusProcessing, videoId, taskType, StatusPending)
	if err != nil {
		return fmt.Errorf("failed to begin task: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("task not found or already processing")
	}

	return nil
}

// CompleteTask marks a task as completed or failed and updates video status if needed
func (r *VideoRepository) CompleteTask(ctx context.Context, videoId int, taskType TaskType, status VideoStatus, taskErr error) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Update task status
	query := `
		UPDATE viewtube_video_task 
		SET status = $1, completed_at = NOW(), error = $2
		WHERE video_id = $3 AND task_type = $4 AND status = $5
	`
	var errMsg *string
	if taskErr != nil {
		msg := taskErr.Error()
		errMsg = &msg
	}

	result, err := tx.ExecContext(ctx, query,
		status, errMsg, videoId, taskType, StatusProcessing)
	if err != nil {
		return fmt.Errorf("failed to complete task: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("task not found or not processing")
	}

	// Check if all tasks are completed
	query = `
		SELECT 
			CASE 
				WHEN EXISTS (
					SELECT 1 FROM viewtube_video_task 
					WHERE video_id = $1 AND status = 'failed'
				) THEN 'failed'
				WHEN NOT EXISTS (
					SELECT 1 FROM viewtube_video_task 
					WHERE video_id = $1 AND status != 'completed'
				) THEN 'completed'
				ELSE 'processing'
			END
	`
	var videoStatus VideoStatus
	err = tx.QueryRowContext(ctx, query, videoId).Scan(&videoStatus)
	if err != nil {
		return fmt.Errorf("failed to check video status: %w", err)
	}

	// Update video status if all tasks are done
	if videoStatus == StatusCompleted || videoStatus == StatusFailed {
		query = `
			UPDATE viewtube_video 
			SET status = $1, processing_completed_at = NOW()
			WHERE id = $2
		`
		_, err = tx.ExecContext(ctx, query, videoStatus, videoId)
		if err != nil {
			return fmt.Errorf("failed to update video status: %w", err)
		}
	}

	return tx.Commit()
}

// UpdateVideoDuration updates the video duration
func (r *VideoRepository) UpdateVideoDuration(ctx context.Context, videoId int, duration float64) error {
	query := `
		UPDATE viewtube_video SET video_duration = $1 WHERE id = $2
	`
	_, err := r.db.ExecContext(ctx, query, duration, videoId)
	return err
}
