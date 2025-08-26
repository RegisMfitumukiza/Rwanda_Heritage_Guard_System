# Task 4: Community Engagement Platform - API Documentation

## Overview
Complete forum system with multilingual support, content moderation, and user interaction features.

## Base URL: `http://localhost:8080/api`

---

## Forum Categories

### GET `/forum/categories` - Get All Categories
**Access:** Public  
**Query:** `page`, `size`, `sort`  
**Response:** Paginated list of categories

### GET `/forum/categories/{categoryId}` - Get Category by ID
**Access:** Public  
**Response:** Single category details

### POST `/forum/categories` - Create Category
**Access:** CONTENT_MANAGER+  
**Body:** `name`, `description`, `isPublic`

### PUT `/forum/categories/{categoryId}` - Update Category
**Access:** CONTENT_MANAGER+  
**Body:** `name`, `description`, `isPublic`

### DELETE `/forum/categories/{categoryId}` - Delete Category
**Access:** CONTENT_MANAGER+

### GET `/forum/categories/public` - Get Public Categories
**Access:** Public  
**Response:** List of public categories only

---

## Forum Topics

### GET `/forum/topics` - Get All Topics
**Access:** Public  
**Query:** `page`, `size`, `sort`, `categoryId`, `isPublic`, `language`

### GET `/forum/topics/{topicId}` - Get Topic by ID
**Access:** Public

### POST `/forum/topics` - Create Topic
**Access:** COMMUNITY_MEMBER+  
**Body:** `title`, `content`, `categoryId`, `isPublic`, `language`

### PUT `/forum/topics/{topicId}` - Update Topic
**Access:** Creator or CONTENT_MANAGER+  
**Body:** `title`, `content`, `categoryId`, `isPublic`, `language`

### DELETE `/forum/topics/{topicId}` - Delete Topic
**Access:** Creator or CONTENT_MANAGER+

### GET `/forum/topics/language/{language}` - Get Topics by Language
**Access:** Public  
**Query:** `categoryId`, `isPublic`

### GET `/forum/topics/preferred-language` - Get Topics in User's Language
**Access:** Authenticated users  
**Query:** `categoryId`, `isPublic`

---

## Forum Posts

### GET `/forum/topics/{topicId}/posts` - Get Posts by Topic
**Access:** Public  
**Query:** `page`, `size`, `sort`

### GET `/forum/posts/{postId}` - Get Post by ID
**Access:** Public

### POST `/forum/topics/{topicId}/posts` - Create Post
**Access:** COMMUNITY_MEMBER+  
**Body:** `content`, `language`

### PUT `/forum/posts/{postId}` - Update Post
**Access:** Creator or CONTENT_MANAGER+  
**Body:** `content`, `language`

### DELETE `/forum/posts/{postId}` - Delete Post
**Access:** Creator or CONTENT_MANAGER+

---

## Content Moderation

### POST `/forum/reports` - Report Content
**Access:** COMMUNITY_MEMBER+  
**Body:** `contentType`, `contentId`, `reason`, `description`

### GET `/forum/reports` - Get Reports
**Access:** CONTENT_MANAGER+  
**Query:** `page`, `size`, `status`, `contentType`

### PUT `/forum/reports/{reportId}/status` - Update Report Status
**Access:** CONTENT_MANAGER+  
**Body:** `status`, `moderatorNotes`

### POST `/forum/moderate/bulk` - Bulk Moderate Content
**Access:** CONTENT_MANAGER+  
**Body:** `action`, `contentIds`, `contentType`, `reason`

---

## Translation Management

### POST `/forum/translations` - Create Translation
**Access:** CONTENT_MANAGER+  
**Body:** `contentType`, `contentId`, `fieldName`, `languageCode`, `translatedText`

### PUT `/forum/translations/{translationId}` - Update Translation
**Access:** CONTENT_MANAGER+  
**Body:** `translatedText`

### DELETE `/forum/translations/{translationId}` - Delete Translation
**Access:** CONTENT_MANAGER+

### GET `/forum/translations/{translationId}` - Get Translation by ID
**Access:** CONTENT_MANAGER+, COMMUNITY_MEMBER

### GET `/forum/translations/content/{contentType}/{contentId}/{fieldName}` - Get Content Translations
**Access:** CONTENT_MANAGER+, COMMUNITY_MEMBER

### GET `/forum/translations/content/{contentType}/{contentId}/{fieldName}/languages` - Get Available Languages
**Access:** CONTENT_MANAGER+, COMMUNITY_MEMBER

### GET `/forum/translations/statistics` - Get Translation Statistics
**Access:** CONTENT_MANAGER+

### GET `/forum/translations/user/{username}` - Get User Translations
**Access:** CONTENT_MANAGER+

### GET `/forum/translations/topics/{topicId}` - Get Topic Translations
**Access:** CONTENT_MANAGER+, COMMUNITY_MEMBER

### GET `/forum/translations/posts/{postId}` - Get Post Translations
**Access:** CONTENT_MANAGER+, COMMUNITY_MEMBER

### GET `/forum/translations/categories/{categoryId}` - Get Category Translations
**Access:** CONTENT_MANAGER+, COMMUNITY_MEMBER

---

## User Language Preferences

### GET `/forum/user-language/preferred` - Get Preferred Language
**Access:** Authenticated users

### PUT `/forum/user-language/preferred` - Set Preferred Language
**Access:** Authenticated users  
**Body:** `languageCode`

### GET `/forum/user-language/additional` - Get Additional Languages
**Access:** Authenticated users

### POST `/forum/user-language/additional` - Add Additional Language
**Access:** Authenticated users  
**Body:** `languageCode`

### DELETE `/forum/user-language/additional/{languageCode}` - Remove Additional Language
**Access:** Authenticated users

### GET `/forum/user-language/all` - Get All User Languages
**Access:** Authenticated users

### GET `/forum/user-language/understand/{languageCode}` - Check Language Understanding
**Access:** Authenticated users

### POST `/forum/user-language/best-available` - Get Best Available Language
**Access:** Authenticated users  
**Body:** `availableLanguages`

---

## Data Models

### ForumCategory
```json
{
  "id": 1,
  "name": "Heritage Sites",
  "description": "Discussion about heritage sites",
  "isPublic": true,
  "isActive": true,
  "createdBy": "admin",
  "createdDate": "2024-01-15T10:30:00",
  "updatedBy": "admin",
  "updatedDate": "2024-01-15T10:30:00"
}
```

### ForumTopic
```json
{
  "id": 1,
  "title": "Heritage Site Preservation",
  "content": "Discussion about preserving heritage sites",
  "categoryId": 1,
  "categoryName": "Heritage Sites",
  "isPublic": true,
  "isActive": true,
  "language": "en",
  "createdBy": "community_member",
  "createdDate": "2024-01-15T10:30:00",
  "updatedBy": "community_member",
  "updatedDate": "2024-01-15T10:30:00"
}
```

### ForumPost
```json
{
  "id": 1,
  "content": "Great discussion topic!",
  "topicId": 1,
  "isActive": true,
  "language": "en",
  "createdBy": "community_member",
  "createdDate": "2024-01-15T10:30:00",
  "updatedBy": "community_member",
  "updatedDate": "2024-01-15T10:30:00"
}
```

### Translation
```json
{
  "id": 1,
  "contentType": "FORUM_TOPIC",
  "contentId": 1,
  "fieldName": "title",
  "languageCode": "rw",
  "translatedText": "Kurwanya ibikorwa by'ubwoko",
  "status": "APPROVED",
  "createdBy": "content_manager",
  "createdDate": "2024-01-15T11:00:00",
  "updatedBy": "content_manager",
  "updatedDate": "2024-01-15T11:30:00"
}
```

---

## Enums

### ContentType
- `FORUM_TOPIC`
- `FORUM_POST`
- `FORUM_CATEGORY`

### TranslationStatus
- `PENDING`
- `APPROVED`
- `REJECTED`

### ReportStatus
- `PENDING`
- `REVIEWED`
- `RESOLVED`

---

## Security Roles

- `SYSTEM_ADMINISTRATOR`: Full access
- `HERITAGE_MANAGER`: Full content management
- `CONTENT_MANAGER`: Content management + moderation
- `COMMUNITY_MEMBER`: Create content + report + language preferences
- `PUBLIC`: Read-only public content

---

## Error Responses

### 400 Bad Request
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed"
}
```

### 401 Unauthorized
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Resource not found"
}
```

---

## Key Features

1. **Multilingual Support**: Content in English, Kinyarwanda, French
2. **Content Moderation**: Reporting, review, bulk actions
3. **User Language Preferences**: Preferred and additional languages
4. **Translation Management**: CRUD operations for content translations
5. **Role-based Access**: Different permissions for different user roles
6. **Audit Trail**: Track creation and updates
7. **Soft Deletes**: Maintain data integrity
8. **Pagination**: Handle large datasets efficiently

---

This documentation covers all 50+ endpoints for the Community Engagement Platform with comprehensive multilingual support and content moderation features. 