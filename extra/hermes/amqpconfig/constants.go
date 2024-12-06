package amqpconfig

// Constants for RabbitMQ configuration
var (
	Exchange = "video/processing"

	Queues = struct {
		Tasks       string
		Completions string
	}{
		Tasks:       "video/tasks",
		Completions: "video/completions",
	}

	RoutingKeys = struct {
		Task       string
		Completion string
	}{
		Task:       "video.task.*",
		Completion: "video.completion",
	}
)
