package mocks

import (
	"database/sql"

	"github.com/DATA-DOG/go-sqlmock"
)

// NewMockDB creates a new mock database connection
func NewMockDB() (*sql.DB, sqlmock.Sqlmock, error) {
	return sqlmock.New()
}
