# Task 1: Heritage Site Inventory - API Documentation

## Overview
The Heritage Site Inventory system provides comprehensive management of heritage sites with multilingual support, media/document management, and role-based access control.

## Authentication
All endpoints require JWT authentication except those marked as "Public". Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Heritage Site Endpoints

### 1. Create Heritage Site
**POST** `/api/sites`

**Access:** ADMIN, HERITAGE_MANAGER

**Description:** Create a new heritage site with multilingual support.

**Request Body:**
```json
{
  "nameEn": "Royal Palace Museum",
  "nameRw": "Ibiro by'Umwami",
  "nameFr": "Palais Royal",
  "descriptionEn": "Historic royal palace with cultural significance",
  "descriptionRw": "Ibiro by'umwami byo kera bifite uburenganzira",
  "descriptionFr": "Palais royal historique avec signification culturelle",
  "significanceEn": "Cultural and historical significance",
  "significanceRw": "Uburenganzira bw'umuco n'amateka",
  "significanceFr": "Signification culturelle et historique",
  "address": "Nyanza, Southern Province",
  "region": "Southern",
  "district": "Nyanza",
  "gpsLatitude": "-2.3528",
  "gpsLongitude": "29.7406",
  "status": "ACTIVE",
  "category": "CULTURAL",
  "ownership": "GOVERNMENT",
  "dateOfEstablishment": "1959",
  "contactInfo": "+250 788 123 456"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "nameEn": "Royal Palace Museum",
  "nameRw": "Ibiro by'Umwami",
  "nameFr": "Palais Royal",
  "descriptionEn": "Historic royal palace with cultural significance",
  "descriptionRw": "Ibiro by'umwami byo kera bifite uburenganzira",
  "descriptionFr": "Palais royal historique avec signification culturelle",
  "significanceEn": "Cultural and historical significance",
  "significanceRw": "Uburenganzira bw'umuco n'amateka",
  "significanceFr": "Signification culturelle et historique",
  "address": "Nyanza, Southern Province",
  "region": "Southern",
  "district": "Nyanza",
  "gpsLatitude": "-2.3528",
  "gpsLongitude": "29.7406",
  "status": "ACTIVE",
  "category": "CULTURAL",
  "ownership": "GOVERNMENT",
  "dateOfEstablishment": "1959",
  "contactInfo": "+250 788 123 456",
  "isActive": true,
  "createdBy": "admin",
  "createdDate": "2024-01-15T10:30:00",
  "updatedBy": "admin",
  "updatedDate": "2024-01-15T10:30:00"
}
```

### 2. Get Heritage Site
**GET** `/api/sites/{id}`

**Access:** Public

**Description:** Retrieve a specific heritage site by ID.

**Query Parameters:**
- `language` (optional): `en`, `rw`, or `fr` - Language for content display

**Response:** `200 OK`
```json
{
  "id": 1,
  "nameEn": "Royal Palace Museum",
  "nameRw": "Ibiro by'Umwami",
  "nameFr": "Palais Royal",
  "descriptionEn": "Historic royal palace with cultural significance",
  "descriptionRw": "Ibiro by'umwami byo kera bifite uburenganzira",
  "descriptionFr": "Palais royal historique avec signification culturelle",
  "significanceEn": "Cultural and historical significance",
  "significanceRw": "Uburenganzira bw'umuco n'amateka",
  "significanceFr": "Signification culturelle et historique",
  "address": "Nyanza, Southern Province",
  "region": "Southern",
  "district": "Nyanza",
  "gpsLatitude": "-2.3528",
  "gpsLongitude": "29.7406",
  "status": "ACTIVE",
  "category": "CULTURAL",
  "ownership": "GOVERNMENT",
  "dateOfEstablishment": "1959",
  "contactInfo": "+250 788 123 456",
  "isActive": true,
  "createdBy": "admin",
  "createdDate": "2024-01-15T10:30:00",
  "updatedBy": "admin",
  "updatedDate": "2024-01-15T10:30:00",
  "media": [...],
  "documents": [...]
}
```

### 3. List Heritage Sites
**GET** `/api/sites`

**Access:** Public

**Description:** Retrieve all active heritage sites.

**Query Parameters:**
- `language` (optional): `en`, `rw`, or `fr` - Language for content display
- `page` (optional): Page number for pagination
- `size` (optional): Page size for pagination

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "nameEn": "Royal Palace Museum",
    "nameRw": "Ibiro by'Umwami",
    "nameFr": "Palais Royal",
    "descriptionEn": "Historic royal palace with cultural significance",
    "descriptionRw": "Ibiro by'umwami byo kera bifite uburenganzira",
    "descriptionFr": "Palais royal historique avec signification culturelle",
    "address": "Nyanza, Southern Province",
    "region": "Southern",
    "district": "Nyanza",
    "status": "ACTIVE",
    "category": "CULTURAL",
    "isActive": true
  }
]
```

### 4. Search Heritage Sites
**GET** `/api/sites/search`

**Access:** Public

**Description:** Advanced search with multiple filter criteria.

**Query Parameters:**
- `region` (optional): Filter by region
- `category` (optional): Filter by category
- `status` (optional): Filter by status
- `dateOfEstablishment` (optional): Filter by establishment date
- `language` (optional): `en`, `rw`, or `fr` - Language for content display

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "nameEn": "Royal Palace Museum",
    "nameRw": "Ibiro by'Umwami",
    "nameFr": "Palais Royal",
    "region": "Southern",
    "category": "CULTURAL",
    "status": "ACTIVE"
  }
]
```

### 5. Search by Name
**GET** `/api/sites/search/name`

**Access:** Public

**Description:** Search heritage sites by name (multilingual search).

**Query Parameters:**
- `searchTerm` (required): Search term for name
- `language` (optional): `en`, `rw`, or `fr` - Language for content display

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "nameEn": "Royal Palace Museum",
    "nameRw": "Ibiro by'Umwami",
    "nameFr": "Palais Royal",
    "region": "Southern",
    "category": "CULTURAL"
  }
]
```

### 6. Get Sites by Region
**GET** `/api/sites/region/{region}`

**Access:** Public

**Description:** Get all heritage sites in a specific region.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "nameEn": "Royal Palace Museum",
    "nameRw": "Ibiro by'Umwami",
    "nameFr": "Palais Royal",
    "region": "Southern",
    "category": "CULTURAL"
  }
]
```

### 7. Get Sites by Category
**GET** `/api/sites/category/{category}`

**Access:** Public

**Description:** Get all heritage sites of a specific category.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "nameEn": "Royal Palace Museum",
    "nameRw": "Ibiro by'Umwami",
    "nameFr": "Palais Royal",
    "region": "Southern",
    "category": "CULTURAL"
  }
]
```

### 8. Get Sites by Creator
**GET** `/api/sites/creator/{createdBy}`

**Access:** ADMIN, HERITAGE_MANAGER

**Description:** Get all heritage sites created by a specific user.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "nameEn": "Royal Palace Museum",
    "nameRw": "Ibiro by'Umwami",
    "nameFr": "Palais Royal",
    "createdBy": "admin",
    "region": "Southern"
  }
]
```

### 9. Get Sites by Ownership
**GET** `/api/sites/ownership/{ownership}`

**Access:** ADMIN, HERITAGE_MANAGER

**Description:** Get all heritage sites with specific ownership.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "nameEn": "Royal Palace Museum",
    "nameRw": "Ibiro by'Umwami",
    "nameFr": "Palais Royal",
    "ownership": "GOVERNMENT",
    "region": "Southern"
  }
]
```

### 10. Update Heritage Site
**PUT** `/api/sites/{id}`

**Access:** ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER

**Description:** Update an existing heritage site.

**Request Body:** Same as create heritage site

**Response:** `200 OK`
```json
{
  "id": 1,
  "nameEn": "Updated Royal Palace Museum",
  "nameRw": "Ibiro by'Umwami By'Ubusubire",
  "nameFr": "Palais Royal Mis à Jour",
  "updatedBy": "admin",
  "updatedDate": "2024-01-15T11:30:00"
}
```

### 11. Patch Heritage Site
**PATCH** `/api/sites/{id}`

**Access:** ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER

**Description:** Partially update a heritage site (only provided fields).

**Request Body:**
```json
{
  "nameEn": "Updated Name Only",
  "contactInfo": "+250 788 999 999"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "nameEn": "Updated Name Only",
  "contactInfo": "+250 788 999 999",
  "updatedBy": "admin",
  "updatedDate": "2024-01-15T11:45:00"
}
```

### 12. Delete Heritage Site
**DELETE** `/api/sites/{id}`

**Access:** ADMIN, HERITAGE_MANAGER

**Description:** Soft delete a heritage site (sets isActive to false).

**Response:** `204 No Content`

## Media Management Endpoints

### 13. Upload Media
**POST** `/api/sites/{id}/media`

**Access:** ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER

**Description:** Upload media file for a heritage site.

**Request Body:**
```json
{
  "fileName": "palace_photo.jpg",
  "fileType": "image/jpeg",
  "filePath": "/uploads/media/uuid.jpg",
  "description": "Main palace building",
  "category": "ARCHITECTURE",
  "dateTaken": "2024-01-15",
  "photographer": "John Doe",
  "isPublic": true
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "fileName": "palace_photo.jpg",
  "fileType": "image/jpeg",
  "filePath": "/uploads/media/uuid.jpg",
  "description": "Main palace building",
  "category": "ARCHITECTURE",
  "dateTaken": "2024-01-15",
  "photographer": "John Doe",
  "isPublic": true,
  "heritageSiteId": 1,
  "uploaderUsername": "admin",
  "isActive": true,
  "createdBy": "admin",
  "createdDate": "2024-01-15T12:00:00",
  "updatedBy": "admin",
  "updatedDate": "2024-01-15T12:00:00"
}
```

### 14. Delete Media
**DELETE** `/api/sites/{id}/media/{mediaId}`

**Access:** ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER

**Description:** Delete media file from a heritage site.

**Response:** `204 No Content`

## Document Management Endpoints

### 15. Upload Document
**POST** `/api/sites/{id}/documents`

**Access:** ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER

**Description:** Upload document file for a heritage site.

**Request Body:**
```json
{
  "fileName": "palace_history.pdf",
  "fileType": "application/pdf",
  "filePath": "/uploads/documents/uuid.pdf",
  "description": "Historical documentation",
  "category": "HISTORICAL",
  "uploadDate": "2024-01-15",
  "isPublic": true
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "fileName": "palace_history.pdf",
  "fileType": "application/pdf",
  "filePath": "/uploads/documents/uuid.pdf",
  "description": "Historical documentation",
  "category": "HISTORICAL",
  "uploadDate": "2024-01-15",
  "isPublic": true,
  "heritageSiteId": 1,
  "uploaderUsername": "admin",
  "isActive": true,
  "createdBy": "admin",
  "createdDate": "2024-01-15T12:00:00",
  "updatedBy": "admin",
  "updatedDate": "2024-01-15T12:00:00"
}
```

### 16. Delete Document
**DELETE** `/api/sites/{id}/documents/{docId}`

**Access:** ADMIN, HERITAGE_MANAGER, CONTENT_MANAGER

**Description:** Delete document file from a heritage site.

**Response:** `204 No Content`

## Error Responses

### Common Error Codes
- `400 Bad Request`: Invalid request data or validation errors
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict

### Error Response Format
```json
{
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    "Name in English is required",
    "GPS coordinates must be in valid format"
  ]
}
```

## Data Models

### Heritage Site Status Values
- `ACTIVE`: Site is currently active and accessible
- `INACTIVE`: Site is temporarily inactive
- `UNDER_MAINTENANCE`: Site is under maintenance
- `CLOSED`: Site is permanently closed

### Heritage Site Categories
- `CULTURAL`: Cultural heritage sites
- `NATURAL`: Natural heritage sites
- `HISTORICAL`: Historical sites
- `RELIGIOUS`: Religious sites
- `ARCHAEOLOGICAL`: Archaeological sites

### Ownership Types
- `GOVERNMENT`: Government-owned
- `PRIVATE`: Privately owned
- `COMMUNITY`: Community-owned
- `MIXED`: Mixed ownership

### Media Categories
- `ARCHITECTURE`: Architectural photos
- `LANDSCAPE`: Landscape photos
- `ARTIFACTS`: Artifact photos
- `EVENTS`: Event photos
- `DOCUMENTATION`: Documentation photos

### Document Categories
- `HISTORICAL`: Historical documents
- `LEGAL`: Legal documents
- `TECHNICAL`: Technical documentation
- `RESEARCH`: Research papers
- `ADMINISTRATIVE`: Administrative documents

## Frontend Integration Examples

### JavaScript/TypeScript
```javascript
// Get heritage sites
const getSites = async (language = 'en') => {
  const response = await fetch(`/api/sites?language=${language}`, {
    headers: { 'Content-Type': 'application/json' }
  });
  return await response.json();
};

// Create heritage site
const createSite = async (siteData) => {
  const response = await fetch('/api/sites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(siteData)
  });
  return await response.json();
};

// Search sites
const searchSites = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/sites/search?${params}`);
  return await response.json();
};

// Upload media
const uploadMedia = async (siteId, file, metadata) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', metadata.description);
  formData.append('category', metadata.category);
  formData.append('isPublic', metadata.isPublic);

  const response = await fetch(`/api/sites/${siteId}/media`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  return await response.json();
};
```

### React Hook Example
```javascript
const useHeritageSites = (language = 'en') => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const data = await getSites(language);
      setSites(data);
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setLoading(false);
    }
  };

  return { sites, loading, fetchSites };
};
```

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

## Total Endpoints: 16
- **Heritage Site Endpoints**: 12
- **Media Management Endpoints**: 2
- **Document Management Endpoints**: 2 