package repository

import (
	"context"
	"errors"
	"testing"

	"viewtube/test/mocks"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockResult is a mock implementation of sql.Result
type MockResult struct {
	mock.Mock
}

// TestBeginTask tests the BeginTask method
func TestBeginTask(t *testing.T) {
	// Create a mock result
	mockResult := new(MockResult)
	mockResult.On("RowsAffected").Return(int64(1), nil)

	// Create a mock DB
	db, mock, err := mocks.NewMockDB()
	assert.NoError(t, err)
	defer db.Close()

	// Set up expectations
	mock.ExpectExec("UPDATE viewtube_video_task").
		WithArgs(StatusProcessing, 123, TaskType("poster"), StatusPending).
		WillReturnResult(sqlmock.NewResult(1, 1))

	// Create repository with mock DB
	repo := NewVideoRepository(db)

	// Test begin task
	err = repo.BeginTask(context.Background(), 123, TaskType("poster"))
	assert.NoError(t, err)

	// Verify expectations
	assert.NoError(t, mock.ExpectationsWereMet())
}

// TestBeginTaskError tests the BeginTask method with a database error
func TestBeginTaskError(t *testing.T) {
	// Create a mock DB
	db, mock, err := mocks.NewMockDB()
	assert.NoError(t, err)
	defer db.Close()

	// Set up expectations for database error
	mock.ExpectExec("UPDATE viewtube_video_task").
		WithArgs(StatusProcessing, 123, TaskType("poster"), StatusPending).
		WillReturnError(errors.New("database error"))

	// Create repository with mock DB
	repo := NewVideoRepository(db)

	// Test begin task with error
	err = repo.BeginTask(context.Background(), 123, TaskType("poster"))
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "database error")

	// Verify expectations
	assert.NoError(t, mock.ExpectationsWereMet())
}

// TestBeginTaskNoRowsAffected tests the BeginTask method with no rows affected
func TestBeginTaskNoRowsAffected(t *testing.T) {
	// Create a mock DB
	db, mock, err := mocks.NewMockDB()
	assert.NoError(t, err)
	defer db.Close()

	// Set up expectations for no rows affected
	mock.ExpectExec("UPDATE viewtube_video_task").
		WithArgs(StatusProcessing, 123, TaskType("poster"), StatusPending).
		WillReturnResult(sqlmock.NewResult(0, 0))

	// Create repository with mock DB
	repo := NewVideoRepository(db)

	// Test begin task with no rows affected
	err = repo.BeginTask(context.Background(), 123, TaskType("poster"))
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "task not found or already processing")

	// Verify expectations
	assert.NoError(t, mock.ExpectationsWereMet())
}

// TestCompleteTask tests the CompleteTask method
func TestCompleteTask(t *testing.T) {
	// Create a mock DB
	db, mock, err := mocks.NewMockDB()
	assert.NoError(t, err)
	defer db.Close()

	// Set up expectations for transaction
	mock.ExpectBegin()

	// Set up expectations for update
	mock.ExpectExec("UPDATE viewtube_video_task").
		WithArgs(StatusCompleted, nil, 123, TaskType("poster"), StatusProcessing).
		WillReturnResult(sqlmock.NewResult(1, 1))

	// Set up expectations for check query
	rows := sqlmock.NewRows([]string{"case"}).AddRow("completed")
	mock.ExpectQuery("SELECT").
		WithArgs(123).
		WillReturnRows(rows)

	// Set up expectations for update video status
	mock.ExpectExec("UPDATE viewtube_video").
		WithArgs("completed", 123).
		WillReturnResult(sqlmock.NewResult(1, 1))

	// Set up expectations for commit
	mock.ExpectCommit()

	// Create repository with mock DB
	repo := NewVideoRepository(db)

	// Test complete task
	err = repo.CompleteTask(context.Background(), 123, TaskType("poster"), StatusCompleted, nil)
	assert.NoError(t, err)

	// Verify expectations
	assert.NoError(t, mock.ExpectationsWereMet())
}

// TestCompleteTaskWithError tests the CompleteTask method with a task error
func TestCompleteTaskWithError(t *testing.T) {
	// Create a mock DB
	db, mock, err := mocks.NewMockDB()
	assert.NoError(t, err)
	defer db.Close()

	// Task error
	taskErr := errors.New("processing error")

	// Set up expectations for transaction
	mock.ExpectBegin()

	// Set up expectations for update
	mock.ExpectExec("UPDATE viewtube_video_task").
		WithArgs(StatusFailed, taskErr.Error(), 123, TaskType("poster"), StatusProcessing).
		WillReturnResult(sqlmock.NewResult(1, 1))

	// Set up expectations for check query
	rows := sqlmock.NewRows([]string{"case"}).AddRow("failed")
	mock.ExpectQuery("SELECT").
		WithArgs(123).
		WillReturnRows(rows)

	// Set up expectations for update video status
	mock.ExpectExec("UPDATE viewtube_video").
		WithArgs("failed", 123).
		WillReturnResult(sqlmock.NewResult(1, 1))

	// Set up expectations for commit
	mock.ExpectCommit()

	// Create repository with mock DB
	repo := NewVideoRepository(db)

	// Test complete task with error
	err = repo.CompleteTask(context.Background(), 123, TaskType("poster"), StatusFailed, taskErr)
	assert.NoError(t, err)

	// Verify expectations
	assert.NoError(t, mock.ExpectationsWereMet())
}

// TestUpdateVideoDuration tests the UpdateVideoDuration method
func TestUpdateVideoDuration(t *testing.T) {
	// Create a mock DB
	db, mock, err := mocks.NewMockDB()
	assert.NoError(t, err)
	defer db.Close()

	// Set up expectations
	mock.ExpectExec("UPDATE viewtube_video").
		WithArgs(120.5, 123).
		WillReturnResult(sqlmock.NewResult(1, 1))

	// Create repository with mock DB
	repo := NewVideoRepository(db)

	// Test update video duration
	err = repo.UpdateVideoDuration(context.Background(), 123, 120.5)
	assert.NoError(t, err)

	// Verify expectations
	assert.NoError(t, mock.ExpectationsWereMet())
}
