package config

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL      string
	RedisHost        string
	RedisPort        string
	RabbitmqHost     string
	RabbitmqPort     string
	RabbitmqUser     string
	RabbitmqPassword string
	TaskTimeout      time.Duration
	MaxRetries       int
	RetryBaseDelay   time.Duration
	UploadsVolume    string
}

func New() Config {
	// Load .env file if exists
	if err := godotenv.Load(); err != nil {
		log.Printf("[WARN] Warning: .env file not found: %v", err)
	}

	// Get passwords, preferring file-based passwords if available
	postgresPassword := getPassword(
		os.Getenv("POSTGRES_PASSWORD"),
		os.Getenv("POSTGRES_PASSWORD_FILE"),
	)
	rabbitmqPassword := getPassword(
		os.Getenv("RABBITMQ_PASSWORD"),
		os.Getenv("RABBITMQ_PASSWORD_FILE"),
	)

	// Construct database URL from individual parameters
	dbURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		os.Getenv("POSTGRES_USER"),
		postgresPassword,
		os.Getenv("POSTGRES_HOST"),
		os.Getenv("POSTGRES_PORT"),
		os.Getenv("POSTGRES_DB"),
	)

	return Config{
		DatabaseURL:      dbURL,
		RedisHost:        os.Getenv("REDIS_HOST"),
		RedisPort:        os.Getenv("REDIS_PORT"),
		RabbitmqHost:     os.Getenv("RABBITMQ_HOST"),
		RabbitmqPort:     os.Getenv("RABBITMQ_PORT"),
		RabbitmqUser:     os.Getenv("RABBITMQ_USER"),
		RabbitmqPassword: rabbitmqPassword,
		TaskTimeout:      30 * time.Second,
		MaxRetries:       3,
		RetryBaseDelay:   1 * time.Second,
		UploadsVolume:    os.Getenv("UPLOADS_VOLUME"),
	}
}

// readPasswordFile reads a password from a file, trimming any whitespace
func readPasswordFile(path string) (string, error) {
	content, err := os.ReadFile(path)
	if err != nil {
		return "", fmt.Errorf("failed to read password file: %w", err)
	}
	return strings.TrimSpace(string(content)), nil
}

// getPassword returns password from file if passwordFile is provided, otherwise returns direct password
func getPassword(password, passwordFile string) string {
	// Try to read password from file first
	if passwordFile != "" {
		password, err := os.ReadFile(passwordFile)
		if err != nil {
			log.Printf("[WARN] Warning: failed to read password file %s: %v, falling back to direct password", passwordFile, err)
		} else {
			return strings.TrimSpace(string(password))
		}
	}
	return password
}
