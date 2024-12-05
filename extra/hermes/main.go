package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"

	"viewtube/config"
	"viewtube/processor"
	"viewtube/subscriber"
	"viewtube/video"
)

func main() {
	cfg := config.New()

	// Initialize Redis client
	redisClient := redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%s", cfg.RedisHost, cfg.RedisPort),
	})

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
	videoProc := video.NewProcessor(cfg.FFmpegThreads)

	// Initialize task processor
	proc := processor.New(redisClient, videoProc, processor.Config{
		TaskTimeout:    cfg.TaskTimeout,
		MaxRetries:     cfg.MaxRetries,
		RetryBaseDelay: cfg.RetryBaseDelay,
		UploadsVolume:  cfg.UploadsVolume,
	})

	// Initialize subscriber
	sub := subscriber.New(redisClient, db)

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

	<-ctx.Done()
	log.Println("Shutting down...")
}
