# Task 2: Digital Documentation System - API Documentation

## Overview
The Digital Documentation System provides comprehensive document and folder management capabilities with version control, hierarchical organization, and role-based access control.

## Authentication
All endpoints require JWT authentication except those marked as "Public". Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Document Endpoints

### 1. Create Document
**POST** `/api/documents`

**Access:** ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER

**Description:** Create a new document with metadata and optional folder assignment.

**Request Body:**
```json
{
  "title": {
    "en": "Document Title",
    "rw": "Icyandikwa Ry'Inyandiko",
    "fr": "Titre du Document"
  },
  "description": {
    "en": "Document description",
    "rw": "Ibisobanura by'inyandiko",
    "fr": "Description du document"
  },
  "author": "John Doe",
  "type": "PDF",
  "language": "en",
  "tags": ["heritage", "history"],
  "folderId": 1,
  "isPublic": false
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "title": {
    "en": "Document Title",
    "rw": "Icyandikwa Ry'Inyandiko",
    "fr": "Titre du Document"
  },
  "description": {
    "en": "Document description",
    "rw": "Ibisobanura by'inyandiko",
    "fr": "Description du document"
  },
  "author": "John Doe",
  "creationDate": "2024-01-15T10:30:00",
  "type": "PDF",
  "language": "en",
  "tags": ["heritage", "history"],
  "folderId": 1,
  "isPublic": false,
  "isActive": true,
  "createdBy": "john.doe",
  "createdDate": "2024-01-15T10:30:00",
  "updatedBy": "john.doe",
  "updatedDate": "2024-01-15T10:30:00"
}
```

### 2. Get Document
**GET** `/api/documents/{id}`

**Access:** Authenticated

**Description:** Retrieve a specific document by ID.

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": {
    "en": "Document Title",
    "rw": "Icyandikwa Ry'Inyandiko",
    "fr": "Titre du Document"
  },
  "description": {
    "en": "Document description",
    "rw": "Ibisobanura by'inyandiko",
    "fr": "Description du document"
  },
  "author": "John Doe",
  "creationDate": "2024-01-15T10:30:00",
  "type": "PDF",
  "language": "en",
  "tags": ["heritage", "history"],
  "folderId": 1,
  "isPublic": false,
  "versionIds": [1, 2, 3],
  "isActive": true,
  "createdBy": "john.doe",
  "createdDate": "2024-01-15T10:30:00",
  "updatedBy": "john.doe",
  "updatedDate": "2024-01-15T10:30:00"
}
```

### 3. List Documents
**GET** `/api/documents`

**Access:** Authenticated

**Description:** Retrieve all documents accessible to the user.

**Query Parameters:**
- `page` (optional): Page number for pagination
- `size` (optional): Page size for pagination

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": {
      "en": "Document Title",
      "rw": "Icyandikwa Ry'Inyandiko",
      "fr": "Titre du Document"
    },
    "author": "John Doe",
    "type": "PDF",
    "language": "en",
    "isPublic": false,
    "folderId": 1
  }
]
```

### 4. Search Documents
**GET** `/api/documents/search?q={searchTerm}`

**Access:** Authenticated

**Description:** Search documents by title or description content.

**Query Parameters:**
- `q` (required): Search term

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": {
      "en": "Heritage Site Documentation",
      "rw": "Icyandikwa Ry'Ahantu H'Umuco",
      "fr": "Documentation du Site Patrimonial"
    },
    "author": "John Doe",
    "type": "PDF",
    "language": "en"
  }
]
```

### 5. Filter Documents
**GET** `/api/documents/filter?type={type}&language={language}&author={author}&isPublic={isPublic}`

**Access:** Authenticated

**Description:** Filter documents by multiple criteria.

**Query Parameters:**
- `type` (optional): Document type (PDF, DOCX, DOC, TXT, etc.)
- `language` (optional): Language code (en, rw, fr)
- `author` (optional): Author name
- `isPublic` (optional): Public status (true/false)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": {
      "en": "Heritage Site Documentation",
      "rw": "Icyandikwa Ry'Ahantu H'Umuco",
      "fr": "Documentation du Site Patrimonial"
    },
    "author": "John Doe",
    "type": "PDF",
    "language": "en",
    "isPublic": true
  }
]
```

### 6. Get Documents by Type
**GET** `/api/documents/type/{type}`

**Access:** Authenticated

**Description:** Retrieve all documents of a specific type.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": {
      "en": "PDF Document",
      "rw": "Inyandiko ya PDF",
      "fr": "Document PDF"
    },
    "type": "PDF",
    "author": "John Doe"
  }
]
```

### 7. Get Documents by Language
**GET** `/api/documents/language/{language}`

**Access:** Authenticated

**Description:** Retrieve all documents in a specific language.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": {
      "en": "English Document",
      "rw": "Inyandiko y'Icyongereza",
      "fr": "Document Anglais"
    },
    "language": "en",
    "author": "John Doe"
  }
]
```

### 8. Get Public Documents
**GET** `/api/documents/public`

**Access:** Public

**Description:** Retrieve all public documents (no authentication required).

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": {
      "en": "Public Heritage Document",
      "rw": "Inyandiko Y'Umuco Y'Umutekano",
      "fr": "Document Patrimonial Public"
    },
    "author": "John Doe",
    "type": "PDF",
    "isPublic": true
  }
]
```

### 9. Get Document Types
**GET** `/api/documents/types`

**Access:** Public

**Description:** Get list of supported document types.

**Response:** `200 OK`
```json
[
  "PDF",
  "DOCX",
  "DOC",
  "TXT",
  "XLSX",
  "PPTX",
  "JPG",
  "PNG",
  "GIF",
  "MP4",
  "MP3"
]
```

### 10. Get Supported Languages
**GET** `/api/documents/languages`

**Access:** Public

**Description:** Get list of supported languages.

**Response:** `200 OK`
```json
[
  "en",
  "rw",
  "fr"
]
```

### 11. Document Statistics
**GET** `/api/documents/statistics/types`

**Access:** Authenticated

**Description:** Get document type distribution statistics.

**Response:** `200 OK`
```json
[
  ["PDF", 25],
  ["DOCX", 15],
  ["JPG", 10],
  ["MP4", 5]
]
```

**GET** `/api/documents/statistics/languages`

**Access:** Authenticated

**Description:** Get document language distribution statistics.

**Response:** `200 OK`
```json
[
  ["en", 30],
  ["rw", 20],
  ["fr", 10]
]
```

### 12. Update Document
**PUT** `/api/documents/{id}`

**Access:** ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER

**Description:** Update document metadata.

**Request Body:** Same as create document

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": {
    "en": "Updated Document Title",
    "rw": "Icyandikwa Ry'Inyandiko Ry'Ubusubire",
    "fr": "Titre du Document Mis à Jour"
  },
  "updatedBy": "john.doe",
  "updatedDate": "2024-01-15T11:30:00"
}
```

### 13. Delete Document
**DELETE** `/api/documents/{id}`

**Access:** ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER

**Description:** Soft delete a document (sets isActive to false).

**Response:** `204 No Content`

## Document Version Management

### 14. Add Document Version
**POST** `/api/documents/{id}/versions`

**Access:** Authenticated

**Description:** Add a new version to a document.

**Request Body:**
```json
{
  "filePath": "/uploads/documents/version1.pdf",
  "versionNumber": 2,
  "fileType": "PDF",
  "fileSize": 1024000
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "documentId": 1,
  "filePath": "/uploads/documents/version1.pdf",
  "versionNumber": 2,
  "fileType": "PDF",
  "fileSize": 1024000,
  "createdBy": "john.doe",
  "createdDate": "2024-01-15T12:00:00"
}
```

### 15. List Document Versions
**GET** `/api/documents/{id}/versions`

**Access:** Authenticated

**Description:** Get all versions of a document.

**Response:** `200 OK`
```json
[
  {
    "id": 2,
    "documentId": 1,
    "versionNumber": 2,
    "fileType": "PDF",
    "fileSize": 1024000,
    "createdDate": "2024-01-15T12:00:00"
  },
  {
    "id": 1,
    "documentId": 1,
    "versionNumber": 1,
    "fileType": "PDF",
    "fileSize": 512000,
    "createdDate": "2024-01-15T10:30:00"
  }
]
```

### 16. Get Latest Version
**GET** `/api/documents/{id}/versions/latest`

**Access:** Authenticated

**Description:** Get the latest version of a document.

**Response:** `200 OK`
```json
{
  "id": 2,
  "documentId": 1,
  "versionNumber": 2,
  "fileType": "PDF",
  "fileSize": 1024000,
  "createdDate": "2024-01-15T12:00:00"
}
```

### 17. Upload Version File
**POST** `/api/documents/{id}/versions/upload`

**Access:** ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER

**Description:** Upload a new version file for a document.

**Request:** Multipart form data
- `file` (required): The file to upload
- `createdBy` (optional): Username of uploader

**Response:** `201 Created`
```json
{
  "id": 3,
  "documentId": 1,
  "filePath": "/uploads/documents/uuid-filename.pdf",
  "versionNumber": 3,
  "fileType": "PDF",
  "fileSize": 2048000,
  "createdBy": "john.doe",
  "createdDate": "2024-01-15T13:00:00"
}
```

### 18. Download Latest Version
**GET** `/api/documents/{id}/download`

**Access:** COMMUNITY_MEMBER+

**Description:** Download the latest version of a document.

**Response:** `200 OK`
- File download with appropriate headers

### 19. Download Specific Version
**GET** `/api/documents/{id}/versions/{versionId}/download`

**Access:** COMMUNITY_MEMBER+

**Description:** Download a specific version of a document.

**Response:** `200 OK`
- File download with appropriate headers

### 20. Delete Version
**DELETE** `/api/documents/versions/{versionId}`

**Access:** ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER

**Description:** Soft delete a document version.

**Response:** `204 No Content`

## Folder Endpoints

### 21. Create Folder
**POST** `/api/folders`

**Access:** ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER

**Description:** Create a new folder with optional parent folder.

**Request Body:**
```json
{
  "name": "Heritage Documents",
  "parentId": 1,
  "allowedRoles": ["SYSTEM_ADMINISTRATOR", "HERITAGE_MANAGER", "CONTENT_MANAGER"]
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "name": "Heritage Documents",
  "parentId": 1,
  "childFolderIds": [],
  "allowedRoles": ["SYSTEM_ADMINISTRATOR", "HERITAGE_MANAGER", "CONTENT_MANAGER"],
  "isActive": true,
  "createdBy": "john.doe",
  "createdDate": "2024-01-15T10:30:00"
}
```

### 22. Get Folder
**GET** `/api/folders/{id}`

**Access:** Authenticated

**Description:** Retrieve a specific folder by ID.

**Response:** `200 OK`
```json
{
  "id": 2,
  "name": "Heritage Documents",
  "parentId": 1,
  "childFolderIds": [3, 4],
  "allowedRoles": ["SYSTEM_ADMINISTRATOR", "HERITAGE_MANAGER", "CONTENT_MANAGER"],
  "isActive": true,
  "createdBy": "john.doe",
  "createdDate": "2024-01-15T10:30:00"
}
```

### 23. List Folders
**GET** `/api/folders`

**Access:** Authenticated

**Description:** Retrieve all folders accessible to the user.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Root Folder",
    "parentId": null,
    "childFolderIds": [2, 5],
    "allowedRoles": ["SYSTEM_ADMINISTRATOR", "HERITAGE_MANAGER", "CONTENT_MANAGER"]
  }
]
```

### 24. Get Root Folders
**GET** `/api/folders/root`

**Access:** Authenticated

**Description:** Retrieve all root-level folders (no parent).

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Root Folder",
    "parentId": null,
    "childFolderIds": [2, 5],
    "allowedRoles": ["SYSTEM_ADMINISTRATOR", "HERITAGE_MANAGER", "CONTENT_MANAGER"]
  }
]
```

### 25. Get Child Folders
**GET** `/api/folders/{parentId}/children`

**Access:** Authenticated

**Description:** Retrieve all child folders of a specific parent.

**Response:** `200 OK`
```json
[
  {
    "id": 2,
    "name": "Child Folder 1",
    "parentId": 1,
    "childFolderIds": [],
    "allowedRoles": ["SYSTEM_ADMINISTRATOR", "HERITAGE_MANAGER"]
  }
]
```

### 26. Search Folders
**GET** `/api/folders/search?q={searchTerm}`

**Access:** Authenticated

**Description:** Search folders by name.

**Query Parameters:**
- `q` (required): Search term

**Response:** `200 OK`
```json
[
  {
    "id": 2,
    "name": "Heritage Documents",
    "parentId": 1,
    "allowedRoles": ["SYSTEM_ADMINISTRATOR", "HERITAGE_MANAGER"]
  }
]
```

### 27. Filter Folders
**GET** `/api/folders/filter?name={name}&parentId={parentId}&createdBy={createdBy}`

**Access:** Authenticated

**Description:** Filter folders by multiple criteria.

**Query Parameters:**
- `name` (optional): Folder name
- `parentId` (optional): Parent folder ID
- `createdBy` (optional): Creator username

**Response:** `200 OK`
```json
[
  {
    "id": 2,
    "name": "Heritage Documents",
    "parentId": 1,
    "createdBy": "john.doe"
  }
]
```

### 28. Get Folders by Creator
**GET** `/api/folders/creator/{createdBy}`

**Access:** Authenticated

**Description:** Retrieve all folders created by a specific user.

**Response:** `200 OK`
```json
[
  {
    "id": 2,
    "name": "John's Documents",
    "parentId": 1,
    "createdBy": "john.doe"
  }
]
```

### 29. Get Folders by Role
**GET** `/api/folders/role/{role}`

**Access:** Authenticated

**Description:** Retrieve all folders accessible to a specific role.

**Response:** `200 OK`
```json
[
  {
    "id": 2,
    "name": "Admin Folder",
    "parentId": 1,
    "allowedRoles": ["SYSTEM_ADMINISTRATOR"]
  }
]
```

### 30. Get Folder Statistics
**GET** `/api/folders/{id}/statistics`

**Access:** Authenticated

**Description:** Get statistics for a specific folder.

**Response:** `200 OK`
```json
{
  "documentCount": 15,
  "childFolderCount": 3
}
```

### 31. Get Folder Hierarchy Statistics
**GET** `/api/folders/statistics/hierarchy`

**Access:** Authenticated

**Description:** Get statistics about folder hierarchy.

**Response:** `200 OK`
```json
[
  [null, 5],
  [1, 3],
  [2, 2]
]
```

### 32. Get Folder Permissions
**GET** `/api/folders/permissions`

**Access:** Public

**Description:** Get list of available folder permissions.

**Response:** `200 OK`
```json
[
  "SYSTEM_ADMINISTRATOR",
  "HERITAGE_MANAGER",
  "CONTENT_MANAGER",
  "COMMUNITY_MEMBER",
  "PUBLIC"
]
```

### 33. Update Folder
**PUT** `/api/folders/{id}`

**Access:** ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER

**Description:** Update folder name or parent.

**Request Body:**
```json
{
  "name": "Updated Folder Name",
  "parentId": 3
}
```

**Response:** `200 OK`
```json
{
  "id": 2,
  "name": "Updated Folder Name",
  "parentId": 3,
  "updatedBy": "john.doe",
  "updatedDate": "2024-01-15T11:30:00"
}
```

### 34. Delete Folder
**DELETE** `/api/folders/{id}`

**Access:** ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER

**Description:** Soft delete a folder (sets isActive to false).

**Response:** `204 No Content`

## Error Responses

### Common Error Codes
- `400 Bad Request`: Invalid request data or validation errors
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate folder name)

### Error Response Format
```json
{
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    "Document title is required",
    "Invalid document type"
  ]
}
```

## Data Models

### Document Types
- `PDF`: Portable Document Format
- `DOCX`: Microsoft Word Document
- `DOC`: Microsoft Word Document (legacy)
- `TXT`: Plain Text
- `XLSX`: Microsoft Excel Spreadsheet
- `PPTX`: Microsoft PowerPoint Presentation
- `JPG`: JPEG Image
- `PNG`: PNG Image
- `GIF`: GIF Image
- `MP4`: MP4 Video
- `MP3`: MP3 Audio

### Supported Languages
- `en`: English
- `rw`: Kinyarwanda
- `fr`: French

### Folder Permissions
- `SYSTEM_ADMINISTRATOR`: Full system access
- `HERITAGE_MANAGER`: Heritage management access
- `CONTENT_MANAGER`: Content management access
- `COMMUNITY_MEMBER`: Community member access
- `PUBLIC`: Public access (no authentication required) 