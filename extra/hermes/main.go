package main

import (
	"log"

	"viewtube/config"
	"viewtube/processor"
)

func main() {
	cfg := config.New()
	proc, err := processor.New(cfg)
	if err != nil {
		log.Fatalf("Failed to create task processor: %v", err)
	}

	if err := proc.Start(); err != nil {
		log.Fatalf("Failed to start processor: %v", err)
	}
}
