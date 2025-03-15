package mocks

import (
	"database/sql"

	"github.com/stretchr/testify/mock"
)

// MockDB is a mock implementation of sql.DB for testing
type MockDB struct {
	mock.Mock
}

// Close mocks the Close method
func (m *MockDB) Close() error {
	args := m.Called()
	return args.Error(0)
}

// Exec mocks the Exec method
func (m *MockDB) Exec(query string, args ...interface{}) (sql.Result, error) {
	callArgs := m.Called(append([]interface{}{query}, args...)...)
	if callArgs.Get(0) == nil {
		return nil, callArgs.Error(1)
	}
	return callArgs.Get(0).(sql.Result), callArgs.Error(1)
}

// Query mocks the Query method
func (m *MockDB) Query(query string, args ...interface{}) (*sql.Rows, error) {
	callArgs := m.Called(append([]interface{}{query}, args...)...)
	if callArgs.Get(0) == nil {
		return nil, callArgs.Error(1)
	}
	return callArgs.Get(0).(*sql.Rows), callArgs.Error(1)
}

// QueryRow mocks the QueryRow method
func (m *MockDB) QueryRow(query string, args ...interface{}) *sql.Row {
	callArgs := m.Called(append([]interface{}{query}, args...)...)
	return callArgs.Get(0).(*sql.Row)
}

// Begin mocks the Begin method
func (m *MockDB) Begin() (*sql.Tx, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*sql.Tx), args.Error(1)
}

// Ping mocks the Ping method
func (m *MockDB) Ping() error {
	args := m.Called()
	return args.Error(0)
}
