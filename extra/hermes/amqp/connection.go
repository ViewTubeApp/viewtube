package amqp

import (
	"fmt"

	amqp "github.com/rabbitmq/amqp091-go"
	"viewtube/utils/retry"
)

type Config struct {
	Host     string
	Port     string
	User     string
	Password string
}

// Manager handles AMQP connection and channel management
type Manager struct {
	config Config
	retry  retry.Config
}

// NewManager creates a new AMQP connection manager
func NewManager(config Config) *Manager {
	return &Manager{
		config: config,
		retry:  retry.DefaultConfig(),
	}
}

// Connect establishes connection to RabbitMQ with retries
func (m *Manager) Connect() (*amqp.Connection, *amqp.Channel, error) {
	// Connect to RabbitMQ with retry
	conn, err := retry.Do(
		func() (*amqp.Connection, error) {
			return amqp.Dial(fmt.Sprintf("amqp://%s:%s@%s:%s/",
				m.config.User,
				m.config.Password,
				m.config.Host,
				m.config.Port,
			))
		},
		m.retry,
		"connect to RabbitMQ",
	)
	if err != nil {
		return nil, nil, err
	}

	// Create channel with retry
	ch, err := retry.Do(
		func() (*amqp.Channel, error) {
			return conn.Channel()
		},
		m.retry,
		"create AMQP channel",
	)
	if err != nil {
		conn.Close()
		return nil, nil, err
	}

	return conn, ch, nil
}
