package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"math"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "github.com/lib/pq"
	amqp "github.com/rabbitmq/amqp091-go"

	"viewtube/config"
	"viewtube/processor"
	"viewtube/subscriber"
	"viewtube/video"
)

func main() {
	cfg := config.New()

	// Initialize RabbitMQ connection with retry
	var conn *amqp.Connection
	var err error
	maxRetries := 5

	for i := 0; i < maxRetries; i++ {
		amqpURL := fmt.Sprintf("amqp://%s:%s@%s:%s/",
			cfg.RabbitmqUser,
			cfg.RabbitmqPassword,
			cfg.RabbitmqHost,
			cfg.RabbitmqPort,
		)

		conn, err = amqp.Dial(amqpURL)
		if err == nil {
			break
		}

		if i < maxRetries-1 {
			retryDelay := time.Duration(math.Pow(2, float64(i))) * time.Second
			log.Printf("Failed to connect to RabbitMQ, retrying in %v... (attempt %d/%d)", retryDelay, i+1, maxRetries)
			time.Sleep(retryDelay)
			continue
		}
		
		log.Fatalf("Failed to connect to RabbitMQ after %d attempts: %v", maxRetries, err)
	}
	defer conn.Close()

	// Create channel with retry
	var ch *amqp.Channel
	for i := 0; i < maxRetries; i++ {
		ch, err = conn.Channel()
		if err == nil {
			break
		}

		if i < maxRetries-1 {
			retryDelay := time.Duration(math.Pow(2, float64(i))) * time.Second
			log.Printf("Failed to create channel, retrying in %v... (attempt %d/%d)", retryDelay, i+1, maxRetries)
			time.Sleep(retryDelay)
			continue
		}
		
		log.Fatalf("Failed to create channel after %d attempts: %v", maxRetries, err)
	}
	defer ch.Close()

	// Initialize database connection
	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Create context that listens for signals
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Handle graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-sigChan
		cancel()
	}()

	// Initialize video processor
	videoProc := video.NewProcessor()

	// Initialize task processor
	proc := processor.New(ch, videoProc, processor.Config{
		TaskTimeout:    cfg.TaskTimeout,
		MaxRetries:     cfg.MaxRetries,
		RetryBaseDelay: cfg.RetryBaseDelay,
		UploadsVolume:  cfg.UploadsVolume,
	})

	// Initialize subscriber
	sub := subscriber.New(ch, db)

	// Start processor
	go func() {
		if err := proc.Start(ctx); err != nil {
			log.Printf("Processor error: %v", err)
			cancel()
		}
	}()

	// Start subscriber
	go func() {
		if err := sub.Start(ctx); err != nil {
			log.Printf("Subscriber error: %v", err)
			cancel()
		}
	}()

	if err := ch.Qos(10, 0, false); err != nil {
		log.Fatalf("Failed to set QoS: %v", err)
	}

	<-ctx.Done()
	log.Println("Shutting down...")
}
