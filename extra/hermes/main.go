package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

type VideoTask struct {
	FilePath   string                  `json:"filePath"`
	TaskType   string                  `json:"taskType"`
	OutputPath string                  `json:"outputPath"`
	Config     map[string]WebVTTConfig `json:"config,omitempty"`
}

type WebVTTConfig struct {
	Interval   float64 `json:"interval"`
	NumColumns int     `json:"numColumns"`
	Width      int     `json:"width"`
	Height     int     `json:"height"`
}

var (
	rdbPub        *redis.Client
	rdbSub        *redis.Client
	ctx           context.Context
	uploadsVolume string
)

func init() {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found: %v", err)
	}

	host := os.Getenv("REDIS_HOST")
	port := os.Getenv("REDIS_PORT")
	uploadsVolume = os.Getenv("UPLOADS_VOLUME")

	if host == "" {
		host = "localhost"
	}
	if port == "" {
		port = "6379"
	}

	opt := &redis.Options{
		Addr: fmt.Sprintf("%s:%s", host, port),
	}

	// Create separate clients for pub/sub and regular operations
	rdbPub = redis.NewClient(opt)
	rdbSub = redis.NewClient(opt)
	ctx = context.Background()
}

func main() {
	// Test Redis connection
	if err := rdbPub.Ping(ctx).Err(); err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	log.Println("Connected to Redis successfully")

	// Create a channel to handle graceful shutdown
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, syscall.SIGINT, syscall.SIGTERM)

	// Create a WaitGroup for managing goroutines
	var wg sync.WaitGroup

	// Subscribe to video processing tasks
	pubsub := rdbSub.Subscribe(ctx, "video_tasks")
	defer pubsub.Close()

	// Start processing messages
	wg.Add(1)
	go func() {
		defer wg.Done()
		ch := pubsub.Channel()

		for {
			select {
			case msg := <-ch:
				var task VideoTask
				if err := json.Unmarshal([]byte(msg.Payload), &task); err != nil {
					log.Printf("Error unmarshaling task: %v", err)
					continue
				}

				// Process the task in a separate goroutine
				wg.Add(1)
				go func(t VideoTask) {
					defer wg.Done()
					processVideoTask(t)
				}(task)

			case <-ctx.Done():
				return
			}
		}
	}()

	// Wait for shutdown signal
	<-shutdown
	log.Println("Shutting down gracefully...")

	// Cancel context and wait for all goroutines to finish
	pubsub.Close()
	wg.Wait()
	log.Println("Server shutdown complete")
}

func processVideoTask(task VideoTask) {
	log.Printf("Processing task: %s for file: %s", task.TaskType, task.FilePath)

	// Convert relative paths to absolute paths
	absFilePath := filepath.Join(uploadsVolume, task.FilePath)
	absOutputPath := filepath.Join(uploadsVolume, task.OutputPath)

	task.FilePath = absFilePath
	task.OutputPath = absOutputPath

	switch task.TaskType {
	case "poster":
		createPoster(task)
	case "webvtt":
		createWebVTT(task)
	case "trailer":
		createTrailer(task)
	default:
		log.Printf("Unknown task type: %s", task.TaskType)
	}
}

func createPoster(task VideoTask) {
	outputPath := filepath.Join(task.OutputPath, "poster.jpg")
	cmd := exec.Command("ffmpeg",
		"-i", task.FilePath,
		"-ss", "00:00:01",
		"-vframes", "1",
		"-vf", "scale=1280:720",
		outputPath,
	)

	if err := cmd.Run(); err != nil {
		log.Printf("Error creating poster: %v", err)
		return
	}

	notifyCompletion(task, outputPath)
}

func createWebVTT(task VideoTask) {
	// Get video duration
	duration, err := getVideoDuration(task.FilePath)
	if err != nil {
		log.Printf("Error getting video duration: %v", err)
		return
	}

	// Use config from task or fallback to defaults
	config := WebVTTConfig{
		Interval:   1.0,
		NumColumns: 5,
		Width:      160,
		Height:     90,
	}
	if cfg, ok := task.Config["webvtt"]; ok {
		config = cfg
	}

	// Generate sprite image
	spriteFile := filepath.Join(task.OutputPath, "storyboard.jpg")

	// Generate sprite image using ffmpeg
	cmd := exec.Command("ffmpeg",
		"-i", task.FilePath,
		"-vf", fmt.Sprintf("fps=1/%f,scale=%d:%d,tile=%dx%d",
			config.Interval,
			config.Width,
			config.Height,
			config.NumColumns,
			int(math.Ceil(duration/config.Interval/float64(config.NumColumns)))),
		"-frames:v", "1",
		spriteFile,
	)

	if err := cmd.Run(); err != nil {
		log.Printf("Error creating sprite image: %v", err)
		return
	}

	// Generate WebVTT file
	vttFile := filepath.Join(task.OutputPath, "thumbnails.vtt")
	vttContent := []string{"WEBVTT", ""}

	numThumbnails := int(math.Ceil(duration / config.Interval))
	for i := 0; i < numThumbnails; i++ {
		startTime := float64(i) * config.Interval
		endTime := math.Min(float64(i+1)*config.Interval, duration)

		row := i / config.NumColumns
		col := i % config.NumColumns
		x := col * config.Width
		y := row * config.Height

		vttContent = append(vttContent,
			formatTime(startTime)+" --> "+formatTime(endTime),
			fmt.Sprintf("/uploads/%s/storyboard.jpg#xywh=%d,%d,%d,%d", filepath.Base(task.OutputPath), x, y, config.Width, config.Height),
			"",
		)
	}

	if err := os.WriteFile(vttFile, []byte(strings.Join(vttContent, "\n")), 0644); err != nil {
		log.Printf("Error writing VTT file: %v", err)
		return
	}

	notifyCompletion(task, vttFile)
}

func formatTime(seconds float64) string {
	h := int(seconds / 3600)
	m := int(seconds/60) % 60
	s := seconds - float64(h*3600+m*60)
	return fmt.Sprintf("%02d:%02d:%06.3f", h, m, s)
}

func getVideoDuration(filePath string) (float64, error) {
	cmd := exec.Command("ffprobe",
		"-v", "error",
		"-show_entries", "format=duration",
		"-of", "default=noprint_wrappers=1:nokey=1",
		filePath,
	)
	output, err := cmd.Output()
	if err != nil {
		return 0, err
	}
	return strconv.ParseFloat(strings.TrimSpace(string(output)), 64)
}

func createTrailer(task VideoTask) {
	outputPath := filepath.Join(task.OutputPath, "trailer.mp4")
	cmd := exec.Command("ffmpeg",
		"-i", task.FilePath,
		"-ss", "00:00:00",
		"-t", "30",
		"-c:v", "libx264",
		"-c:a", "aac",
		"-strict", "experimental",
		outputPath,
	)

	if err := cmd.Run(); err != nil {
		log.Printf("Error creating trailer: %v", err)
		return
	}

	notifyCompletion(task, outputPath)
}

func notifyCompletion(task VideoTask, outputPath string) {
	// Verify output file exists
	if _, err := os.Stat(outputPath); os.IsNotExist(err) {
		log.Printf("Output file does not exist: %v", err)
		return
	}

	completion := struct {
		TaskType   string `json:"taskType"`
		FilePath   string `json:"filePath"`
		OutputPath string `json:"outputPath"`
		Status     string `json:"status"`
		Error      string `json:"error,omitempty"`
	}{
		TaskType:   task.TaskType,
		FilePath:   task.FilePath,
		OutputPath: outputPath,
		Status:     "completed",
	}

	payload, err := json.Marshal(completion)
	if err != nil {
		log.Printf("Error marshaling completion notification: %v", err)
		return
	}

	// Try to publish with retries
	maxRetries := 3
	for i := 0; i < maxRetries; i++ {
		if err := rdbPub.Publish(ctx, "video_completions", payload).Err(); err != nil {
			if i == maxRetries-1 {
				log.Printf("Failed to publish completion notification after %d retries: %v", maxRetries, err)
				return
			}
			log.Printf("Retrying publish after error: %v", err)
			time.Sleep(time.Second * time.Duration(i+1))
			continue
		}
		break
	}
}
