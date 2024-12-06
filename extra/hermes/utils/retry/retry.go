package retry

import (
	"fmt"
	"log"
	"math"
	"time"
)

// Config holds retry configuration
type Config struct {
	MaxRetries int
	BaseDelay  time.Duration
}

// DefaultConfig returns default retry configuration
func DefaultConfig() Config {
	return Config{
		MaxRetries: 5,
		BaseDelay:  time.Second,
	}
}

// Operation represents a function that can be retried
type Operation[T any] func() (T, error)

// Do executes the given operation with retries based on the provided configuration
func Do[T any](op Operation[T], cfg Config, description string) (T, error) {
	var result T
	var err error

	for i := 0; i < cfg.MaxRetries; i++ {
		result, err = op()
		if err == nil {
			return result, nil
		}

		if i < cfg.MaxRetries-1 {
			retryDelay := time.Duration(math.Pow(2, float64(i))) * cfg.BaseDelay
			log.Printf("[DEBUG] Failed to %s, retrying in %v... (attempt %d/%d): %v",
				description, retryDelay, i+1, cfg.MaxRetries, err)
			time.Sleep(retryDelay)
			continue
		}
	}

	return result, fmt.Errorf("failed to %s after %d attempts: %w",
		description, cfg.MaxRetries, err)
}
