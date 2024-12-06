package main

import (
	"log"

	"viewtube/app"
	"viewtube/config"
)

func main() {
	// Load configuration
	cfg := config.New()

	// Create and setup application
	application := app.New(cfg)
	if err := application.Setup(); err != nil {
		log.Fatalf("Failed to setup application: %v", err)
	}
	defer application.Cleanup()

	// Run application
	if err := application.Run(); err != nil {
		log.Fatalf("Application error: %v", err)
	}

	log.Println("Shutting down...")
}
