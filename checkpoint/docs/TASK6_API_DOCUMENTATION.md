# Task 6: Education & Awareness Module - Complete API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Models](#data-models)
4. [Educational Articles API](#educational-articles-api)
5. [Quizzes API](#quizzes-api)
6. [Quiz Questions API](#quiz-questions-api)
7. [Quiz Options API](#quiz-options-api)
8. [Quiz Attempts API](#quiz-attempts-api)
9. [Error Handling](#error-handling)
10. [Response Formats](#response-formats)

## Overview

The Education & Awareness Module provides a comprehensive system for managing educational content and interactive quizzes. It supports multilingual content delivery, automatic quiz evaluation, and user progress tracking. The module is designed with role-based access control, allowing different user types to interact with the system according to their permissions.

### Key Features
- **Educational Content Management**: Create, update, and manage educational articles
- **Interactive Quizzes**: Multiple-choice quizzes with automatic evaluation
- **Multilingual Support**: Content available in English, Kinyarwanda, and French
- **Quiz Categories/Tags**: Organize quizzes with descriptive tags
- **User Progress Tracking**: Monitor quiz attempts, scores, and completion status
- **Public Access**: Read-only access to educational content for public users
- **Role-based Security**: Different access levels for different user roles

## Authentication & Authorization

### Access Levels
- **Public**: Read-only access to public educational articles and quizzes
- **Community Member+**: Access to quiz attempts and personal results
- **Content Manager+**: Full CRUD operations on educational content
- **Admin**: Full system access

### Required Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Data Models

### EducationalArticle
```json
{
  "id": 1,
  "titleEn": "Rwanda's Cultural Heritage",
  "titleRw": "Umurage w'Ubwoko bw'Abanyarwanda",
  "titleFr": "Le Patrimoine Culturel du Rwanda",
  "contentEn": "Article content in English...",
  "contentRw": "Ibiri mu nyandiko mu Kinyarwanda...",
  "contentFr": "Contenu de l'article en français...",
  "summaryEn": "Brief summary in English",
  "summaryRw": "Inyandiko nto mu Kinyarwanda",
  "summaryFr": "Résumé bref en français",
  "isPublic": true,
  "isActive": true,
  "createdBy": "user123",
  "createdDate": "2024-01-15T10:30:00",
  "updatedBy": "user123",
  "updatedDate": "2024-01-15T10:30:00"
}
```

### Quiz
```json
{
  "id": 1,
  "titleEn": "Rwanda Heritage Quiz",
  "titleRw": "Ikibazo cy'Umurage w'Abanyarwanda",
  "titleFr": "Quiz sur le Patrimoine du Rwanda",
  "descriptionEn": "Test your knowledge about Rwanda's heritage",
  "descriptionRw": "Gerageza ubumenyi bwawe kuri umurage w'Abanyarwanda",
  "descriptionFr": "Testez vos connaissances sur le patrimoine du Rwanda",
  "articleId": 1,
  "passingScore": 70,
  "timeLimit": 30,
  "maxAttempts": 3,
  "isPublic": true,
  "isActive": true,
  "tags": "heritage,history,culture",
  "createdBy": "content_manager",
  "createdDate": "2024-01-15T10:30:00",
  "updatedBy": "content_manager",
  "updatedDate": "2024-01-15T10:30:00"
}
```

### QuizQuestion
```json
{
  "id": 1,
  "quizId": 1,
  "questionTextEn": "What is the capital of Rwanda?",
  "questionTextRw": "Umurwa mukuru w'u Rwanda ni nde?",
  "questionTextFr": "Quelle est la capitale du Rwanda?",
  "explanationEn": "Kigali is the capital and largest city of Rwanda",
  "explanationRw": "Kigali ni umurwa mukuru kandi ni umugi munini wa Rwanda",
  "explanationFr": "Kigali est la capitale et la plus grande ville du Rwanda",
  "questionType": "MULTIPLE_CHOICE",
  "points": 10,
  "questionOrder": 1,
  "isActive": true,
  "createdBy": "content_manager",
  "createdDate": "2024-01-15T10:30:00",
  "updatedBy": "content_manager",
  "updatedDate": "2024-01-15T10:30:00"
}
```

### QuizOption
```json
{
  "id": 1,
  "questionId": 1,
  "optionTextEn": "Kigali",
  "optionTextRw": "Kigali",
  "optionTextFr": "Kigali",
  "isCorrect": true,
  "optionOrder": 1,
  "isActive": true,
  "createdBy": "content_manager",
  "createdDate": "2024-01-15T10:30:00",
  "updatedBy": "content_manager",
  "updatedDate": "2024-01-15T10:30:00"
}
```

### QuizAttempt
```json
{
  "id": 1,
  "quizId": 1,
  "userId": "user123",
  "startTime": "2024-01-15T10:30:00",
  "endTime": "2024-01-15T10:35:00",
  "score": 85,
  "maxScore": 100,
  "passed": true,
  "attemptNumber": 1,
  "timeTaken": 300,
  "isCompleted": true,
  "isActive": true,
  "createdBy": "user123",
  "createdDate": "2024-01-15T10:30:00",
  "updatedBy": "user123",
  "updatedDate": "2024-01-15T10:35:00"
}
```

### QuizResult
```json
{
  "id": 1,
  "attemptId": 1,
  "questionId": 1,
  "selectedOptionId": 1,
  "isCorrect": true,
  "pointsEarned": 10,
  "maxPoints": 10,
  "timeTaken": 30,
  "isActive": true,
  "createdBy": "user123",
  "createdDate": "2024-01-15T10:30:00",
  "updatedBy": "user123",
  "updatedDate": "2024-01-15T10:30:00"
}
```

## Educational Articles API

### 1. List All Public Articles
**GET** `/api/education/articles`

**Description**: Retrieve all public educational articles

**Access**: Public

**Query Parameters**:
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20)
- `sort` (optional): Sort field (default: "createdDate")

**Response**:
```json
{
  "content": [
    {
      "id": 1,
      "titleEn": "Rwanda's Cultural Heritage",
      "titleRw": "Umurage w'Ubwoko bw'Abanyarwanda",
      "titleFr": "Le Patrimoine Culturel du Rwanda",
      "summaryEn": "Brief summary in English",
      "summaryRw": "Inyandiko nto mu Kinyarwanda",
      "summaryFr": "Résumé bref en français",
      "isPublic": true,
      "createdBy": "user123",
      "createdDate": "2024-01-15T10:30:00"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 20,
  "number": 0
}
```

### 2. Get Article by ID
**GET** `/api/education/articles/{id}`

**Description**: Retrieve a specific educational article by ID

**Access**: Public

**Path Parameters**:
- `id`: Article ID

**Response**:
```json
{
  "id": 1,
  "titleEn": "Rwanda's Cultural Heritage",
  "titleRw": "Umurage w'Ubwoko bw'Abanyarwanda",
  "titleFr": "Le Patrimoine Culturel du Rwanda",
  "contentEn": "Article content in English...",
  "contentRw": "Ibiri mu nyandiko mu Kinyarwanda...",
  "contentFr": "Contenu de l'article en français...",
  "summaryEn": "Brief summary in English",
  "summaryRw": "Inyandiko nto mu Kinyarwanda",
  "summaryFr": "Résumé bref en français",
  "isPublic": true,
  "createdBy": "user123",
  "createdDate": "2024-01-15T10:30:00",
  "updatedBy": "user123",
  "updatedDate": "2024-01-15T10:30:00"
}
```

### 3. Create New Article
**POST** `/api/education/articles`

**Description**: Create a new educational article

**Access**: Content Manager+

**Request Body**:
```json
{
  "titleEn": "New Article Title",
  "titleRw": "Umutekano Mushya",
  "titleFr": "Nouveau Titre d'Article",
  "contentEn": "Article content in English...",
  "contentRw": "Ibiri mu nyandiko mu Kinyarwanda...",
  "contentFr": "Contenu de l'article en français...",
  "summaryEn": "Brief summary in English",
  "summaryRw": "Inyandiko nto mu Kinyarwanda",
  "summaryFr": "Résumé bref en français",
  "isPublic": true
}
```

**Response**: `201 Created`
```json
{
  "id": 2,
  "titleEn": "New Article Title",
  "titleRw": "Umutekano Mushya",
  "titleFr": "Nouveau Titre d'Article",
  "contentEn": "Article content in English...",
  "contentRw": "Ibiri mu nyandiko mu Kinyarwanda...",
  "contentFr": "Contenu de l'article en français...",
  "summaryEn": "Brief summary in English",
  "summaryRw": "Inyandiko nto mu Kinyarwanda",
  "summaryFr": "Résumé bref en français",
  "isPublic": true,
  "createdBy": "content_manager",
  "createdDate": "2024-01-15T10:30:00"
}
```

### 4. Update Article
**PUT** `/api/education/articles/{id}`

**Description**: Update an existing educational article

**Access**: Content Manager+

**Path Parameters**:
- `id`: Article ID

**Request Body**: Same as create article

**Response**: `200 OK` with updated article

### 5. Delete Article
**DELETE** `/api/education/articles/{id}`

**Description**: Soft delete an educational article

**Access**: Content Manager+

**Path Parameters**:
- `id`: Article ID

**Response**: `204 No Content`

### 6. Search Articles
**GET** `/api/education/articles/search`

**Description**: Search articles by title

**Access**: Public

**Query Parameters**:
- `title`: Search term for article title
- `page` (optional): Page number
- `size` (optional): Page size

**Response**: Same as list articles with filtered results

### 7. Get Article in Specific Language
**GET** `/api/education/articles/{id}/language/{languageCode}`

**Description**: Get article content in a specific language

**Access**: Public

**Path Parameters**:
- `id`: Article ID
- `languageCode`: Language code (en, rw, fr)

**Response**:
```json
{
  "id": 1,
  "title": "Rwanda's Cultural Heritage",
  "content": "Article content in English...",
  "summary": "Brief summary in English",
  "language": "en",
  "isPublic": true,
  "createdBy": "user123",
  "createdDate": "2024-01-15T10:30:00"
}
```

### 8. List Articles in Specific Language
**GET** `/api/education/articles/language/{languageCode}`

**Description**: List all articles in a specific language

**Access**: Public

**Path Parameters**:
- `languageCode`: Language code (en, rw, fr)

**Response**: Same as list articles with language-specific content

### 9. Get Article for Current User
**GET** `/api/education/articles/{id}/user`

**Description**: Get article optimized for current user's language preference

**Access**: Community Member+

**Path Parameters**:
- `id`: Article ID

**Response**: Same as get article with user's preferred language

### 10. List Articles for Current User
**GET** `/api/education/articles/user`

**Description**: List articles optimized for current user's language preference

**Access**: Community Member+

**Response**: Same as list articles with user's preferred language

## Quizzes API

### 1. List All Public Quizzes
**GET** `/api/education/quizzes`

**Description**: Retrieve all public quizzes

**Access**: Public

**Query Parameters**:
- `page` (optional): Page number
- `size` (optional): Page size
- `sort` (optional): Sort field

**Response**:
```json
{
  "content": [
    {
      "id": 1,
      "titleEn": "Rwanda Heritage Quiz",
      "titleRw": "Ikibazo cy'Umurage w'Abanyarwanda",
      "titleFr": "Quiz sur le Patrimoine du Rwanda",
      "descriptionEn": "Test your knowledge about Rwanda's heritage",
      "descriptionRw": "Gerageza ubumenyi bwawe kuri umurage w'Abanyarwanda",
      "descriptionFr": "Testez vos connaissances sur le patrimoine du Rwanda",
      "articleId": 1,
      "passingScore": 70,
      "timeLimit": 30,
      "maxAttempts": 3,
      "isPublic": true,
      "tags": "heritage,history,culture",
      "createdBy": "content_manager",
      "createdDate": "2024-01-15T10:30:00"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 20,
  "number": 0
}
```

### 2. Get Quiz by ID
**GET** `/api/education/quizzes/{id}`

**Description**: Retrieve a specific quiz by ID

**Access**: Public

**Path Parameters**:
- `id`: Quiz ID

**Response**:
```json
{
  "id": 1,
  "titleEn": "Rwanda Heritage Quiz",
  "titleRw": "Ikibazo cy'Umurage w'Abanyarwanda",
  "titleFr": "Quiz sur le Patrimoine du Rwanda",
  "descriptionEn": "Test your knowledge about Rwanda's heritage",
  "descriptionRw": "Gerageza ubumenyi bwawe kuri umurage w'Abanyarwanda",
  "descriptionFr": "Testez vos connaissances sur le patrimoine du Rwanda",
  "articleId": 1,
  "passingScore": 70,
  "timeLimit": 30,
  "maxAttempts": 3,
  "isPublic": true,
  "tags": "heritage,history,culture",
  "createdBy": "content_manager",
  "createdDate": "2024-01-15T10:30:00",
  "updatedBy": "content_manager",
  "updatedDate": "2024-01-15T10:30:00"
}
```

### 3. Create New Quiz
**POST** `/api/education/quizzes`

**Description**: Create a new quiz

**Access**: Content Manager+

**Request Body**:
```json
{
  "titleEn": "New Quiz Title",
  "titleRw": "Ikibazo Gishya",
  "titleFr": "Nouveau Quiz",
  "descriptionEn": "Quiz description in English",
  "descriptionRw": "Ibisobanura by'ikibazo mu Kinyarwanda",
  "descriptionFr": "Description du quiz en français",
  "articleId": 1,
  "passingScore": 70,
  "timeLimit": 30,
  "maxAttempts": 3,
  "isPublic": true,
  "tags": "heritage,history"
}
```

**Response**: `201 Created` with created quiz

### 4. Update Quiz
**PUT** `/api/education/quizzes/{id}`

**Description**: Update an existing quiz

**Access**: Content Manager+

**Path Parameters**:
- `id`: Quiz ID

**Request Body**: Same as create quiz

**Response**: `200 OK` with updated quiz

### 5. Delete Quiz
**DELETE** `/api/education/quizzes/{id}`

**Description**: Soft delete a quiz

**Access**: Content Manager+

**Path Parameters**:
- `id`: Quiz ID

**Response**: `204 No Content`

### 6. Search Quizzes
**GET** `/api/education/quizzes/search`

**Description**: Search quizzes by title

**Access**: Public

**Query Parameters**:
- `title`: Search term for quiz title
- `page` (optional): Page number
- `size` (optional): Page size

**Response**: Same as list quizzes with filtered results

### 7. Get Quizzes by Article
**GET** `/api/education/quizzes/article/{articleId}`

**Description**: Get all quizzes associated with a specific article

**Access**: Public

**Path Parameters**:
- `articleId`: Article ID

**Response**: List of quizzes for the article

### 8. Get Quizzes by Tag
**GET** `/api/education/quizzes/tags/{tag}`

**Description**: Get quizzes that contain a specific tag

**Access**: Public

**Path Parameters**:
- `tag`: Tag to search for

**Response**: List of quizzes with the specified tag

### 9. Get All Quizzes with Tags
**GET** `/api/education/quizzes/with-tags`

**Description**: Get all quizzes that have tags assigned

**Access**: Public

**Response**: List of quizzes with tags

### 10. Get Quiz in Specific Language
**GET** `/api/education/quizzes/{id}/language/{languageCode}`

**Description**: Get quiz content in a specific language

**Access**: Public

**Path Parameters**:
- `id`: Quiz ID
- `languageCode`: Language code (en, rw, fr)

**Response**:
```json
{
  "id": 1,
  "title": "Rwanda Heritage Quiz",
  "description": "Test your knowledge about Rwanda's heritage",
  "articleId": 1,
  "passingScore": 70,
  "timeLimit": 30,
  "maxAttempts": 3,
  "isPublic": true,
  "tags": "heritage,history,culture",
  "language": "en",
  "createdBy": "content_manager",
  "createdDate": "2024-01-15T10:30:00"
}
```

### 11. List Quizzes in Specific Language
**GET** `/api/education/quizzes/language/{languageCode}`

**Description**: List all quizzes in a specific language

**Access**: Public

**Path Parameters**:
- `languageCode`: Language code (en, rw, fr)

**Response**: Same as list quizzes with language-specific content

### 12. Get Quiz for Current User
**GET** `/api/education/quizzes/{id}/user`

**Description**: Get quiz optimized for current user's language preference

**Access**: Community Member+

**Path Parameters**:
- `id`: Quiz ID

**Response**: Same as get quiz with user's preferred language

### 13. List Quizzes for Current User
**GET** `/api/education/quizzes/user`

**Description**: List quizzes optimized for current user's language preference

**Access**: Community Member+

**Response**: Same as list quizzes with user's preferred language

## Quiz Questions API

### 1. Get Quiz Questions
**GET** `/api/education/quizzes/{quizId}/questions`

**Description**: Get all questions for a specific quiz

**Access**: Public

**Path Parameters**:
- `quizId`: Quiz ID

**Response**:
```json
[
  {
    "id": 1,
    "quizId": 1,
    "questionTextEn": "What is the capital of Rwanda?",
    "questionTextRw": "Umurwa mukuru w'u Rwanda ni nde?",
    "questionTextFr": "Quelle est la capitale du Rwanda?",
    "explanationEn": "Kigali is the capital and largest city of Rwanda",
    "explanationRw": "Kigali ni umurwa mukuru kandi ni umugi munini wa Rwanda",
    "explanationFr": "Kigali est la capitale et la plus grande ville du Rwanda",
    "questionType": "MULTIPLE_CHOICE",
    "points": 10,
    "questionOrder": 1,
    "createdBy": "content_manager",
    "createdDate": "2024-01-15T10:30:00"
  }
]
```

### 2. Add Question to Quiz
**POST** `/api/education/quizzes/{quizId}/questions`

**Description**: Add a new question to a quiz

**Access**: Content Manager+

**Path Parameters**:
- `quizId`: Quiz ID

**Request Body**:
```json
{
  "questionTextEn": "What is the capital of Rwanda?",
  "questionTextRw": "Umurwa mukuru w'u Rwanda ni nde?",
  "questionTextFr": "Quelle est la capitale du Rwanda?",
  "explanationEn": "Kigali is the capital and largest city of Rwanda",
  "explanationRw": "Kigali ni umurwa mukuru kandi ni umugi munini wa Rwanda",
  "explanationFr": "Kigali est la capitale et la plus grande ville du Rwanda",
  "questionType": "MULTIPLE_CHOICE",
  "points": 10,
  "questionOrder": 1
}
```

**Response**: `201 Created` with created question

### 3. Update Question
**PUT** `/api/education/quizzes/questions/{questionId}`

**Description**: Update an existing question

**Access**: Content Manager+

**Path Parameters**:
- `questionId`: Question ID

**Request Body**: Same as create question

**Response**: `200 OK` with updated question

### 4. Delete Question
**DELETE** `/api/education/quizzes/questions/{questionId}`

**Description**: Soft delete a question

**Access**: Content Manager+

**Path Parameters**:
- `questionId`: Question ID

**Response**: `204 No Content`

### 5. Get Question in Specific Language
**GET** `/api/education/quizzes/questions/{id}/language/{languageCode}`

**Description**: Get question content in a specific language

**Access**: Public

**Path Parameters**:
- `id`: Question ID
- `languageCode`: Language code (en, rw, fr)

**Response**:
```json
{
  "id": 1,
  "quizId": 1,
  "questionText": "What is the capital of Rwanda?",
  "explanation": "Kigali is the capital and largest city of Rwanda",
  "questionType": "MULTIPLE_CHOICE",
  "points": 10,
  "questionOrder": 1,
  "language": "en",
  "createdBy": "content_manager",
  "createdDate": "2024-01-15T10:30:00"
}
```

## Quiz Options API

### 1. Get Question Options
**GET** `/api/education/quizzes/questions/{questionId}/options`

**Description**: Get all options for a specific question

**Access**: Public

**Path Parameters**:
- `questionId`: Question ID

**Response**:
```json
[
  {
    "id": 1,
    "questionId": 1,
    "optionTextEn": "Kigali",
    "optionTextRw": "Kigali",
    "optionTextFr": "Kigali",
    "isCorrect": true,
    "optionOrder": 1,
    "createdBy": "content_manager",
    "createdDate": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    "questionId": 1,
    "optionTextEn": "Butare",
    "optionTextRw": "Butare",
    "optionTextFr": "Butare",
    "isCorrect": false,
    "optionOrder": 2,
    "createdBy": "content_manager",
    "createdDate": "2024-01-15T10:30:00"
  }
]
```

### 2. Add Option to Question
**POST** `/api/education/quizzes/questions/{questionId}/options`

**Description**: Add a new option to a question

**Access**: Content Manager+

**Path Parameters**:
- `questionId`: Question ID

**Request Body**:
```json
{
  "optionTextEn": "Kigali",
  "optionTextRw": "Kigali",
  "optionTextFr": "Kigali",
  "isCorrect": true,
  "optionOrder": 1
}
```

**Response**: `201 Created` with created option

### 3. Update Option
**PUT** `/api/education/quizzes/options/{optionId}`

**Description**: Update an existing option

**Access**: Content Manager+

**Path Parameters**:
- `optionId`: Option ID

**Request Body**: Same as create option

**Response**: `200 OK` with updated option

### 4. Delete Option
**DELETE** `/api/education/quizzes/options/{optionId}`

**Description**: Soft delete an option

**Access**: Content Manager+

**Path Parameters**:
- `optionId`: Option ID

**Response**: `204 No Content`

### 5. Get Option in Specific Language
**GET** `/api/education/quizzes/options/{id}/language/{languageCode}`

**Description**: Get option content in a specific language

**Access**: Public

**Path Parameters**:
- `id`: Option ID
- `languageCode`: Language code (en, rw, fr)

**Response**:
```json
{
  "id": 1,
  "questionId": 1,
  "optionText": "Kigali",
  "isCorrect": true,
  "optionOrder": 1,
  "language": "en",
  "createdBy": "content_manager",
  "createdDate": "2024-01-15T10:30:00"
}
```

## Quiz Attempts API

### 1. Start Quiz Attempt
**POST** `/api/education/quizzes/{quizId}/attempt`

**Description**: Start a new quiz attempt

**Access**: Community Member+

**Path Parameters**:
- `quizId`: Quiz ID

**Response**: `201 Created`
```json
{
  "id": 1,
  "quizId": 1,
  "userId": "user123",
  "startTime": "2024-01-15T10:30:00",
  "endTime": null,
  "score": 0,
  "maxScore": 0,
  "passed": false,
  "attemptNumber": 1,
  "timeTaken": 0,
  "isCompleted": false,
  "createdBy": "user123",
  "createdDate": "2024-01-15T10:30:00"
}
```

### 2. Submit Quiz Attempt
**PUT** `/api/education/quizzes/attempts/{attemptId}/submit`

**Description**: Submit a completed quiz attempt with answers

**Access**: Community Member+

**Path Parameters**:
- `attemptId`: Attempt ID

**Request Body**:
```json
{
  "answers": [
    {
      "questionId": 1,
      "selectedOptionId": 1
    },
    {
      "questionId": 2,
      "selectedOptionId": 3
    }
  ]
}
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "quizId": 1,
  "userId": "user123",
  "startTime": "2024-01-15T10:30:00",
  "endTime": "2024-01-15T10:35:00",
  "score": 85,
  "maxScore": 100,
  "passed": true,
  "attemptNumber": 1,
  "timeTaken": 300,
  "isCompleted": true,
  "results": [
    {
      "questionId": 1,
      "selectedOptionId": 1,
      "isCorrect": true,
      "pointsEarned": 10,
      "maxPoints": 10
    },
    {
      "questionId": 2,
      "selectedOptionId": 3,
      "isCorrect": false,
      "pointsEarned": 0,
      "maxPoints": 10
    }
  ]
}
```

### 3. Get User's Quiz Attempts
**GET** `/api/education/quizzes/{quizId}/attempts`

**Description**: Get all attempts for a specific quiz by the current user

**Access**: Community Member+

**Path Parameters**:
- `quizId`: Quiz ID

**Response**:
```json
[
  {
    "id": 1,
    "quizId": 1,
    "userId": "user123",
    "startTime": "2024-01-15T10:30:00",
    "endTime": "2024-01-15T10:35:00",
    "score": 85,
    "maxScore": 100,
    "passed": true,
    "attemptNumber": 1,
    "timeTaken": 300,
    "isCompleted": true,
    "createdBy": "user123",
    "createdDate": "2024-01-15T10:30:00"
  }
]
```

### 4. Get Attempt Details
**GET** `/api/education/quizzes/attempts/{attemptId}`

**Description**: Get detailed information about a specific attempt

**Access**: Community Member+

**Path Parameters**:
- `attemptId`: Attempt ID

**Response**: Same as submit attempt response

### 5. Get Attempt Results
**GET** `/api/education/quizzes/attempts/{attemptId}/results`

**Description**: Get detailed results for a specific attempt

**Access**: Community Member+

**Path Parameters**:
- `attemptId`: Attempt ID

**Response**:
```json
[
  {
    "id": 1,
    "attemptId": 1,
    "questionId": 1,
    "selectedOptionId": 1,
    "isCorrect": true,
    "pointsEarned": 10,
    "maxPoints": 10,
    "timeTaken": 30,
    "createdBy": "user123",
    "createdDate": "2024-01-15T10:30:00"
  }
]
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    {
      "field": "titleEn",
      "message": "Title in English is required"
    }
  ]
}
```

#### 401 Unauthorized
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

#### 403 Forbidden
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied. Required role: CONTENT_MANAGER"
}
```

#### 404 Not Found
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Educational article not found with id: 999"
}
```

#### 409 Conflict
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 409,
  "error": "Conflict",
  "message": "Maximum attempts reached for this quiz"
}
```

#### 500 Internal Server Error
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Response Formats

### Success Responses
- **200 OK**: Successful GET, PUT operations
- **201 Created**: Successful POST operations
- **204 No Content**: Successful DELETE operations

### Error Responses
- **400 Bad Request**: Validation errors, invalid input
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Business rule violations
- **500 Internal Server Error**: Server-side errors

### Pagination
For endpoints that return lists, pagination is supported:
```json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 5,
  "size": 20,
  "number": 0,
  "first": true,
  "last": false
}
```

### Validation
All input data is validated using Jakarta validation annotations:
- `@NotBlank`: Required string fields
- `@Size`: String length constraints
- `@Min/@Max`: Numeric value constraints
- `@Pattern`: Regular expression validation
- `@NotNull`: Required object fields
- `@PastOrPresent`: Date validation 