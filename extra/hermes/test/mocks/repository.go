package mocks

import (
	"context"

	"github.com/stretchr/testify/mock"
)

// MockVideoRepository is a mock implementation of the VideoRepository
type MockVideoRepository struct {
	mock.Mock
}

// BeginTask mocks the BeginTask method
func (m *MockVideoRepository) BeginTask(ctx context.Context, videoId int, taskType string) error {
	args := m.Called(ctx, videoId, taskType)
	return args.Error(0)
}

// CompleteTask mocks the CompleteTask method
func (m *MockVideoRepository) CompleteTask(ctx context.Context, videoId int, taskType string, status string, taskErr error) error {
	args := m.Called(ctx, videoId, taskType, status, taskErr)
	return args.Error(0)
}

// UpdateVideoDuration mocks the UpdateVideoDuration method
func (m *MockVideoRepository) UpdateVideoDuration(ctx context.Context, videoId int, duration float64) error {
	args := m.Called(ctx, videoId, duration)
	return args.Error(0)
}
