# MarketHub - E-commerce Analytics & Price Tracker

A comprehensive MERN stack application for e-commerce analytics, price tracking, and business intelligence.

## Features

- 📊 Real-time analytics dashboard
- 💰 Multi-platform price tracking
- 📈 Product performance monitoring
- 🔐 JWT authentication
- 📝 Comprehensive logging with ELK Stack
- 📊 System monitoring with Prometheus & Grafana
- 🚀 Background task processing with Celery
- ⚡ Redis caching for performance

## Tech Stack

**Frontend:** React.js, Bootstrap, Axios, Socket.IO
**Backend:** Node.js, Express.js, MongoDB, Redis
**Worker:** Python, Celery, RabbitMQ
**Monitoring:** Prometheus, Grafana, ELK Stack
**Deployment:** Docker, Docker Compose

## Prerequisites

- Docker & Docker Compose installed
- 8GB RAM minimum
- Ports available: 3000, 5001, 27017, 6379, 5672, 9200, 5601, 9090, 3001

## Quick Start

1. Clone the repository
2. Create .env file from .env.example
3. Run the application:
```bash
docker-compose up --build
```

4. Access the services:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - Kibana: http://localhost:5601
   - Grafana: http://localhost:3001 (admin/admin123)
   - Prometheus: http://localhost:9090
   - RabbitMQ Management: http://localhost:15672 (admin/admin123)

## Default Credentials

**Grafana:** admin / admin123
**RabbitMQ:** admin / admin123
**MongoDB:** admin / admin123

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user

### Products
- GET /api/products - Get all products
- POST /api/products - Add new product
- GET /api/products/:id - Get product details
- PUT /api/products/:id - Update product
- DELETE /api/products/:id - Delete product

### Analytics
- GET /api/analytics/overview - Get analytics overview
- GET /api/analytics/trends - Get price trends
- GET /api/analytics/performance - Get product performance

## Development

To run individual services for development:
```bash
# Frontend
cd frontend
npm install
npm start

# Backend
cd backend
npm install
npm run dev

# Celery Worker
cd celery-worker
pip install -r requirements.txt
celery -A celery_app worker --loglevel=info
```

## License

MIT License# markethub
# markethub
