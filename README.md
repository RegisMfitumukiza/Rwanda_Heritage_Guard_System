# 🏛️ Rwanda Heritage Guard System

A comprehensive digital platform for preserving, managing, and promoting Rwanda's rich cultural heritage through modern web technologies.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The Rwanda Heritage Guard System is a full-stack web application designed to digitize and preserve Rwanda's cultural heritage. The system provides a modern interface for managing heritage sites, artifacts, and cultural information while making this valuable knowledge accessible to researchers, tourists, and the general public.

## ✨ Features

### 🏛️ Heritage Management
- **Heritage Site Registration**: Register and manage cultural heritage sites
- **Artifact Cataloging**: Digital catalog of cultural artifacts and items
- **Multilingual Support**: Support for multiple languages including Kinyarwanda
- **Image Management**: Upload and manage heritage site and artifact images
- **Location Mapping**: Geographic information for heritage sites

### 👥 User Management
- **Authentication System**: Secure user registration and login
- **Role-based Access**: Different access levels for administrators and users
- **User Profiles**: Personalized user experience

### 📚 Educational Features
- **Heritage Education**: Educational content about Rwanda's heritage
- **Quiz System**: Interactive learning through heritage quizzes
- **Cultural Information**: Rich content about traditions and history

### 🔍 Search & Discovery
- **Advanced Search**: Search heritage sites and artifacts
- **Filtering Options**: Filter by location, category, and other criteria
- **Responsive Design**: Optimized for desktop and mobile devices

## 🛠️ Technology Stack

### Frontend
- **React.js** - Modern JavaScript library for building user interfaces
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for styling
- **shadcn/ui** - Modern component library built on Radix UI
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication

### Backend
- **Spring Boot 3.2.3** - Java-based framework for building web applications
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Data access layer
- **PostgreSQL** - Relational database
- **Flyway** - Database migration tool
- **JWT** - JSON Web Tokens for authentication
- **Lombok** - Reduces boilerplate code
- **Google OAuth** - Social authentication

### Development Tools
- **Maven** - Build automation and dependency management
- **Node.js & npm** - JavaScript runtime and package manager
- **Git** - Version control

## 📁 Project Structure

```
📁 Rwanda Heritage Guard System/
├── 📁 frontend/                    # React.js frontend application
│   ├── 📁 src/                    # Source code
│   ├── 📁 public/                 # Static assets
│   ├── 📄 package.json           # Frontend dependencies
│   ├── 📄 vite.config.js         # Vite configuration
│   ├── 📄 tailwind.config.js     # Tailwind CSS configuration
│   └── 📄 README.md              # Frontend-specific documentation
├── 📁 backend/                    # Spring Boot backend application
│   ├── 📁 src/                   # Source code
│   ├── 📁 uploads/               # File uploads directory
│   ├── 📄 pom.xml               # Maven dependencies
│   └── 📄 run.bat               # Windows run script
├── 📁 docs/                      # Documentation
├── 📁 checkpoint/                # Project checkpoints
└── 📄 README.md                  # This file
```

## ⚙️ Prerequisites

Before running this application, make sure you have the following installed:

- **Java 17** or higher
- **Node.js 16** or higher
- **npm** (comes with Node.js)
- **Maven 3.6** or higher
- **PostgreSQL 12** or higher
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd "RWANDA HERITAGE GUARD SYSTEM FINAL"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Maven dependencies
mvn clean install

# Configure database (update application.properties with your PostgreSQL credentials)
# Create a PostgreSQL database named 'heritage_guard'
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install
```

## 🏃‍♂️ Running the Application

### Start the Backend Server

```bash
# From the root directory
mvn spring-boot:run

# Or from the backend directory
cd backend
mvn spring-boot:run
```

The Spring Boot application will start on `http://localhost:8080`

### Start the Frontend Development Server

```bash
# From the frontend directory
cd frontend
npm run dev
```

The React application will start on `http://localhost:5173`

### Access the Application

- **Frontend**: Open your browser and navigate to `http://localhost:5173`
- **Backend API**: Available at `http://localhost:8080/api`

## 📚 API Documentation

The backend provides RESTful APIs for:

- **Authentication**: `/api/auth/*`
- **Heritage Sites**: `/api/heritage-sites/*`
- **Artifacts**: `/api/artifacts/*`
- **Users**: `/api/users/*`
- **Education**: `/api/education/*`

### API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/heritage-sites` - Get all heritage sites
- `POST /api/heritage-sites` - Create new heritage site
- `GET /api/artifacts` - Get all artifacts
- `POST /api/artifacts` - Create new artifact

## 🔧 Configuration

### Backend Configuration

Update `backend/src/main/resources/application.properties` with your database credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/heritage_guard
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Frontend Configuration

The frontend is configured to connect to the backend API. Update API endpoints in the frontend code if needed.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Rwanda Cultural Heritage Board
- Spring Boot and React.js communities
- All contributors and supporters

---

**Built with ❤️ for preserving Rwanda's cultural heritage** 