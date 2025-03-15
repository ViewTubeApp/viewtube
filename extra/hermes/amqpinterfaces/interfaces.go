package amqpinterfaces

import (
	amqp "github.com/rabbitmq/amqp091-go"
)

// AMQPConnection defines the interface for AMQP connections
type AMQPConnection interface {
	Channel() (*amqp.Channel, error)
	Close() error
}

// AMQPDialer defines the interface for dialing AMQP connections
type AMQPDialer interface {
	Dial(url string) (AMQPConnection, error)
}
