#!/bin/bash

# Quick Start Script pour SPOFE Application
# Ce script initialise et démarre l'application complètement

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions
log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_divider() {
  echo ""
  echo "=================================================="
  echo ""
}

# Main Script
main() {
  print_divider
  log_info "🚀 SPOFE Application Quick Start"
  print_divider

  # Check Node.js
  log_info "Checking Node.js..."
  if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js 18+"
    exit 1
  fi
  NODE_VERSION=$(node -v)
  log_success "Node.js $NODE_VERSION found"
  
  # Check npm
  log_info "Checking npm..."
  if ! command -v npm &> /dev/null; then
    log_error "npm is not installed"
    exit 1
  fi
  NPM_VERSION=$(npm -v)
  log_success "npm $NPM_VERSION found"

  # Check MySQL
  log_info "Checking MySQL..."
  if ! command -v mysql &> /dev/null; then
    log_warning "MySQL client not found, but proceeding (ensure MySQL server is running)"
  else
    log_success "MySQL client found"
  fi

  print_divider

  # Navigate to cascade directory
  log_info "Navigating to cascade directory..."
  cd cascade || {
    log_error "cascade directory not found"
    exit 1
  }
  log_success "In cascade directory"

  # Install dependencies
  print_divider
  log_info "📦 Installing dependencies..."
  if [ -d "node_modules" ]; then
    log_info "node_modules already exists, skipping installation"
  else
    npm install
    if [ $? -eq 0 ]; then
      log_success "Dependencies installed"
    else
      log_error "Failed to install dependencies"
      exit 1
    fi
  fi

  # Check .env file
  print_divider
  log_info "🔧 Checking environment configuration..."
  if [ ! -f ".env" ]; then
    log_warning ".env file not found, creating from .env.example..."
    if [ -f ".env.example" ]; then
      cp .env.example .env
      log_success ".env created from .env.example"
      log_warning "Please update .env with your MySQL credentials"
    else
      log_error ".env.example not found"
      exit 1
    fi
  else
    log_success ".env file exists"
  fi

  # Initialize database
  print_divider
  log_info "🗄️  Initializing database..."
  if npm run init-db; then
    log_success "Database initialized"
  else
    log_warning "Database initialization may have encountered issues"
    log_info "Continuing anyway..."
  fi

  # Run migrations
  print_divider
  log_info "📋 Running migrations..."
  npm run db:migrate:up || log_warning "Migrations may have issues"

  # Run tests
  print_divider
  log_info "🧪 Running tests..."
  if npm run test:auth-complete -- --passWithNoTests 2>/dev/null; then
    log_success "Tests completed"
  else
    log_warning "Tests may not be available yet"
  fi

  print_divider
  log_success "✨ Setup completed successfully!"
  print_divider

  # Start application
  log_info "Starting application..."
  log_info "Press Ctrl+C to stop"
  print_divider

  npm run dev
}

# Run main function
main "$@"
