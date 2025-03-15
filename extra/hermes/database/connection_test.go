package database

import (
	"database/sql"
	"errors"
	"testing"
	"time"

	"viewtube/utils/retry"

	"github.com/DATA-DOG/go-sqlmock"
)

// MockSQLOpener is a mock implementation of SQLOpener
type MockSQLOpener struct {
	db  *sql.DB
	err error
}

// Open is a mock implementation of the Open method
func (m MockSQLOpener) Open(driverName, dataSourceName string) (*sql.DB, error) {
	return m.db, m.err
}

func TestNewManager(t *testing.T) {
	config := Config{
		URL: "postgres://testuser:testpass@localhost:5432/testdb",
	}

	manager := NewManager(config)

	if manager == nil {
		t.Fatal("Expected manager to not be nil")
	}

	if manager.config.URL != config.URL {
		t.Errorf("Expected URL to be %s, got %s", config.URL, manager.config.URL)
	}

	// Verify default retry config
	defaultConfig := retry.DefaultConfig()
	if manager.retry.MaxRetries != defaultConfig.MaxRetries {
		t.Errorf("Expected MaxRetries to be %d, got %d", defaultConfig.MaxRetries, manager.retry.MaxRetries)
	}

	if manager.retry.BaseDelay != defaultConfig.BaseDelay {
		t.Errorf("Expected BaseDelay to be %s, got %s", defaultConfig.BaseDelay, manager.retry.BaseDelay)
	}
}

func TestConnect(t *testing.T) {
	// Create a mock database connection
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock: %v", err)
	}
	defer db.Close()

	// Set up expectations
	mock.ExpectPing()

	// Create config
	config := Config{
		URL: "postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable",
	}

	// Create manager with mock opener
	manager := NewManager(config)
	manager.opener = MockSQLOpener{db: db, err: nil}
	manager.retry = retry.Config{
		MaxRetries: 2,
		BaseDelay:  100 * time.Millisecond,
	}

	// Connect
	conn, err := manager.Connect()
	if err != nil {
		t.Fatalf("Failed to connect to database: %v", err)
	}

	// Verify connection
	if conn == nil {
		t.Fatal("Expected connection to not be nil")
	}

	// Verify all expectations were met
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %s", err)
	}
}

func TestConnectError(t *testing.T) {
	// Create config
	config := Config{
		URL: "postgres://invalid:invalid@nonexistent:5432/nonexistent",
	}

	// Create manager with mock opener that returns an error
	expectedErr := errors.New("connection error")
	manager := NewManager(config)
	manager.opener = MockSQLOpener{db: nil, err: expectedErr}
	manager.retry = retry.Config{
		MaxRetries: 2,
		BaseDelay:  10 * time.Millisecond,
	}

	// Connect should fail
	_, err := manager.Connect()
	if err == nil {
		t.Fatal("Expected error when connecting to non-existent database, got nil")
	}
}
