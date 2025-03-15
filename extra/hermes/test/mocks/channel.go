package mocks

import (
	"github.com/stretchr/testify/mock"
)

// MockChannel is a mock implementation of amqp.Channel for testing
type MockChannel struct {
	mock.Mock
}
