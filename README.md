
          
# Learning Management System API

## Overview
A comprehensive Learning Management System (LMS) backend built with Node.js, Express, and MongoDB. This system provides APIs for managing courses, lessons, quizzes, user progress tracking, and user authentication.

## Table of Contents
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Courses](#courses)
  - [Lessons](#lessons)
  - [Quizzes](#quizzes)
  - [Progress Tracking](#progress-tracking)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- Git

### Installation Steps

1. Clone the repository (if not already done)
   ```bash
   git clone <repository-url>
   cd learning_Management_System
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90
   ```

4. Start the development server
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

5. The server will start on port 3000 (or the port specified in your .env file)

## API Documentation

### Authentication

#### Register a new user
```
POST /api/auth/signup
```
Body:
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "passwordConfirm": "password123",
  "role": "student" // Optional: default is "student", can be "instructor" or "admin"
}
```

#### Login
```
POST /api/auth/login
```
Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Logout
```
GET /api/auth/logout
```

### Users

**Note:** All user routes require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer your_jwt_token
```

#### Get current user profile
```
GET /api/users/me
```

#### Get all users (admin only)
```
GET /api/users
```

#### Get user by ID (admin only)
```
GET /api/users/:id
```

#### Update user (admin only)
```
PATCH /api/users/:id
```

#### Delete user (admin only)
```
DELETE /api/users/:id
```

### Courses

#### Get all courses (public)
```
GET /api/courses
```
Query parameters:
- `category`: Filter by category
- `difficulty`: Filter by difficulty level
- `instructor`: Filter by instructor ID
- `sort`: Sort field (e.g., `sort=price,-createdAt`)
- `page`: Page number
- `limit`: Results per page

#### Get course by ID (public)
```
GET /api/courses/:id
```

#### Create course (instructors and admins only)
```
POST /api/courses
```
Body:
```json
{
  "title": "Course Title",
  "description": "Course description",
  "category": "Web Development",
  "difficulty": "Beginner",
  "price": 49.99,
  "duration": 8,
  "requirements": ["Basic HTML knowledge", "JavaScript fundamentals"],
  "objectives": ["Build responsive websites", "Master CSS frameworks"]
}
```

#### Update course (course instructor and admins only)
```
PATCH /api/courses/:id
```

#### Delete course (course instructor and admins only)
```
DELETE /api/courses/:id
```

#### Enroll in a course (authenticated users)
```
POST /api/courses/:id/enroll
```

### Lessons

**Note:** All lesson routes require authentication.

#### Get all lessons
```
GET /api/lessons
```

#### Get lessons for a specific course
```
GET /api/courses/:courseId/lessons
```

#### Get lesson by ID
```
GET /api/lessons/:id
```

#### Create lesson (course instructor and admins only)
```
POST /api/courses/:courseId/lessons
```
Body:
```json
{
  "title": "Lesson Title",
  "content": "Lesson content goes here...",
  "order": 1,
  "duration": 30,
  "resources": ["URL to resource 1", "URL to resource 2"]
}
```

#### Update lesson (course instructor and admins only)
```
PATCH /api/lessons/:id
```

#### Delete lesson (course instructor and admins only)
```
DELETE /api/lessons/:id
```

#### Mark lesson as complete
```
POST /api/lessons/:id/complete
```

### Quizzes

**Note:** All quiz routes require authentication.

#### Get all quizzes
```
GET /api/quizzes
```

#### Get quizzes for a specific lesson
```
GET /api/lessons/:lessonId/quizzes
```

#### Get quiz by ID
```
GET /api/quizzes/:id
```

#### Create quiz (course instructor and admins only)
```
POST /api/lessons/:lessonId/quizzes
```
Body:
```json
{
  "title": "Quiz Title",
  "description": "Quiz description",
  "timeLimit": 30,
  "passingScore": 70,
  "questions": [
    {
      "content": "What is HTML?",
      "type": "multiple-choice",
      "options": ["Hypertext Markup Language", "High-level Text ML", "Hyperlink and Text Markup Language", "None of the above"],
      "correctAnswer": 0,
      "points": 10
    }
  ]
}
```

#### Update quiz (course instructor and admins only)
```
PATCH /api/quizzes/:id
```

#### Delete quiz (course instructor and admins only)
```
DELETE /api/quizzes/:id
```

#### Submit quiz answers
```
POST /api/quizzes/:id/submit
```
Body:
```json
{
  "answers": [
    {
      "questionIndex": 0,
      "selectedOption": 0
    }
  ]
}
```

### Progress Tracking

**Note:** All progress routes require authentication.

#### Get user's progress for all courses
```
GET /api/progress
```

#### Get user's progress for a specific course
```
GET /api/progress/courses/:courseId
```

#### Get all students' progress for a course (instructors and admins only)
```
GET /api/progress/instructor/courses/:courseId
```

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses follow this format:
```json
{
  "status": "fail",
  "message": "Error message details"
}
```

## Authentication

Most endpoints require authentication using JWT (JSON Web Tokens). After logging in, include the token in the Authorization header of subsequent requests:

```
Authorization: Bearer your_jwt_token
```

The token expires after the time specified in the JWT_EXPIRES_IN environment variable (default: 90 days).
        
