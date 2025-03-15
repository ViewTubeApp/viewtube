package amqp

import (
	"errors"
	"testing"
	"time"

	"viewtube/test/mocks"
	"viewtube/utils/retry"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/stretchr/testify/assert"
)

// TestNewManager tests the NewManager function
func TestNewManager(t *testing.T) {
	// Create config
	config := Config{
		URL: "amqp://guest:guest@localhost:5672/",
	}

	// Create manager
	manager := NewManager(config)

	// Verify manager
	assert.NotNil(t, manager)
	assert.Equal(t, config.URL, manager.config.URL)
}

// TestConnect tests the Connect method with successful connection
func TestConnect(t *testing.T) {
	// Create mock connection and channel
	mockChannel := &amqp.Channel{}
	mockConn := &mocks.MockAMQPConnection{
		ChannelErr: nil,
		CloseErr:   nil,
		Closed:     false,
		ChannelObj: mockChannel,
	}

	// Create mock dialer
	mockDialer := &mocks.MockAMQPDialer{
		DialErr: nil,
		Conn:    mockConn,
	}

	// Create config
	config := Config{
		URL: "amqp://guest:guest@localhost:5672/",
	}

	// Create manager with mock dialer and minimal retry config
	manager := NewManager(config)
	manager.dialer = mockDialer
	manager.retry = retry.Config{
		MaxRetries: 1,
		BaseDelay:  time.Millisecond,
	}

	// Connect
	conn, ch, err := manager.Connect()

	// Verify results
	assert.NoError(t, err)
	assert.Equal(t, mockConn, conn)
	assert.Equal(t, mockChannel, ch)
	assert.False(t, mockConn.Closed)
}

// TestConnectError tests the Connect method with dial error
func TestConnectError(t *testing.T) {
	// Create mock dialer that fails
	mockDialer := &mocks.MockAMQPDialer{
		DialErr: errors.New("dial error"),
		Conn:    nil,
	}

	// Create config
	config := Config{
		URL: "amqp://invalid:invalid@localhost:5672/",
	}

	// Create manager with mock dialer and minimal retry config
	manager := NewManager(config)
	manager.dialer = mockDialer
	manager.retry = retry.Config{
		MaxRetries: 1,
		BaseDelay:  time.Millisecond,
	}

	// Connect should fail
	conn, ch, err := manager.Connect()

	// Verify results
	assert.Error(t, err)
	assert.Nil(t, conn)
	assert.Nil(t, ch)
}

// TestConnectChannelError tests the Connect method with channel creation error
func TestConnectChannelError(t *testing.T) {
	// Create mock connection that fails channel creation
	mockConn := &mocks.MockAMQPConnection{
		ChannelErr: errors.New("channel error"),
		CloseErr:   nil,
		Closed:     false,
		ChannelObj: nil,
	}

	// Create mock dialer
	mockDialer := &mocks.MockAMQPDialer{
		DialErr: nil,
		Conn:    mockConn,
	}

	// Create config
	config := Config{
		URL: "amqp://guest:guest@localhost:5672/",
	}

	// Create manager with mock dialer and minimal retry config
	manager := NewManager(config)
	manager.dialer = mockDialer
	manager.retry = retry.Config{
		MaxRetries: 1,
		BaseDelay:  time.Millisecond,
	}

	// Connect should fail at channel creation
	conn, ch, err := manager.Connect()

	// Verify results
	assert.Error(t, err)
	assert.Nil(t, conn)
	assert.Nil(t, ch)

	// Verify connection was closed
	assert.True(t, mockConn.Closed)
}
