package app

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"viewtube/amqp"
	"viewtube/config"
	"viewtube/database"
	"viewtube/repository"
	"viewtube/video"
	"viewtube/worker"
)

// App represents the main application
type App struct {
	config   config.Config
	amqpConn *amqp.Manager
	dbConn   *database.Manager
	taskProc *worker.TaskProcessor
	cleanup  []func()
}

// New creates a new application instance
func New(cfg config.Config) *App {
	return &App{
		config:  cfg,
		cleanup: make([]func(), 0),
	}
}

// Setup initializes all application components
func (a *App) Setup() error {
	// Initialize AMQP connection manager
	a.amqpConn = amqp.NewManager(amqp.Config{
		URL: a.config.RabbitmqURL,
	})

	// Connect to RabbitMQ
	conn, ch, err := a.amqpConn.Connect()
	if err != nil {
		return err
	}
	a.cleanup = append(a.cleanup, func() {
		conn.Close()
		ch.Close()
	})

	// Initialize database connection manager
	a.dbConn = database.NewManager(database.Config{
		URL: a.config.DatabaseURL,
	})

	// Connect to database
	db, err := a.dbConn.Connect()
	if err != nil {
		return err
	}
	a.cleanup = append(a.cleanup, func() {
		db.Close()
	})

	// Initialize video processor
	ffmpegProc := video.NewFFmpegProcessor()

	// Initialize video repository
	videoRepo := repository.NewVideoRepository(db)

	// Initialize task processor
	a.taskProc = worker.NewTaskProcessor(ch, ffmpegProc, videoRepo, worker.Config{
		TaskTimeout:    a.config.TaskTimeout,
		MaxRetries:     a.config.MaxRetries,
		RetryBaseDelay: a.config.RetryBaseDelay,
		UploadsVolume:  a.config.UploadsVolume,
	})

	return nil
}

// Run starts the application and blocks until shutdown
func (a *App) Run() error {
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

	// Start task processor
	if err := a.taskProc.Start(ctx); err != nil {
		log.Printf("[ERROR] Task processor error: %v", err)
		return err
	}

	// Wait for shutdown signal
	<-ctx.Done()
	return nil
}

// Cleanup performs cleanup of all resources
func (a *App) Cleanup() {
	log.Println("Cleaning up resources...")
	for _, cleanup := range a.cleanup {
		cleanup()
	}
}
