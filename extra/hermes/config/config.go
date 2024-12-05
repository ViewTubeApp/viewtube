package config

import (
	"fmt"
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
	DatabaseURL    string
}

func getPostgresPassword() string {
	// First try to read from password file
	if passwordFile := os.Getenv("POSTGRES_PASSWORD_FILE"); passwordFile != "" {
		password, err := os.ReadFile(passwordFile)
		if err == nil {
			return string(password)
		}
		log.Printf("Warning: Could not read POSTGRES_PASSWORD_FILE: %v", err)
	}

	// Fallback to direct password env var
	return os.Getenv("POSTGRES_PASSWORD")
}

// New creates a new configuration with defaults
func New() Config {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found: %v", err)
	}

	// Redis configuration
	redisHost := os.Getenv("REDIS_HOST")
	redisPort := os.Getenv("REDIS_PORT")

	// Postgres configuration
	pgHost := os.Getenv("POSTGRES_HOST")
	pgPort := os.Getenv("POSTGRES_PORT")
	pgUser := os.Getenv("POSTGRES_USER")
	pgPassword := getPostgresPassword()
	pgDB := os.Getenv("POSTGRES_DB")

	// Construct database URL
	dbURL := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=prefer",
		pgUser,
		pgPassword,
		pgHost,
		pgPort,
		pgDB,
	)

	return Config{
		RedisHost:      redisHost,
		RedisPort:      redisPort,
		UploadsVolume:  os.Getenv("UPLOADS_VOLUME"),
		TaskTimeout:    30 * time.Minute,
		MaxRetries:     3,
		FFmpegThreads:  "2",
		FFmpegMemLimit: "512M",
		RetryBaseDelay: time.Second,
		DatabaseURL:    dbURL,
	}
}
