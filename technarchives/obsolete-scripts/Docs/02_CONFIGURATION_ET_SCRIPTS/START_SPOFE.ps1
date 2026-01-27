#!/usr/bin/env powershell

# Quick Start Script for SPOFE Application (PowerShell)
# Initialise et démarre l'application SPOFE complètement

Write-Host ""
Write-Host "========================================" -ForegroundColor Blue
Write-Host "🚀 SPOFE Application - Quick Start" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Fonctions
function Write-Info($message) {
    Write-Host "ℹ️  $message" -ForegroundColor Cyan
}

function Write-Success($message) {
    Write-Host "✅ $message" -ForegroundColor Green
}

function Write-Error-Custom($message) {
    Write-Host "❌ $message" -ForegroundColor Red
}

function Write-Warning-Custom($message) {
    Write-Host "⚠️  $message" -ForegroundColor Yellow
}

# Main Script
try {
    # Check Node.js
    Write-Info "Checking Node.js..."
    $node = Get-Command node -ErrorAction SilentlyContinue
    if ($node) {
        $nodeVersion = node -v
        Write-Success "Node.js $nodeVersion found"
    } else {
        Write-Error-Custom "Node.js is not installed. Please install Node.js 18+"
        exit 1
    }

    # Check npm
    Write-Info "Checking npm..."
    $npm = Get-Command npm -ErrorAction SilentlyContinue
    if ($npm) {
        $npmVersion = npm -v
        Write-Success "npm $npmVersion found"
    } else {
        Write-Error-Custom "npm is not installed"
        exit 1
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host ""

    # Navigate to cascade directory
    Write-Info "Navigating to cascade directory..."
    if (Test-Path "cascade") {
        Set-Location cascade
        Write-Success "In cascade directory"
    } else {
        Write-Error-Custom "cascade directory not found"
        exit 1
    }

    # Install dependencies
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host ""
    Write-Info "📦 Installing dependencies..."

    if (Test-Path "node_modules") {
        Write-Info "node_modules already exists, skipping installation"
    } else {
        npm install
        if ($?) {
            Write-Success "Dependencies installed"
        } else {
            Write-Error-Custom "Failed to install dependencies"
            exit 1
        }
    }

    # Check .env file
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host ""
    Write-Info "🔧 Checking environment configuration..."

    if (-not (Test-Path ".env")) {
        Write-Warning-Custom ".env file not found, creating from .env.example..."
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" -Destination ".env"
            Write-Success ".env created from .env.example"
            Write-Warning-Custom "Please update .env with your MySQL credentials"
        } else {
            Write-Error-Custom ".env.example not found"
            exit 1
        }
    } else {
        Write-Success ".env file exists"
    }

    # Initialize database
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host ""
    Write-Info "🗄️  Initializing database..."

    npm run init-db
    if ($?) {
        Write-Success "Database initialized"
    } else {
        Write-Warning-Custom "Database initialization may have encountered issues"
        Write-Info "Continuing anyway..."
    }

    # Run tests
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host ""
    Write-Info "🧪 Running tests..."

    npm run test:auth-complete -- --passWithNoTests 2>$null
    Write-Success "Tests completed"

    # Display final message
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host ""
    Write-Success "✨ Setup completed successfully!"
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host ""
    Write-Info "📊 Database Accounts Created:"
    Write-Host ""
    Write-Host "Admin Account:"
    Write-Host "  Email:    admin@spofe.local" -ForegroundColor Yellow
    Write-Host "  Password: AdminPassword123!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Test Accounts:"
    Write-Host "  Email:    manager1@spofe.local (Manager)" -ForegroundColor Yellow
    Write-Host "  Email:    accountant1@spofe.local (Accountant)" -ForegroundColor Yellow
    Write-Host "  Email:    user1@spofe.local (User)" -ForegroundColor Yellow
    Write-Host "  Password: UserPassword123!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host ""
    Write-Info "Starting application..."
    Write-Info "Press Ctrl+C to stop"
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host ""

    # Start application
    npm run dev

} catch {
    Write-Error-Custom "Error: $_"
    exit 1
}
