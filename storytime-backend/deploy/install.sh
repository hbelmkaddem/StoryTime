#!/bin/bash
# StoryTime Backend - Installation Script
# Run this on your VPS after cloning the repo

set -e

echo "=== StoryTime Backend Installation ==="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "ERROR: Please run this script from the storytime-backend directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo ""
    echo "IMPORTANT: Edit the .env file with your credentials:"
    echo "  nano .env"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Build and start containers
echo "Building and starting Docker containers..."
docker-compose up -d --build

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Check if API is running
echo "Checking API health..."
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo "API is running!"
else
    echo "WARNING: API health check failed. Check logs with: docker-compose logs"
fi

echo ""
echo "=== Installation Complete ==="
echo ""
echo "Next steps:"
echo "1. Configure Nginx (see deploy/nginx-storytime-api.conf)"
echo "2. Install SSL certificate with certbot"
echo "3. Test the API: curl http://localhost:8000/health"
echo ""
