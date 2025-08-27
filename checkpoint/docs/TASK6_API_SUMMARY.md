# Task 6: Education & Awareness Module - API Summary

## Overview
The Education & Awareness Module provides educational content management and interactive quiz functionality with multilingual support. Content Managers can create educational articles and quizzes, while Community Members can view content and take quizzes with automatic evaluation.

## Authentication & Authorization
- **Public Access**: Read-only access to public educational articles and quizzes
- **Content Manager+**: Full CRUD operations on educational content
- **Community Member+**: Quiz attempts and personal results access

## Core Endpoints

### Educational Articles
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/education/articles` | Public | List all public articles |
| GET | `/api/education/articles/{id}` | Public | Get article by ID |
| POST | `/api/education/articles` | Content Manager+ | Create new article |
| PUT | `/api/education/articles/{id}` | Content Manager+ | Update article |
| DELETE | `/api/education/articles/{id}` | Content Manager+ | Delete article |
| GET | `/api/education/articles/search` | Public | Search articles by title |
| GET | `/api/education/articles/language/{languageCode}` | Public | List articles in specific language |
| GET | `/api/education/articles/{id}/language/{languageCode}` | Public | Get article in specific language |
| GET | `/api/education/articles/user` | Community Member+ | List articles for current user |
| GET | `/api/education/articles/{id}/user` | Community Member+ | Get article for current user |

### Quizzes
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/education/quizzes` | Public | List all public quizzes |
| GET | `/api/education/quizzes/{id}` | Public | Get quiz by ID |
| POST | `/api/education/quizzes` | Content Manager+ | Create new quiz |
| PUT | `/api/education/quizzes/{id}` | Content Manager+ | Update quiz |
| DELETE | `/api/education/quizzes/{id}` | Content Manager+ | Delete quiz |
| GET | `/api/education/quizzes/search` | Public | Search quizzes by title |
| GET | `/api/education/quizzes/article/{articleId}` | Public | Get quizzes by article |
| GET | `/api/education/quizzes/tags/{tag}` | Public | Get quizzes by tag |
| GET | `/api/education/quizzes/with-tags` | Public | Get all quizzes with tags |
| GET | `/api/education/quizzes/language/{languageCode}` | Public | List quizzes in specific language |
| GET | `/api/education/quizzes/{id}/language/{languageCode}` | Public | Get quiz in specific language |
| GET | `/api/education/quizzes/user` | Community Member+ | List quizzes for current user |
| GET | `/api/education/quizzes/{id}/user` | Community Member+ | Get quiz for current user |

### Quiz Questions
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/education/quizzes/{quizId}/questions` | Public | Get quiz questions |
| POST | `/api/education/quizzes/{quizId}/questions` | Content Manager+ | Add question to quiz |
| PUT | `/api/education/quizzes/questions/{questionId}` | Content Manager+ | Update question |
| DELETE | `/api/education/quizzes/questions/{questionId}` | Content Manager+ | Delete question |
| GET | `/api/education/quizzes/questions/{id}/language/{languageCode}` | Public | Get question in specific language |

### Quiz Options
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/education/quizzes/questions/{questionId}/options` | Public | Get question options |
| POST | `/api/education/quizzes/questions/{questionId}/options` | Content Manager+ | Add option to question |
| PUT | `/api/education/quizzes/options/{optionId}` | Content Manager+ | Update option |
| DELETE | `/api/education/quizzes/options/{optionId}` | Content Manager+ | Delete option |
| GET | `/api/education/quizzes/options/{id}/language/{languageCode}` | Public | Get option in specific language |

### Quiz Attempts
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/education/quizzes/{quizId}/attempt` | Community Member+ | Start quiz attempt |
| PUT | `/api/education/quizzes/attempts/{attemptId}/submit` | Community Member+ | Submit quiz attempt |
| GET | `/api/education/quizzes/{quizId}/attempts` | Community Member+ | Get user's quiz attempts |
| GET | `/api/education/quizzes/attempts/{attemptId}` | Community Member+ | Get attempt details |
| GET | `/api/education/quizzes/attempts/{attemptId}/results` | Community Member+ | Get attempt results |

## Key Features
- **Multilingual Support**: Content available in English, Kinyarwanda, French
- **Quiz Categories/Tags**: Organize quizzes with tags
- **Automatic Evaluation**: Score calculation and pass/fail determination
- **User Progress Tracking**: Track attempts, scores, and completion status
- **Public Access**: Read-only access to educational content
- **Role-based Access**: Different permissions for different user roles

## Response Formats
- **Success**: JSON with data and appropriate HTTP status codes
- **Error**: JSON with error message and HTTP error status codes
- **Validation**: Detailed validation error messages for invalid input

## Data Models
- **EducationalArticle**: Articles with multilingual content
- **Quiz**: Quizzes linked to articles with settings
- **QuizQuestion**: Questions with multiple choice options
- **QuizOption**: Multiple choice options for questions
- **QuizAttempt**: User quiz attempts with tracking
- **QuizResult**: Detailed per-question results 