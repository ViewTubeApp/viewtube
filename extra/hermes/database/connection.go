package database

import (
	"database/sql"

	"viewtube/utils/retry"

	_ "github.com/lib/pq"
)

type Config struct {
	URL string
}

// Manager handles database connection management
type Manager struct {
	config Config
	retry  retry.Config
}

// NewManager creates a new database connection manager
func NewManager(config Config) *Manager {
	return &Manager{
		config: config,
		retry:  retry.DefaultConfig(),
	}
}

// Connect establishes connection to the database with retries
func (m *Manager) Connect() (*sql.DB, error) {
	return retry.Do(
		func() (*sql.DB, error) {
			db, err := sql.Open("postgres", m.config.URL)
			if err != nil {
				return nil, err
			}

			// Test the connection
			if err = db.Ping(); err != nil {
				db.Close()
				return nil, err
			}

			return db, nil
		},
		m.retry,
		"connect to database",
	)
}
