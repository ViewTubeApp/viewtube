package mocks

import (
	"viewtube/amqpinterfaces"

	amqplib "github.com/rabbitmq/amqp091-go"
)

// MockAMQPConnection is a mock implementation of AMQPConnection
type MockAMQPConnection struct {
	ChannelErr error
	CloseErr   error
	Closed     bool
	ChannelObj *amqplib.Channel
}

// Channel implements the AMQPConnection interface
func (m *MockAMQPConnection) Channel() (*amqplib.Channel, error) {
	if m.ChannelErr != nil {
		return nil, m.ChannelErr
	}
	return m.ChannelObj, nil
}

// Close implements the AMQPConnection interface
func (m *MockAMQPConnection) Close() error {
	m.Closed = true
	return m.CloseErr
}

// MockAMQPDialer is a mock implementation of AMQPDialer
type MockAMQPDialer struct {
	DialErr error
	Conn    *MockAMQPConnection
}

// Dial implements the AMQPDialer interface
func (m *MockAMQPDialer) Dial(url string) (amqpinterfaces.AMQPConnection, error) {
	if m.DialErr != nil {
		return nil, m.DialErr
	}
	return m.Conn, nil
}
