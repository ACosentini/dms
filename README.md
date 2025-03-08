# Document Management System (DMS)

A full-stack document management system built with Spring Boot and React, containerized with Docker.

## Features

- User authentication and authorization with JWT
- Document upload, download, and management
- Document tagging and categorization
- Search functionality
- Responsive UI

## Tech Stack

- **Backend**: Java Spring Boot
- **Frontend**: React
- **Database**: MySQL
- **Containerization**: Docker

## Development Setup

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose
- Git

### Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/dms.git
   cd dms
   ```

2. Create a `.env` file in the project root with the following variables:

   ```
   # Database credentials
   MYSQL_DATABASE=dms
   MYSQL_USER=dmsuser
   MYSQL_PASSWORD=your_secure_password_here
   MYSQL_ROOT_PASSWORD=your_secure_root_password_here

   # Spring datasource
   SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/dms
   SPRING_DATASOURCE_USERNAME=dmsuser
   SPRING_DATASOURCE_PASSWORD=your_secure_password_here

   # JWT Secret
   JWT_SECRET=your_very_long_and_secure_random_string_here
   JWT_EXPIRATION=86400000
   ```

3. Start the development environment:

   ```bash
   docker-compose up
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

### Development Workflow

This project is set up with hot reloading for both frontend and backend:

- **Frontend**: Changes to React files are automatically reflected in the browser
- **Backend**: Changes to Java files trigger automatic recompilation and restart

When you make changes to your code:

1. **Frontend changes**: Save the file and the browser will automatically update
2. **Backend changes**: Save the file and the application will automatically recompile and restart

The console will show logs of the restart process when backend files are changed.

## Project Structure
