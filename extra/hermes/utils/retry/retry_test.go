package retry

import (
	"errors"
	"testing"
	"time"
)

func TestDefaultConfig(t *testing.T) {
	cfg := DefaultConfig()

	if cfg.MaxRetries != 5 {
		t.Errorf("Expected MaxRetries to be 5, got %d", cfg.MaxRetries)
	}

	if cfg.BaseDelay != time.Second {
		t.Errorf("Expected BaseDelay to be %s, got %s", time.Second, cfg.BaseDelay)
	}
}

func TestDo_Success(t *testing.T) {
	// Operation that succeeds immediately
	op := func() (string, error) {
		return "success", nil
	}

	cfg := Config{
		MaxRetries: 3,
		BaseDelay:  time.Millisecond,
	}

	result, err := Do(op, cfg, "test operation")

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if result != "success" {
		t.Errorf("Expected result to be 'success', got '%s'", result)
	}
}

func TestDo_EventualSuccess(t *testing.T) {
	// Counter to track number of attempts
	attempts := 0
	tempErr := errors.New("temporary error")

	// Operation that fails twice then succeeds
	op := func() (string, error) {
		attempts++
		if attempts < 3 {
			return "", tempErr
		}
		return "success", nil
	}

	cfg := Config{
		MaxRetries: 5,
		BaseDelay:  time.Millisecond, // Use small delay for tests
	}

	result, err := Do(op, cfg, "test operation")

	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}

	if result != "success" {
		t.Errorf("Expected result to be 'success', got '%s'", result)
	}

	if attempts != 3 {
		t.Errorf("Expected 3 attempts, got %d", attempts)
	}
}

func TestDo_Failure(t *testing.T) {
	// Counter to track number of attempts
	attempts := 0
	persistentErr := errors.New("persistent error")

	// Operation that always fails
	op := func() (string, error) {
		attempts++
		return "", persistentErr
	}

	cfg := Config{
		MaxRetries: 3,
		BaseDelay:  time.Millisecond, // Use small delay for tests
	}

	_, err := Do(op, cfg, "test operation")

	if err == nil {
		t.Error("Expected an error, got nil")
	}

	if attempts != 3 {
		t.Errorf("Expected 3 attempts, got %d", attempts)
	}

	// Check if the error contains our original error
	if !errors.Is(err, persistentErr) {
		t.Errorf("Expected error to wrap 'persistent error', got: %v", err)
	}
}
