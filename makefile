# Makefile
.PHONY: help build up down logs clean install setup dev test

# Variables
DOCKER_COMPOSE = docker-compose
DOCKER_COMPOSE_DEV = docker-compose -f docker-compose.yml -f docker-compose.dev.yml

help: ## Mostrar ayuda
	@echo "Comandos disponibles:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $1, $2}' $(MAKEFILE_LIST)

setup: ## Setup inicial del proyecto
	@echo "🚀 Configurando proyecto RespiCare-Tacna..."
	@cp .env.example .env
	@mkdir -p mongodb/init ai-services/models ai-services/cache nginx/ssl
	@echo "✅ Setup completado. Edita el archivo .env con tus configuraciones."

build: ## Construir todas las imágenes
	@echo "🔨 Construyendo imágenes Docker..."
	$(DOCKER_COMPOSE_DEV) build

up: ## Levantar todos los servicios
	@echo "🚀 Iniciando servicios..."
	$(DOCKER_COMPOSE_DEV) up -d

dev: ## Modo desarrollo con logs
	@echo "🔧 Iniciando en modo desarrollo..."
	$(DOCKER_COMPOSE_DEV) up

down: ## Detener todos los servicios
	@echo "🛑 Deteniendo servicios..."
	$(DOCKER_COMPOSE) down

logs: ## Ver logs de todos los servicios
	$(DOCKER_COMPOSE) logs -f

logs-web: ## Ver logs del frontend
	$(DOCKER_COMPOSE) logs -f web

logs-backend: ## Ver logs del backend
	$(DOCKER_COMPOSE) logs -f backend

logs-ai: ## Ver logs de servicios IA
	$(DOCKER_COMPOSE) logs -f ai-services

install: ## Instalar dependencias en todos los servicios
	@echo "📦 Instalando dependencias..."
	$(DOCKER_COMPOSE) exec backend npm install
	$(DOCKER_COMPOSE) exec web npm install
	$(DOCKER_COMPOSE) exec ai-services pip install -r requirements.txt

test: ## Ejecutar tests
	@echo "🧪 Ejecutando tests..."
	$(DOCKER_COMPOSE) exec backend npm test
	$(DOCKER_COMPOSE) exec web npm test
	$(DOCKER_COMPOSE) exec ai-services python -m pytest

clean: ## Limpiar contenedores y volúmenes
	@echo "🧹 Limpiando sistema..."
	$(DOCKER_COMPOSE) down -v --remove-orphans
	docker system prune -f

restart: down up ## Reiniciar todos los servicios

shell-backend: ## Acceder al shell del backend
	$(DOCKER_COMPOSE) exec backend sh

shell-ai: ## Acceder al shell de IA services
	$(DOCKER_COMPOSE) exec ai-services bash

db-backup: ## Backup de la base de datos
	@echo "💾 Creando backup..."
	docker exec respicare-mongodb mongodump --archive=/backup/respicare-$(shell date +%Y%m%d_%H%M%S).archive --gzip

db-restore: ## Restaurar base de datos (especificar BACKUP_FILE=nombre)
	@echo "♻️ Restaurando backup..."
	docker exec respicare-mongodb mongorestore --archive=/backup/$(BACKUP_FILE) --gzip

status: ## Ver estado de servicios
	$(DOCKER_COMPOSE) ps

health: ## Check de salud de servicios
	@echo "🏥 Verificando salud de servicios..."
	@curl -f http://localhost:3001/health || echo "❌ Backend no disponible"
	@curl -f http://localhost:3000 || echo "❌ Web no disponible"
	@curl -f http://localhost:8000/health || echo "❌ AI Services no disponible"
	@echo "✅ Health check completado"