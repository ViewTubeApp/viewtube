package config

import (
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
)

// Config holds all configuration values
type Config struct {
	RedisHost      string
	RedisPort      string
	UploadsVolume  string
	TaskTimeout    time.Duration
	MaxRetries     int
	FFmpegThreads  string
	FFmpegMemLimit string
	RetryBaseDelay time.Duration
}

// New creates a new configuration with defaults
func New() Config {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found: %v", err)
	}

	host := os.Getenv("REDIS_HOST")
	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("REDIS_PORT")
	if port == "" {
		port = "6379"
	}

	return Config{
		RedisHost:      host,
		RedisPort:      port,
		UploadsVolume:  os.Getenv("UPLOADS_VOLUME"),
		TaskTimeout:    30 * time.Minute,
		MaxRetries:     3,
		FFmpegThreads:  "2",
		FFmpegMemLimit: "512M",
		RetryBaseDelay: time.Second,
	}
} 