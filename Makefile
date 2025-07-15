COMPOSE := docker compose

.PHONY: build up down logs restart

# Image bauen
build:
	$(COMPOSE) build pocketbase

# Container starten
up: build
	$(COMPOSE) up -d pocketbase

# Container stoppen
down:
	$(COMPOSE) down

# Logs anzeigen (follow)
logs:
	$(COMPOSE) logs -f pocketbase

# Neustart des Pocketbase-Containers
restart:
	$(COMPOSE) restart pocketbase