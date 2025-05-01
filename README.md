# Document Management System (DMS)

A full-stack document management system built with Spring Boot and React, containerized with Docker.

## Features

- User authentication and authorization with JWT
- Document upload, download, and management
- Document tagging and categorization
- Search functionality
- Secure file storage with encryption

## Tech Stack

- **Backend**: Java Spring Boot
- **Frontend**: React
- **Database**: PostgreSQL
- **Containerization**: Docker
- **Deployment**: Render

## Development Setup

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose
- Git

### Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/ACosentini/dms.git
   cd dms
   ```

2. Create a `.env` file in the project root with the following variables:

   ```
   # PostgreSQL database configuration
   POSTGRES_DB=dms_db
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres

   # Spring datasource
   SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/dms_db
   SPRING_DATASOURCE_USERNAME=postgres
   SPRING_DATASOURCE_PASSWORD=postgres
   SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT=org.hibernate.dialect.PostgreSQLDialect

   # JWT Secret
   JWT_SECRET=development_jwt_secret_key_please_change_in_production
   JWT_EXPIRATION=86400000

   # Environment setting
   SPRING_PROFILES_ACTIVE=dev

   # Encryption secret
   ENCRYPTION_SECRET=development_encryption_key_please_change_in_production

   # File storage location
   FILE_UPLOAD_DIR=./uploads/dev
   ```

3. Start the development environment:

   ```bash
   docker-compose up
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api

### Development Workflow

This project is set up with hot reloading for both frontend and backend:

- **Frontend**: Changes to React files are automatically reflected in the browser
- **Backend**: Changes to Java files trigger automatic recompilation and restart

When you make changes to your code:

1. **Frontend changes**: Save the file and the browser will automatically update
2. **Backend changes**: Save the file and the application will automatically recompile and restart

The console will show logs of the restart process when backend files are changed.

## Deployment

The application is deployed on Render with the following setup:

### Backend Service

- Web Service with Docker
- Environment Variables:
  - `PORT=10000` (Render's default port)
  - Database connection details
  - JWT and encryption secrets
  - File storage configuration

### Frontend Service

- Web Service with Docker
- Environment Variables:
  - `BACKEND_URL`: The URL of the backend service

### Database

- PostgreSQL database service

## Project Structure

```
dms/
├── backend/                 # Spring Boot backend
│   ├── src/                 # Source files
│   ├── Dockerfile           # Production Docker configuration
│   └── Dockerfile.dev       # Development Docker configuration
├── frontend/                # React frontend
│   ├── src/                 # Source files
│   ├── Dockerfile           # Production Docker configuration
│   ├── Dockerfile.dev       # Development Docker configuration
│   └── nginx.conf           # Nginx configuration for production
├── docker-compose.yml       # Development environment setup
└── docker-compose.prod.yml  # Production environment setup
```

## Important Notes

- The backend uses context path `/api` for all endpoints
- Frontend uses nginx to proxy API requests to the backend
- Port 10000 is used for the backend service on Render
- File storage is configured in the environment variables
