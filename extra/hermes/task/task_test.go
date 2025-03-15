package task

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestProcessingError(t *testing.T) {
	// Create a processing error
	err := &ProcessingError{
		TaskType: "poster",
		Err:      assert.AnError,
	}

	// Test error message formatting
	expected := "processing error for task poster: assert.AnError general error for testing"
	assert.Equal(t, expected, err.Error())
}

func TestWebVTTConfigImpl(t *testing.T) {
	// Create a WebVTT config
	config := &WebVTTConfigImpl{
		Interval:    10.0,
		NumColumns:  5,
		Width:       160,
		Height:      90,
		MaxDuration: 3600.0,
	}

	// Test getters
	assert.Equal(t, 10.0, config.GetInterval())
	assert.Equal(t, 5, config.GetNumColumns())
	assert.Equal(t, 160, config.GetWidth())
	assert.Equal(t, 90, config.GetHeight())
	assert.Equal(t, 3600.0, config.GetMaxDuration())
}

func TestTrailerConfigImpl(t *testing.T) {
	// Test with all fields specified
	t.Run("AllFieldsSpecified", func(t *testing.T) {
		config := &TrailerConfigImpl{
			ClipDuration:        3.0,
			ClipCount:           10,
			SelectionStrategy:   "uniform",
			Width:               1280,
			Height:              720,
			TargetDuration:      30.0,
			AspectRatioStrategy: "crop",
			MaxWidth:            1920,
			MaxHeight:           1080,
		}

		assert.Equal(t, 3.0, config.GetClipDuration())
		assert.Equal(t, 10, config.GetClipCount())
		assert.Equal(t, "uniform", config.GetSelectionStrategy())
		assert.Equal(t, 1280, config.GetWidth())
		assert.Equal(t, 720, config.GetHeight())
		assert.Equal(t, 30.0, config.GetTargetDuration())
		assert.Equal(t, "crop", config.GetAspectRatioStrategy())
		assert.Equal(t, 1920, config.GetMaxWidth())
		assert.Equal(t, 1080, config.GetMaxHeight())
	})

	// Test with default values
	t.Run("DefaultValues", func(t *testing.T) {
		config := &TrailerConfigImpl{
			ClipDuration:      3.0,
			ClipCount:         10,
			SelectionStrategy: "uniform",
			Width:             1280,
			Height:            720,
			TargetDuration:    30.0,
			// AspectRatioStrategy, MaxWidth, and MaxHeight not specified
		}

		assert.Equal(t, "fit", config.GetAspectRatioStrategy())
		assert.Equal(t, 1280, config.GetMaxWidth())
		assert.Equal(t, 720, config.GetMaxHeight())
	})
}

func TestVideoTaskSerialization(t *testing.T) {
	// Create a video task
	task := VideoTask{
		VideoId:    123,
		FilePath:   "/path/to/video.mp4",
		TaskType:   "poster",
		OutputPath: "/path/to/output",
		Config: map[string]interface{}{
			"webvtt": map[string]interface{}{
				"interval":    10.0,
				"numColumns":  5,
				"width":       160,
				"height":      90,
				"maxDuration": 3600.0,
			},
		},
	}

	// Serialize to JSON
	jsonData, err := json.Marshal(task)
	assert.NoError(t, err)

	// Deserialize from JSON
	var deserializedTask VideoTask
	err = json.Unmarshal(jsonData, &deserializedTask)
	assert.NoError(t, err)

	// Verify deserialized task
	assert.Equal(t, task.VideoId, deserializedTask.VideoId)
	assert.Equal(t, task.FilePath, deserializedTask.FilePath)
	assert.Equal(t, task.TaskType, deserializedTask.TaskType)
	assert.Equal(t, task.OutputPath, deserializedTask.OutputPath)

	// Verify config
	webvttConfig, ok := deserializedTask.Config["webvtt"].(map[string]interface{})
	assert.True(t, ok)
	assert.Equal(t, 10.0, webvttConfig["interval"])
	assert.Equal(t, float64(5), webvttConfig["numColumns"])
	assert.Equal(t, float64(160), webvttConfig["width"])
	assert.Equal(t, float64(90), webvttConfig["height"])
	assert.Equal(t, 3600.0, webvttConfig["maxDuration"])
}
