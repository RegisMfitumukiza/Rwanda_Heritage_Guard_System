# Task 2: Digital Documentation System - API Summary

## Overview
The Digital Documentation System provides comprehensive document and folder management with version control, hierarchical organization, and role-based access control.

## Authentication
Include JWT token in Authorization header: `Authorization: Bearer <token>`

## Document Endpoints (25 total)

### Core CRUD Operations
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `POST` | `/api/documents` | Create document | ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER |
| `GET` | `/api/documents` | List documents | Authenticated |
| `GET` | `/api/documents/{id}` | Get document | Authenticated |
| `PUT` | `/api/documents/{id}` | Update document | ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER |
| `DELETE` | `/api/documents/{id}` | Delete document | ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER |

### Search & Filtering
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/api/documents/search?q={term}` | Search documents | Authenticated |
| `GET` | `/api/documents/filter` | Filter documents | Authenticated |
| `GET` | `/api/documents/type/{type}` | By document type | Authenticated |
| `GET` | `/api/documents/language/{lang}` | By language | Authenticated |
| `GET` | `/api/documents/author/{author}` | By author | Authenticated |
| `GET` | `/api/documents/creator/{user}` | By creator | Authenticated |
| `GET` | `/api/documents/date-range` | By date range | Authenticated |

### Public Access
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/api/documents/public` | Public documents | Public |
| `GET` | `/api/documents/types` | Supported types | Public |
| `GET` | `/api/documents/languages` | Supported languages | Public |

### Statistics
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/api/documents/statistics/types` | Type statistics | Authenticated |
| `GET` | `/api/documents/statistics/languages` | Language statistics | Authenticated |

### Version Management
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `POST` | `/api/documents/{id}/versions` | Add version | Authenticated |
| `GET` | `/api/documents/{id}/versions` | List versions | Authenticated |
| `GET` | `/api/documents/{id}/versions/latest` | Latest version | Authenticated |
| `GET` | `/api/documents/versions/{id}` | Get version | Authenticated |
| `POST` | `/api/documents/{id}/versions/upload` | Upload file | ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER |
| `DELETE` | `/api/documents/versions/{id}` | Delete version | ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER |

### File Download
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/api/documents/{id}/download` | Download latest | COMMUNITY_MEMBER+ |
| `GET` | `/api/documents/{id}/versions/{vid}/download` | Download version | COMMUNITY_MEMBER+ |

### Folder Operations
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/api/documents/folder/{folderId}` | By folder | Authenticated |

## Folder Endpoints (15 total)

### Core CRUD Operations
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `POST` | `/api/folders` | Create folder | ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER |
| `GET` | `/api/folders` | List folders | Authenticated |
| `GET` | `/api/folders/{id}` | Get folder | Authenticated |
| `PUT` | `/api/folders/{id}` | Update folder | ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER |
| `DELETE` | `/api/folders/{id}` | Delete folder | ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER |

### Hierarchy Management
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/api/folders/root` | Root folders | Authenticated |
| `GET` | `/api/folders/{parentId}/children` | Child folders | Authenticated |

### Search & Filtering
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/api/folders/search?q={term}` | Search folders | Authenticated |
| `GET` | `/api/folders/filter` | Filter folders | Authenticated |
| `GET` | `/api/folders/creator/{user}` | By creator | Authenticated |
| `GET` | `/api/folders/role/{role}` | By role | Authenticated |

### Statistics
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/api/folders/{id}/statistics` | Folder statistics | Authenticated |
| `GET` | `/api/folders/statistics/hierarchy` | Hierarchy statistics | Authenticated |

### Public Access
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/api/folders/permissions` | Available permissions | Public |

## Data Models

### Document Types
- `PDF`, `DOCX`, `DOC`, `TXT`, `XLSX`, `PPTX`, `JPG`, `PNG`, `GIF`, `MP4`, `MP3`

### Languages
- `en` (English), `rw` (Kinyarwanda), `fr` (French)

### Folder Permissions
- `SYSTEM_ADMINISTRATOR`, `HERITAGE_MANAGER`, `CONTENT_MANAGER`, `COMMUNITY_MEMBER`, `PUBLIC`

## Key Features

### Document Management
- ✅ Multilingual support (title, description)
- ✅ Version control with file upload/download
- ✅ Advanced search and filtering
- ✅ Role-based access control
- ✅ Soft delete functionality
- ✅ Statistics and analytics

### Folder Management
- ✅ Hierarchical folder structure
- ✅ Role-based permissions
- ✅ Cycle detection in hierarchy
- ✅ Folder statistics
- ✅ Search and filtering capabilities

### Security
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ Public/private document support
- ✅ Creator-based access control

## Error Handling
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflicts

## Total Endpoints: 40
- **Document Endpoints**: 25
- **Folder Endpoints**: 15 