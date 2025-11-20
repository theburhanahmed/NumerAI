#!/bin/bash

# Setup script for local development environment
echo "🔧 Setting up NumerAI local development environment..."

# Check if we're on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo "🍺 Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    # Install PostgreSQL and Redis
    echo "📦 Installing PostgreSQL and Redis..."
    brew install postgresql redis
    
    # Start services
    echo "🚀 Starting PostgreSQL and Redis services..."
    brew services start postgresql
    brew services start redis
    
    # Wait a moment for services to start
    sleep 5
else
    echo "⚠️  This script is optimized for macOS. Please manually install PostgreSQL and Redis for your system."
    echo "For Ubuntu/Debian:"
    echo "  sudo apt update"
    echo "  sudo apt install postgresql redis-server"
    echo "  sudo systemctl start postgresql redis"
    exit 1
fi

# Setup backend
echo "⚙️  Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
DB_NAME=numerai
DB_USER=numerai
DB_PASSWORD=numerai
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=django-insecure-development-key-change-in-production
DEBUG=True
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
EOF
fi

# Run migrations
echo "📊 Running database migrations..."
python manage.py migrate

# Collect static files
echo "📂 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Backend setup complete!"

# Setup frontend
echo "🎨 Setting up frontend..."
cd ../frontend

# Install Node dependencies
echo "📥 Installing Node dependencies..."
npm install

echo "✅ Frontend setup complete!"

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "To start the development environment:"
echo "  1. Start the backend: cd backend && source venv/bin/activate && python manage.py runserver"
echo "  2. Start the frontend: cd frontend && npm run dev"
echo ""
echo "The application will be available at:"
echo "  - Backend API: http://localhost:8000/"
echo "  - Frontend: http://localhost:3000/"