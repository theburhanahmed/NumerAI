#!/bin/bash

echo "🔍 Checking NumerAI required services..."

# Check if PostgreSQL is running
echo "Checking PostgreSQL..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if brew services list | grep postgresql | grep -q started; then
        echo "✅ PostgreSQL is running"
    else
        echo "❌ PostgreSQL is not running"
        echo "   Start it with: brew services start postgresql"
    fi
else
    # Linux
    if pg_isready > /dev/null 2>&1; then
        echo "✅ PostgreSQL is running"
    else
        echo "❌ PostgreSQL is not running"
        echo "   Start it with: sudo systemctl start postgresql"
    fi
fi

# Check if Redis is running
echo "Checking Redis..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if brew services list | grep redis | grep -q started; then
        echo "✅ Redis is running"
    else
        echo "❌ Redis is not running"
        echo "   Start it with: brew services start redis"
    fi
else
    # Linux
    if redis-cli ping > /dev/null 2>&1; then
        echo "✅ Redis is running"
    else
        echo "❌ Redis is not running"
        echo "   Start it with: sudo systemctl start redis"
    fi
fi

# Check if Docker is installed and containers are running
echo "Checking Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    
    # Check if docker-compose.yml exists and containers are running
    if [ -f "docker-compose.yml" ]; then
        if docker-compose ps | grep -q "Up"; then
            echo "✅ Docker containers are running"
        else
            echo "⚠️  Docker containers are not running"
            echo "   Start them with: docker-compose up -d"
        fi
    fi
else
    echo "⚠️  Docker is not installed"
    echo "   Download from: https://www.docker.com/products/docker-desktop"
fi

echo ""
echo "To run all services locally without Docker:"
echo "  macOS: brew services start postgresql redis"
echo "  Linux: sudo systemctl start postgresql redis"