package repository

import (
	"context"
	"database/sql"
	"fmt"
)

// VideoRepository handles video-related database operations
type VideoRepository struct {
	db *sql.DB
}

// NewVideoRepository creates a new video repository instance
func NewVideoRepository(db *sql.DB) *VideoRepository {
	return &VideoRepository{db: db}
}

// GetVideo retrieves a video by ID
func (r *VideoRepository) GetVideo(ctx context.Context, videoID string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM viewtube_video WHERE url LIKE $1)`
	var exists bool
	err := r.db.QueryRowContext(ctx, query, "%"+videoID+"%").Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check video existence: %w", err)
	}
	return exists, nil
}

// MarkVideoAsProcessed updates the video status in the database
func (r *VideoRepository) MarkVideoAsProcessed(ctx context.Context, videoID string) error {
	query := `UPDATE viewtube_video SET processed = true WHERE url LIKE $1`
	result, err := r.db.ExecContext(ctx, query, "%"+videoID+"%")
	if err != nil {
		return fmt.Errorf("failed to update video: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("no video found with ID: %s", videoID)
	}

	return nil
}
