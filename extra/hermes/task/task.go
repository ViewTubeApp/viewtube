package task

import "fmt"

// VideoTask represents a video processing task
type VideoTask struct {
	VideoId    int                    `json:"videoId"`
	FilePath   string                 `json:"filePath"`
	TaskType   string                 `json:"taskType"`
	OutputPath string                 `json:"outputPath"`
	Config     map[string]interface{} `json:"config,omitempty"`
}

// WebVTTConfig interface for WebVTT configuration
type WebVTTConfig interface {
	GetInterval() float64
	GetNumColumns() int
	GetWidth() int
	GetHeight() int
	GetMaxDuration() float64
}

// TrailerConfig interface for trailer configuration
type TrailerConfig interface {
	GetClipDuration() float64
	GetClipCount() int
	GetSelectionStrategy() string
	GetWidth() int
	GetHeight() int
	GetTargetDuration() float64
	GetAspectRatioStrategy() string
	GetMaxWidth() int
	GetMaxHeight() int
}

// ProcessingError represents a task processing error
type ProcessingError struct {
	TaskType string
	Err      error
}

func (e *ProcessingError) Error() string {
	return fmt.Sprintf("processing error for task %s: %v", e.TaskType, e.Err)
}

// WebVTTConfigImpl implements WebVTTConfig
type WebVTTConfigImpl struct {
	Interval    float64 `json:"interval"`
	NumColumns  int     `json:"numColumns"`
	Width       int     `json:"width"`
	Height      int     `json:"height"`
	MaxDuration float64 `json:"maxDuration,omitempty"`
}

func (c *WebVTTConfigImpl) GetInterval() float64    { return c.Interval }
func (c *WebVTTConfigImpl) GetNumColumns() int      { return c.NumColumns }
func (c *WebVTTConfigImpl) GetWidth() int           { return c.Width }
func (c *WebVTTConfigImpl) GetHeight() int          { return c.Height }
func (c *WebVTTConfigImpl) GetMaxDuration() float64 { return c.MaxDuration }

// TrailerConfigImpl implements TrailerConfig
type TrailerConfigImpl struct {
	ClipDuration        float64 `json:"clipDuration"`
	ClipCount           int     `json:"clipCount"`
	SelectionStrategy   string  `json:"selectionStrategy"`
	Width               int     `json:"width"`
	Height              int     `json:"height"`
	TargetDuration      float64 `json:"targetDuration,omitempty"`
	AspectRatioStrategy string  `json:"aspectRatioStrategy,omitempty"`
	MaxWidth            int     `json:"maxWidth,omitempty"`
	MaxHeight           int     `json:"maxHeight,omitempty"`
}

func (c *TrailerConfigImpl) GetClipDuration() float64     { return c.ClipDuration }
func (c *TrailerConfigImpl) GetClipCount() int            { return c.ClipCount }
func (c *TrailerConfigImpl) GetSelectionStrategy() string { return c.SelectionStrategy }
func (c *TrailerConfigImpl) GetWidth() int                { return c.Width }
func (c *TrailerConfigImpl) GetHeight() int               { return c.Height }
func (c *TrailerConfigImpl) GetTargetDuration() float64   { return c.TargetDuration }
func (c *TrailerConfigImpl) GetAspectRatioStrategy() string {
	if c.AspectRatioStrategy == "" {
		return "fit" // Default to "fit" if not specified
	}
	return c.AspectRatioStrategy
}
func (c *TrailerConfigImpl) GetMaxWidth() int {
	if c.MaxWidth <= 0 {
		return c.Width // Default to Width if not specified
	}
	return c.MaxWidth
}
func (c *TrailerConfigImpl) GetMaxHeight() int {
	if c.MaxHeight <= 0 {
		return c.Height // Default to Height if not specified
	}
	return c.MaxHeight
}
