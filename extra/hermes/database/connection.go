package database

import (
	"database/sql"

	"viewtube/utils/retry"

	_ "github.com/lib/pq"
)

type Config struct {
	URL string
}

// SQLOpener defines the interface for opening SQL connections
type SQLOpener interface {
	Open(driverName, dataSourceName string) (*sql.DB, error)
}

// DefaultSQLOpener is the default implementation of SQLOpener
type DefaultSQLOpener struct{}

// Open opens a database connection
func (o DefaultSQLOpener) Open(driverName, dataSourceName string) (*sql.DB, error) {
	return sql.Open(driverName, dataSourceName)
}

// Manager handles database connection management
type Manager struct {
	config Config
	retry  retry.Config
	opener SQLOpener
}

// NewManager creates a new database connection manager
func NewManager(config Config) *Manager {
	return &Manager{
		config: config,
		retry:  retry.DefaultConfig(),
		opener: DefaultSQLOpener{},
	}
}

// Connect establishes connection to the database with retries
func (m *Manager) Connect() (*sql.DB, error) {
	return retry.Do(
		func() (*sql.DB, error) {
			db, err := m.opener.Open("postgres", m.config.URL)
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
