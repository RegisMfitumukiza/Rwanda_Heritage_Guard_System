# Task 1: Heritage Site Inventory - API Summary

## Overview
The Heritage Site Inventory system provides comprehensive management of heritage sites with multilingual support, media/document management, and role-based access control.

## Authentication
Include JWT token in Authorization header: `Authorization: Bearer <token>`

## Heritage Site Endpoints (12 total)

### Core CRUD Operations
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `POST` | `/api/sites` | Create heritage site | ADMIN, HERITAGE_MANAGER |
| `GET` | `/api/sites` | List heritage sites | Public |
| `GET` | `/api/sites/{id}` | Get heritage site | Public |
| `PUT` | `/api/sites/{id}` | Update heritage site | ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER |
| `PATCH` | `/api/sites/{id}` | Patch heritage site | ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER |
| `DELETE` | `/api/sites/{id}` | Delete heritage site | ADMIN, HERITAGE_MANAGER |

### Search & Filtering
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/api/sites/search` | Advanced search | Public |
| `GET` | `/api/sites/search/name` | Search by name | Public |
| `GET` | `/api/sites/region/{region}` | By region | Public |
| `GET` | `/api/sites/category/{category}` | By category | Public |
| `GET` | `/api/sites/creator/{createdBy}` | By creator | ADMIN, HERITAGE_MANAGER |
| `GET` | `/api/sites/ownership/{ownership}` | By ownership | ADMIN, HERITAGE_MANAGER |

## Media Management Endpoints (2 total)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `POST` | `/api/sites/{id}/media` | Upload media | ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER |
| `DELETE` | `/api/sites/{id}/media/{mediaId}` | Delete media | ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER |

## Document Management Endpoints (2 total)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `POST` | `/api/sites/{id}/documents` | Upload document | ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER |
| `DELETE` | `/api/sites/{id}/documents/{docId}` | Delete document | ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER |

## Data Models

### Heritage Site Status Values
- `ACTIVE`, `INACTIVE`, `UNDER_MAINTENANCE`, `CLOSED`

### Heritage Site Categories
- `CULTURAL`, `NATURAL`, `HISTORICAL`, `RELIGIOUS`, `ARCHAEOLOGICAL`

### Ownership Types
- `GOVERNMENT`, `PRIVATE`, `COMMUNITY`, `MIXED`

### Media Categories
- `ARCHITECTURE`, `LANDSCAPE`, `ARTIFACTS`, `EVENTS`, `DOCUMENTATION`

### Document Categories
- `HISTORICAL`, `LEGAL`, `TECHNICAL`, `RESEARCH`, `ADMINISTRATIVE`

## Key Features

### Heritage Site Management
- ✅ Multilingual support (English, Kinyarwanda, French)
- ✅ Advanced search and filtering
- ✅ Role-based access control
- ✅ Soft delete functionality
- ✅ GPS coordinates support

### Media & Document Management
- ✅ File upload for media and documents
- ✅ Category-based organization
- ✅ Public/private access control
- ✅ Metadata tracking

### Security
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ Public/private content support
- ✅ Creator-based access control

## Error Handling
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflicts

## Total Endpoints: 16
- **Heritage Site Endpoints**: 12
- **Media Management Endpoints**: 2
- **Document Management Endpoints**: 2 