# Task 3: Artifact Documentation and Authentication - API Summary

## Overview
Comprehensive artifact management system with multilingual support, authentication records, provenance tracking, and digital documentation (images, 3D models).

## Key Features
- **Multilingual Support**: Artifacts with names/descriptions in English, Kinyarwanda, French
- **Digital Documentation**: Image, 3D model, video, audio, document uploads
- **Authentication System**: Expert verification with supporting documents
- **Provenance Tracking**: Complete ownership and transfer history
- **Advanced Search**: Multi-criteria search and filtering
- **Statistics**: Comprehensive analytics and reporting
- **Access Control**: Role-based permissions (Public, Community Member, Heritage Manager, Admin)

## API Endpoints Summary

### Artifact Management (20 endpoints)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/artifacts` | ADMIN, HERITAGE_MANAGER | Create artifact |
| GET | `/artifacts` | Public (public only) | List all artifacts |
| GET | `/artifacts/{id}` | Public (public only) | Get artifact by ID |
| PUT | `/artifacts/{id}` | ADMIN, HERITAGE_MANAGER | Update artifact |
| DELETE | `/artifacts/{id}` | ADMIN, HERITAGE_MANAGER | Delete artifact |
| GET | `/artifacts/search` | Public (public only) | Advanced search |
| GET | `/artifacts/search/name` | Public (public only) | Search by name |
| GET | `/artifacts/search/location` | Public (public only) | Search by location |
| GET | `/artifacts/filter/category/{category}` | Public (public only) | Filter by category |
| GET | `/artifacts/filter/period/{period}` | Public (public only) | Filter by period |
| GET | `/artifacts/filter/condition/{condition}` | Public (public only) | Filter by condition |
| GET | `/artifacts/filter/site/{siteId}` | Public (public only) | Filter by heritage site |
| GET | `/artifacts/filter/acquisition-method/{method}` | Public (public only) | Filter by acquisition method |
| GET | `/artifacts/filter/authentication-status/{status}` | Public (public only) | Filter by authentication status |
| GET | `/artifacts/statistics` | Public (public only) | Overall statistics |
| GET | `/artifacts/statistics/category` | Public (public only) | Statistics by category |
| GET | `/artifacts/statistics/period` | Public (public only) | Statistics by period |
| GET | `/artifacts/statistics/condition` | Public (public only) | Statistics by condition |
| GET | `/artifacts/statistics/acquisition-method` | Public (public only) | Statistics by acquisition method |

### Artifact Media Management (8 endpoints)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/artifacts/{artifactId}/media/upload` | ADMIN, HERITAGE_MANAGER | Upload media |
| GET | `/artifacts/{artifactId}/media` | Public (public only) | List media |
| GET | `/artifacts/{artifactId}/media/{mediaId}` | Public (public only) | Get media metadata |
| GET | `/artifacts/{artifactId}/media/{mediaId}/download` | COMMUNITY_MEMBER+ | Download media |
| PATCH | `/artifacts/{artifactId}/media/{mediaId}` | ADMIN, HERITAGE_MANAGER | Update media metadata |
| PUT | `/artifacts/{artifactId}/media/{mediaId}/file` | ADMIN, HERITAGE_MANAGER | Replace media file |
| DELETE | `/artifacts/{artifactId}/media/{mediaId}` | ADMIN, HERITAGE_MANAGER | Delete media |

### Artifact Authentication Management (6 endpoints)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/artifacts/{artifactId}/authentications` | ADMIN, HERITAGE_MANAGER | Add authentication record |
| POST | `/artifacts/{artifactId}/authentications/upload` | ADMIN, HERITAGE_MANAGER | Add with file upload |
| GET | `/artifacts/{artifactId}/authentications` | Public (public only) | List authentication records |
| GET | `/artifacts/{artifactId}/authentications/{authId}` | Public (public only) | Get authentication record |
| GET | `/artifacts/{artifactId}/authentications/{authId}/document` | COMMUNITY_MEMBER+ | Download document |
| DELETE | `/artifacts/{artifactId}/authentications/{authId}` | ADMIN, HERITAGE_MANAGER | Delete authentication record |

### Provenance Record Management (6 endpoints)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/artifacts/{artifactId}/provenance` | ADMIN, HERITAGE_MANAGER | Add provenance record |
| POST | `/artifacts/{artifactId}/provenance/upload` | ADMIN, HERITAGE_MANAGER | Add with file upload |
| GET | `/artifacts/{artifactId}/provenance` | Public (public only) | List provenance records |
| GET | `/artifacts/{artifactId}/provenance/{recordId}` | Public (public only) | Get provenance record |
| GET | `/artifacts/{artifactId}/provenance/{recordId}/document` | COMMUNITY_MEMBER+ | Download document |
| DELETE | `/artifacts/{artifactId}/provenance/{recordId}` | ADMIN, HERITAGE_MANAGER | Delete provenance record |

## Data Models

### Artifact
```json
{
  "id": 1,
  "name": {"en": "Ancient Vase", "rw": "Inkindi ya Kera", "fr": "Vase Ancien"},
  "description": {"en": "Beautiful ceramic vase", "rw": "Inkindi ya kera nziza", "fr": "Vase céramique magnifique"},
  "category": "Ceramics",
  "period": "15th Century",
  "physicalCharacteristics": "Height: 45cm, Diameter: 25cm",
  "condition": "Good",
  "acquisitionMethod": "Donation",
  "acquisitionDate": "2023-01-15",
  "location": "National Museum",
  "heritageSiteId": 1,
  "isPublic": true
}
```

### ArtifactMedia
```json
{
  "id": 1,
  "artifactId": 1,
  "mediaType": "image",
  "filePath": "/uploads/artifacts/1/vase.jpg",
  "isPublic": true,
  "description": "Front view of the vase",
  "uploadedBy": "heritage_manager"
}
```

### ArtifactAuthentication
```json
{
  "id": 1,
  "artifactId": 1,
  "status": "Authentic",
  "method": "Carbon Dating",
  "date": "2023-01-20",
  "expertName": "Dr. Jean Pierre",
  "documentation": "Carbon dating confirms 15th century origin",
  "documentFileName": "carbon_dating_report.pdf"
}
```

### ProvenanceRecord
```json
{
  "id": 1,
  "artifactId": 1,
  "history": "Discovered in archaeological excavation in 1985",
  "eventDate": "1985-06-15",
  "location": "Archaeological Site, Southern Province",
  "previousOwner": "Archaeological Survey",
  "newOwner": "National Museum",
  "transferMethod": "Donation",
  "sourceInstitution": "Archaeological Survey",
  "destinationInstitution": "National Museum"
}
```

## Search & Filter Parameters

### Advanced Search
- `searchTerm`: Search by artifact name
- `location`: Search by location
- `category`: Filter by category
- `period`: Filter by period
- `condition`: Filter by condition
- `siteId`: Filter by heritage site
- `acquisitionMethod`: Filter by acquisition method
- `authenticationStatus`: Filter by authentication status
- `isPublic`: Filter by public status

### Example Search
```
GET /artifacts/search?category=Ceramics&period=15th Century&isPublic=true
```

## File Upload Support

### Supported Media Types
- **Images**: JPG, PNG, GIF, WebP (max 10MB)
- **3D Models**: OBJ, STL, PLY (max 50MB)
- **Videos**: MP4, AVI, MOV (max 100MB)
- **Audio**: MP3, WAV, FLAC (max 20MB)
- **Documents**: PDF, DOC, DOCX (max 10MB)

### Upload Endpoints
- Artifact media: `/artifacts/{artifactId}/media/upload`
- Authentication documents: `/artifacts/{artifactId}/authentications/upload`
- Provenance documents: `/artifacts/{artifactId}/provenance/upload`

## Statistics Endpoints

### Available Statistics
- **Overall**: Total, public, and private artifact counts
- **By Category**: Artifact distribution by category
- **By Period**: Artifact distribution by historical period
- **By Condition**: Artifact distribution by condition
- **By Acquisition Method**: Artifact distribution by acquisition method

### Example Response
```json
{
  "totalArtifacts": 150,
  "publicArtifacts": 120,
  "privateArtifacts": 30
}
```

## Access Control Matrix

| Role | View Public | View Private | Create | Update | Delete | Upload Files | Download Files |
|------|-------------|--------------|--------|--------|--------|--------------|----------------|
| Public | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Community Member | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Content Manager | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Heritage Manager | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| System Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Validation Rules

### Artifact
- `name`: Required, multilingual map
- `category`: Required, 1-100 characters
- `location`: Required, 1-500 characters
- `acquisitionDate`: Optional, past or present date

### Media
- `mediaType`: Required, must be: image, 3d_model, video, audio, document
- File size limits enforced per type

### Authentication
- `status`: Required, must be: Authentic, Suspected, Fake, Pending, Inconclusive
- `method`: Required, 1-100 characters
- `expertName`: Required, 1-200 characters
- `date`: Required, past or present date

### Provenance
- `history`: Required, 1-2000 characters
- `eventDate`: Optional, valid date
- `location`: Required for upload endpoint

## Error Handling

### Common Error Responses
- `400 Bad Request`: Validation errors, duplicate names
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server errors

### Example Error Response
```json
{
  "error": "Bad Request",
  "message": "Artifact name must be unique per site"
}
```

## Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Public/private content separation
- File download permissions

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- File upload security
- Audit trails for all changes

### Rate Limiting
- API request rate limiting
- File upload frequency limits
- Authentication endpoint protection

## Best Practices

### For Frontend Development
1. Check user permissions before showing actions
2. Implement proper error handling
3. Use pagination for large lists
4. Cache frequently accessed data
5. Show upload progress indicators

### For API Integration
1. Use appropriate HTTP status codes
2. Include proper error messages
3. Implement retry logic
4. Use authentication headers
5. Handle file uploads correctly

## Total Endpoints: 40

### Breakdown
- **Artifact Management**: 20 endpoints
- **Media Management**: 8 endpoints  
- **Authentication Management**: 6 endpoints
- **Provenance Management**: 6 endpoints

All endpoints follow RESTful conventions and include proper error handling, validation, and access control. 