package amqpconfig

// Constants for RabbitMQ configuration
var (
	Exchange = "video/processing"

	Queues = struct {
		Tasks string
	}{
		Tasks: "video/tasks",
	}

	RoutingKeys = struct {
		Task string
	}{
		Task: "video.task.*",
	}
)
