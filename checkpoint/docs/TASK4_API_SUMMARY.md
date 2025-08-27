# Task 4: Community Engagement Platform - API Summary

## Overview
This document provides a concise summary of all API endpoints for the Community Engagement Platform, including forum management, translation services, and user language preferences.

## Base URL
```
http://localhost:8080/api
```

## Authentication
All endpoints require JWT authentication unless specified as public.

## 1. Forum Categories

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/forum/categories` | Public | Get all categories with pagination |
| GET | `/forum/categories/{id}` | Public | Get category by ID |
| POST | `/forum/categories` | CM, HM, SA | Create new category |
| PUT | `/forum/categories/{id}` | CM, HM, SA | Update category |
| DELETE | `/forum/categories/{id}` | CM, HM, SA | Delete category |
| GET | `/forum/categories/public` | Public | Get public categories only |

## 2. Forum Topics

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/forum/topics` | Public | Get all topics with filtering |
| GET | `/forum/topics/{id}` | Public | Get topic by ID |
| POST | `/forum/topics` | CM+, CM, HM, SA | Create new topic |
| PUT | `/forum/topics/{id}` | Creator, CM, HM, SA | Update topic |
| DELETE | `/forum/topics/{id}` | Creator, CM, HM, SA | Delete topic |
| GET | `/forum/topics/language/{language}` | Public | Get topics by language |
| GET | `/forum/topics/preferred-language` | Auth | Get topics in user's preferred language |

## 3. Forum Posts

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/forum/topics/{topicId}/posts` | Public | Get posts by topic |
| GET | `/forum/posts/{id}` | Public | Get post by ID |
| POST | `/forum/posts` | CM+, CM, HM, SA | Create new post |
| PUT | `/forum/posts/{id}` | Creator, CM, HM, SA | Update post |
| DELETE | `/forum/posts/{id}` | Creator, CM, HM, SA | Delete post |

## 4. Translation Management

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/forum/translations` | CM, HM, SA | Create translation |
| PUT | `/forum/translations/{id}` | CM, HM, SA | Update translation |
| DELETE | `/forum/translations/{id}` | CM, HM, SA | Delete translation |
| GET | `/forum/translations/{id}` | CM, HM, SA, CM+ | Get translation by ID |
| GET | `/forum/translations/content/{type}/{id}/{field}` | CM, HM, SA, CM+ | Get translations for content |
| GET | `/forum/translations/content/{type}/{id}/{field}/languages` | CM, HM, SA, CM+ | Get available languages |
| GET | `/forum/translations/statistics` | CM, HM, SA | Get translation statistics |
| GET | `/forum/translations/user/{username}` | CM, HM, SA | Get user's translations |
| GET | `/forum/translations/topics/{topicId}` | CM, HM, SA, CM+ | Get topic translations |
| GET | `/forum/translations/posts/{postId}` | CM, HM, SA, CM+ | Get post translations |
| GET | `/forum/translations/categories/{categoryId}` | CM, HM, SA, CM+ | Get category translations |

## 5. User Language Preferences

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/forum/user-language/{username}/preferred` | CM, HM, SA | Get user's preferred language |
| PUT | `/forum/user-language/{username}/preferred` | CM, HM, SA | Set user's preferred language |
| GET | `/forum/user-language/{username}/additional` | CM, HM, SA | Get user's additional languages |
| POST | `/forum/user-language/{username}/additional` | CM, HM, SA | Add additional language |
| DELETE | `/forum/user-language/{username}/additional/{lang}` | CM, HM, SA | Remove additional language |
| GET | `/forum/user-language/{username}/all` | CM, HM, SA | Get all user languages |
| GET | `/forum/user-language/{username}/can-understand/{lang}` | CM, HM, SA | Check language understanding |
| POST | `/forum/user-language/{username}/best-available` | CM, HM, SA | Get best available language |

## Access Levels
- **Public**: No authentication required
- **Auth**: Authenticated users only
- **CM+**: COMMUNITY_MEMBER and above
- **CM**: CONTENT_MANAGER and above
- **HM**: HERITAGE_MANAGER and above
- **SA**: SYSTEM_ADMINISTRATOR only
- **Creator**: Content creator or higher roles

## Key Features

### Multilingual Support
- Dynamic translation management for forum content
- User language preferences (preferred + additional languages)
- Language-specific content filtering
- Translation approval workflow

### Forum Management
- Hierarchical structure: Categories → Topics → Posts
- Public/private content control
- Soft delete functionality
- Audit trail (created/updated by/date)

### Content Moderation
- Role-based access control
- Content creator permissions
- Translation review process
- Statistics and reporting

### User Experience
- Language preference management
- Best language matching
- Content filtering by language
- Translation availability checking

## Response Formats

### Success Response
```json
{
  "id": 1,
  "title": "Example",
  "content": "Content here",
  "isActive": true,
  "createdBy": "user",
  "createdDate": "2024-01-15T10:00:00"
}
```

### Error Response
```json
{
  "timestamp": "2024-01-15T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed"
}
```

## Language Codes
- `en`: English
- `rw`: Kinyarwanda
- `fr`: French

## Content Types
- `FORUM_TOPIC`: Forum topics
- `FORUM_POST`: Forum posts
- `FORUM_CATEGORY`: Forum categories

## Translation Status
- `PENDING_REVIEW`: Awaiting approval
- `APPROVED`: Translation approved
- `REJECTED`: Translation rejected

This summary provides a quick reference for all Task 4 API endpoints and their purposes. 