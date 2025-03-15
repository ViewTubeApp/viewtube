package config

import (
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

// TestNew tests the New function
func TestNew(t *testing.T) {
	// Save original environment variables
	origPostgresUser := os.Getenv("POSTGRES_USER")
	origPostgresPassword := os.Getenv("POSTGRES_PASSWORD")
	origPostgresHost := os.Getenv("POSTGRES_HOST")
	origPostgresPort := os.Getenv("POSTGRES_PORT")
	origPostgresDB := os.Getenv("POSTGRES_DB")
	origRabbitmqUser := os.Getenv("RABBITMQ_USER")
	origRabbitmqPassword := os.Getenv("RABBITMQ_PASSWORD")
	origRabbitmqHost := os.Getenv("RABBITMQ_HOST")
	origRabbitmqPort := os.Getenv("RABBITMQ_PORT")
	origUploadsVolume := os.Getenv("UPLOADS_VOLUME")

	// Restore environment variables when test completes
	defer func() {
		os.Setenv("POSTGRES_USER", origPostgresUser)
		os.Setenv("POSTGRES_PASSWORD", origPostgresPassword)
		os.Setenv("POSTGRES_HOST", origPostgresHost)
		os.Setenv("POSTGRES_PORT", origPostgresPort)
		os.Setenv("POSTGRES_DB", origPostgresDB)
		os.Setenv("RABBITMQ_USER", origRabbitmqUser)
		os.Setenv("RABBITMQ_PASSWORD", origRabbitmqPassword)
		os.Setenv("RABBITMQ_HOST", origRabbitmqHost)
		os.Setenv("RABBITMQ_PORT", origRabbitmqPort)
		os.Setenv("UPLOADS_VOLUME", origUploadsVolume)
	}()

	// Set test environment variables
	os.Setenv("POSTGRES_USER", "testuser")
	os.Setenv("POSTGRES_PASSWORD", "testpass")
	os.Setenv("POSTGRES_HOST", "testhost")
	os.Setenv("POSTGRES_PORT", "5432")
	os.Setenv("POSTGRES_DB", "testdb")
	os.Setenv("RABBITMQ_USER", "testuser")
	os.Setenv("RABBITMQ_PASSWORD", "testpass")
	os.Setenv("RABBITMQ_HOST", "testhost")
	os.Setenv("RABBITMQ_PORT", "5672")
	os.Setenv("UPLOADS_VOLUME", "/test/uploads")

	// Create config
	config := New()

	// Verify config
	assert.Equal(t, "postgres://testuser:testpass@testhost:5432/testdb?sslmode=disable", config.DatabaseURL)
	assert.Equal(t, "amqp://testuser:testpass@testhost:5672/", config.RabbitmqURL)
	assert.Equal(t, 30*time.Second, config.TaskTimeout)
	assert.Equal(t, 3, config.MaxRetries)
	assert.Equal(t, 1*time.Second, config.RetryBaseDelay)
	assert.Equal(t, "/test/uploads", config.UploadsVolume)
}

// TestReadPasswordOrFile tests the readPasswordOrFile function
func TestReadPasswordOrFile(t *testing.T) {
	// Test with direct password
	password := readPasswordOrFile("directpass", "")
	assert.Equal(t, "directpass", password)

	// Test with password file
	tempFile, err := os.CreateTemp("", "password")
	assert.NoError(t, err)
	defer os.Remove(tempFile.Name())

	_, err = tempFile.WriteString("filepass")
	assert.NoError(t, err)
	tempFile.Close()

	password = readPasswordOrFile("directpass", tempFile.Name())
	assert.Equal(t, "filepass", password)

	// Test with non-existent password file
	password = readPasswordOrFile("directpass", "/nonexistent/file")
	assert.Equal(t, "directpass", password)
}
