COMPOSE := docker compose

.PHONY: build up down logs restart

# Build the image
build:
	$(COMPOSE) build pocketbase

# Start the container
up: build
	$(COMPOSE) up -d pocketbase

# Stop the container
down:
	$(COMPOSE) down

# Show logs (follow mode)
logs:
	$(COMPOSE) logs -f pocketbase

# Restart the Pocketbase container
restart:
	$(COMPOSE) restart pocketbase