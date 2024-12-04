package task

import "fmt"

// VideoTask represents a video processing task
type VideoTask struct {
	FilePath   string                 `json:"filePath"`
	TaskType   string                 `json:"taskType"`
	OutputPath string                 `json:"outputPath"`
	Config     map[string]WebVTTConfig `json:"config,omitempty"`
}

// WebVTTConfig holds configuration for WebVTT generation
type WebVTTConfig struct {
	Interval   float64 `json:"interval"`
	NumColumns int     `json:"numColumns"`
	Width      int     `json:"width"`
	Height     int     `json:"height"`
}

// ProcessingError represents a task processing error
type ProcessingError struct {
	TaskType string
	Err      error
}

func (e *ProcessingError) Error() string {
	return fmt.Sprintf("processing error for task %s: %v", e.TaskType, e.Err)
}

// TaskCompletion represents a completion notification
type TaskCompletion struct {
	TaskType   string `json:"taskType"`
	FilePath   string `json:"filePath"`
	OutputPath string `json:"outputPath"`
	Status     string `json:"status"`
	Error      string `json:"error,omitempty"`
}