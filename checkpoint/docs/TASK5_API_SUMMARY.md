# Task 5: Multilingual Interpretation - API Summary

## Overview
Complete multilingual system with language management, translation services, translation memory, and enhanced workflow management.

## Base URL: `http://localhost:8080/api`

---

## Language Management

### GET `/languages` - Get Active Languages
**Access:** Public  
**Response:** List of active languages

### GET `/languages/all` - Get All Languages
**Access:** CONTENT_MANAGER+  
**Response:** List of all languages (including inactive)

### GET `/languages/{id}` - Get Language by ID
**Access:** Public  
**Response:** Single language details

### GET `/languages/code/{code}` - Get Language by Code
**Access:** Public  
**Response:** Single language details

### GET `/languages/default` - Get Default Language
**Access:** Public  
**Response:** Default language details

### POST `/languages` - Create Language
**Access:** HERITAGE_MANAGER+  
**Body:** `code`, `name`, `isDefault`, `isActive`

### PUT `/languages/{id}` - Update Language
**Access:** HERITAGE_MANAGER+  
**Body:** `code`, `name`, `isDefault`, `isActive`

### DELETE `/languages/{id}` - Delete Language
**Access:** SYSTEM_ADMINISTRATOR  
**Response:** 204 No Content

### PATCH `/languages/{code}/set-default` - Set Default Language
**Access:** HERITAGE_MANAGER+  
**Response:** Updated language details

### PATCH `/languages/{id}/toggle-status` - Toggle Language Status
**Access:** HERITAGE_MANAGER+  
**Response:** Updated language details

### POST `/languages/initialize` - Initialize Default Languages
**Access:** SYSTEM_ADMINISTRATOR  
**Response:** 200 OK

### GET `/languages/statistics` - Get Language Statistics
**Access:** CONTENT_MANAGER+  
**Response:** Language statistics and analytics

---

## Translation Management

### GET `/translations/text` - Get Translated Text
**Access:** Public  
**Query:** `contentType`, `contentId`, `fieldName`, `languageCode`  
**Response:** Translated text string

### POST `/translations` - Create Translation
**Access:** CONTENT_MANAGER+  
**Body:** `contentType`, `contentId`, `fieldName`, `languageCode`, `translatedText`, `status`

### GET `/translations/content` - Get Content Translations
**Access:** Public  
**Query:** `contentType`, `contentId`  
**Response:** List of translations for content

### GET `/translations/by-type-language` - Get Translations by Type & Language
**Access:** Public  
**Query:** `contentType`, `languageCode`  
**Response:** List of translations

### GET `/translations/search` - Search Translations
**Access:** Public  
**Query:** `contentType`, `contentId`, `languageCode`, `fieldName`, `status`  
**Response:** Filtered list of translations

### DELETE `/translations/{id}` - Delete Translation
**Access:** CONTENT_MANAGER+  
**Response:** 204 No Content

### POST `/translations/batch` - Batch Save Translations
**Access:** CONTENT_MANAGER+  
**Body:** Array of translation objects  
**Response:** List of saved translations

### GET `/translations/exists` - Check Translation Exists
**Access:** Public  
**Query:** `contentType`, `contentId`, `fieldName`, `languageCode`  
**Response:** Boolean

### PATCH `/translations/{id}/status` - Update Translation Status
**Access:** CONTENT_MANAGER+  
**Query:** `status` (DRAFT|REVIEW|APPROVED|PUBLISHED|REJECTED)  
**Response:** Updated translation

### GET `/translations/by-status/{status}` - Get Translations by Status
**Access:** CONTENT_MANAGER+  
**Response:** List of translations with specified status

---

## Translation Memory

### POST `/translation-memory` - Add to Memory
**Access:** CONTENT_MANAGER+  
**Body:** `sourceText`, `targetText`, `sourceLanguage`, `targetLanguage`, `context`

### GET `/translation-memory/suggestions` - Find Suggestions
**Access:** Public  
**Query:** `sourceText`, `sourceLanguage`, `targetLanguage`  
**Response:** List of translation suggestions

### GET `/translation-memory/exact-match` - Find Exact Match
**Access:** Public  
**Query:** `sourceText`, `sourceLanguage`, `targetLanguage`  
**Response:** Exact translation match

### GET `/translation-memory` - Get All Memory Entries
**Access:** CONTENT_MANAGER+  
**Response:** List of all translation memory entries

### GET `/translation-memory/by-language-pair` - Get by Language Pair
**Access:** Public  
**Query:** `sourceLanguage`, `targetLanguage`  
**Response:** List of memory entries

### GET `/translation-memory/search` - Search Memory
**Access:** Public  
**Query:** `searchTerm`, `sourceLanguage`, `targetLanguage`  
**Response:** Filtered memory entries

### GET `/translation-memory/most-used` - Get Most Used
**Access:** Public  
**Query:** `sourceLanguage`, `targetLanguage`, `limit`  
**Response:** Most frequently used translations

### PATCH `/translation-memory/{id}/increment-usage` - Increment Usage
**Access:** CONTENT_MANAGER+  
**Response:** Updated memory entry

### DELETE `/translation-memory/{id}` - Delete Memory Entry
**Access:** HERITAGE_MANAGER+  
**Response:** 204 No Content

### POST `/translation-memory/cleanup` - Cleanup Old Entries
**Access:** SYSTEM_ADMINISTRATOR  
**Query:** `minUsageCount`  
**Response:** 200 OK

### GET `/translation-memory/statistics` - Get Memory Statistics
**Access:** CONTENT_MANAGER+  
**Response:** Translation memory statistics

---

## Data Models

### Language
```json
{
  "id": 1,
  "code": "en",
  "name": "English",
  "isDefault": true,
  "isActive": true,
  "createdBy": "admin",
  "createdDate": "2024-01-15T10:30:00",
  "updatedBy": "admin",
  "updatedDate": "2024-01-15T10:30:00"
}
```

### Translation
```json
{
  "id": 1,
  "contentType": "HERITAGE_SITE",
  "contentId": 1,
  "fieldName": "title",
  "languageCode": "rw",
  "translatedText": "Ibikorwa by'ubwoko",
  "status": "PUBLISHED",
  "createdBy": "content_manager",
  "createdDate": "2024-01-15T11:00:00",
  "updatedBy": "content_manager",
  "updatedDate": "2024-01-15T11:30:00"
}
```

### TranslationMemory
```json
{
  "id": 1,
  "sourceText": "Heritage Site",
  "targetText": "Ibikorwa by'ubwoko",
  "sourceLanguage": "en",
  "targetLanguage": "rw",
  "context": "heritage",
  "usageCount": 5,
  "createdBy": "content_manager",
  "createdDate": "2024-01-15T11:00:00",
  "updatedDate": "2024-01-15T11:30:00"
}
```

---

## Enums

### ContentType
- `HERITAGE_SITE`
- `FORUM_TOPIC`
- `FORUM_POST`
- `FORUM_CATEGORY`
- `DOCUMENT`
- `UI_ELEMENT`
- `EDUCATIONAL_CONTENT`
- `EDUCATIONAL_ARTICLE`
- `QUIZ`
- `QUIZ_QUESTION`
- `QUIZ_OPTION`

### TranslationStatus
- `DRAFT` - Initial draft state
- `REVIEW` - Under review
- `APPROVED` - Approved and ready for publishing
- `PUBLISHED` - Published and visible
- `REJECTED` - Rejected and needs revision

---

## Security Roles

- `SYSTEM_ADMINISTRATOR`: Full access to all features
- `HERITAGE_MANAGER`: Language management + translation management
- `CONTENT_MANAGER`: Translation management + translation memory
- `COMMUNITY_MEMBER`: View translations and use translation memory
- `PUBLIC`: Read-only access to languages and translations

---

## Key Features

1. **Language Management**: CRUD operations for supported languages
2. **Translation Services**: Content translation with workflow management
3. **Translation Memory**: Intelligent translation suggestions and memory
4. **Workflow Management**: 5-level status workflow (DRAFT → REVIEW → APPROVED → PUBLISHED → REJECTED)
5. **Performance Optimization**: Caching for frequently accessed data
6. **Statistics & Analytics**: Comprehensive language and translation statistics
7. **Batch Operations**: Efficient bulk translation management
8. **Search & Filtering**: Advanced search capabilities across all entities

---

This summary covers all 30+ endpoints for the Multilingual Interpretation system with comprehensive language management, translation services, and translation memory features. 