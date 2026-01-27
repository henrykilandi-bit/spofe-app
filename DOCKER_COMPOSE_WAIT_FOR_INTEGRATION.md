# Docker Compose Integration Guide
# Comment intégrer les scripts wait-for avec docker-compose

version: "3.9"

services:
  # ✅ À ajouter dans votre docker-compose.yml existant

  # Backend - dépend de MySQL et Redis
  backend:
    build:
      context: ./cascade
      dockerfile: ../Dockerfile.backend.v2.1
    container_name: spofe-backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USER=root
      - DB_PASSWORD=${DB_PASSWORD:-admin}
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET:-your-secret-key}
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 10s
      timeout: 5s
      retries: 3
    volumes:
      - ./cascade:/app
    networks:
      - spofe-network

  # Frontend - n'a pas de dépendance externe
  frontend:
    build:
      context: ./frontend
      dockerfile: ../Dockerfile.frontend
    container_name: spofe-frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3001
    volumes:
      - ./frontend:/app
    networks:
      - spofe-network

  # MySQL avec health check
  mysql:
    image: mysql:8.0
    container_name: spofe-mysql
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD:-admin}
      MYSQL_DATABASE: spofe_db
    volumes:
      - mysql-data:/var/lib/mysql
      - ./cascade/migrations:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - spofe-network

  # Redis avec health check
  redis:
    image: redis:6-alpine
    container_name: spofe-redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - spofe-network

  # Nginx (reverse proxy)
  nginx:
    image: nginx:alpine
    container_name: spofe-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - frontend
    networks:
      - spofe-network

volumes:
  mysql-data:
  redis-data:

networks:
  spofe-network:
    driver: bridge

# ┌─────────────────────────────────────────────────────────┐
# │  UTILISATION AVEC LES SCRIPTS WAIT-FOR                  │
# └─────────────────────────────────────────────────────────┘

# 1. Démarrer les conteneurs
# docker-compose up -d

# 2. Attendre les services (Linux/Mac)
# ./wait-for-mysql.sh 127.0.0.1 3306 60 && \
# ./wait-for-redis.sh 127.0.0.1 6379 60

# 3. Attendre les services (Windows)
# .\wait-for-mysql.ps1 && .\wait-for-redis.ps1

# 4. Vérifier la santé
# docker-compose ps
# docker-compose logs backend

# 5. Arrêter les conteneurs
# docker-compose down

# ┌─────────────────────────────────────────────────────────┐
# │  HEALTH CHECKS INTÉGRÉS                                 │
# └─────────────────────────────────────────────────────────┘

# MySQL:
# - Test: mysqladmin ping
# - Interval: 10s
# - Timeout: 5s
# - Retries: 5

# Redis:
# - Test: redis-cli ping
# - Interval: 10s
# - Timeout: 5s
# - Retries: 5

# Backend:
# - Test: GET /api/health
# - Interval: 10s
# - Timeout: 5s
# - Retries: 3

# ┌─────────────────────────────────────────────────────────┐
# │  VARIABLES D'ENVIRONNEMENT                              │
# └─────────────────────────────────────────────────────────┘

# Créer un fichier .env:
# DB_PASSWORD=your_secure_password
# JWT_SECRET=your_jwt_secret_key
# NODE_ENV=development
# VITE_API_URL=http://localhost:3001
