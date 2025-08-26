# Task 3: Artifact Documentation and Authentication - API Documentation

## Overview
The Artifact Documentation and Authentication module provides comprehensive management of artifact records, including multilingual details, physical characteristics, historical context, authentication records, provenance tracking, and digital documentation (images, 3D models).

## Base URL
```
http://localhost:8080/api
```

## Authentication
- **Public Access**: Basic artifact information and public media
- **Community Member+**: Full access to all artifact details and media
- **Heritage Manager/Admin**: Full CRUD operations and authentication management

## Data Models

### Artifact
```json
{
  "id": 1,
  "name": {
    "en": "Ancient Ceramic Vase",
    "rw": "Inkindi ya Kera ya Kera",
    "fr": "Vase Céramique Ancien"
  },
  "description": {
    "en": "A beautifully crafted ceramic vase from the 15th century",
    "rw": "Inkindi ya kera y'ubuhanzi bwiza ya nyuma ya 15",
    "fr": "Un vase céramique magnifiquement fabriqué du 15ème siècle"
  },
  "category": "Ceramics",
  "period": "15th Century",
  "physicalCharacteristics": "Height: 45cm, Diameter: 25cm, Material: Terracotta",
  "condition": "Good",
  "acquisitionMethod": "Donation",
  "acquisitionDate": "2023-01-15",
  "location": "National Museum of Rwanda",
  "heritageSiteId": 1,
  "isPublic": true,
  "createdBy": "heritage_manager",
  "createdDate": "2023-01-15T10:30:00",
  "updatedBy": "heritage_manager",
  "updatedDate": "2023-01-15T10:30:00"
}
```

### ArtifactMedia
```json
{
  "id": 1,
  "artifactId": 1,
  "mediaType": "image",
  "filePath": "/uploads/artifacts/1/vase_front.jpg",
  "isPublic": true,
  "uploadDate": "2023-01-15T10:30:00",
  "uploadedBy": "heritage_manager",
  "description": "Front view of the ceramic vase",
  "updatedBy": "heritage_manager",
  "updatedDate": "2023-01-15T10:30:00"
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
  "documentation": "Carbon dating results confirm 15th century origin",
  "documentFilePath": "/uploads/authentications/1/carbon_dating_report.pdf",
  "documentFileName": "carbon_dating_report.pdf",
  "uploadDate": "2023-01-20T14:00:00",
  "uploadedBy": "heritage_manager",
  "createdBy": "heritage_manager",
  "createdDate": "2023-01-20T14:00:00",
  "updatedBy": "heritage_manager",
  "updatedDate": "2023-01-20T14:00:00"
}
```

### ProvenanceRecord
```json
{
  "id": 1,
  "artifactId": 1,
  "history": "Originally discovered in archaeological excavation in 1985",
  "eventDate": "1985-06-15",
  "location": "Archaeological Site, Southern Province",
  "previousOwner": "Archaeological Survey of Rwanda",
  "newOwner": "National Museum of Rwanda",
  "transferMethod": "Donation",
  "sourceInstitution": "Archaeological Survey of Rwanda",
  "destinationInstitution": "National Museum of Rwanda",
  "relatedDocuments": "Excavation report, Transfer certificate",
  "documentFilePath": "/uploads/provenance/1/excavation_report.pdf",
  "documentFileName": "excavation_report.pdf",
  "uploadDate": "2023-01-15T10:30:00",
  "uploadedBy": "heritage_manager",
  "createdBy": "heritage_manager",
  "createdDate": "2023-01-15T10:30:00",
  "updatedBy": "heritage_manager",
  "updatedDate": "2023-01-15T10:30:00"
}
```

## API Endpoints

### 1. Artifact Management

#### 1.1 Create Artifact
**POST** `/artifacts`

**Access**: SYSTEM_ADMINISTRATOR, HERITAGE_MANAGER

**Request Body**:
```json
{
  "name": {
    "en": "Ancient Ceramic Vase",
    "rw": "Inkindi ya Kera ya Kera",
    "fr": "Vase Céramique Ancien"
  },
  "description": {
    "en": "A beautifully crafted ceramic vase",
    "rw": "Inkindi ya kera y'ubuhanzi bwiza",
    "fr": "Un vase céramique magnifiquement fabriqué"
  },
  "category": "Ceramics",
  "period": "15th Century",
  "physicalCharacteristics": "Height: 45cm, Diameter: 25cm",
  "condition": "Good",
  "acquisitionMethod": "Donation",
  "acquisitionDate": "2023-01-15",
  "location": "National Museum of Rwanda",
  "heritageSiteId": 1,
  "isPublic": true
}
```

**Response**: `201 Created`
```json
{
  "id": 1,
  "name": {
    "en": "Ancient Ceramic Vase",
    "rw": "Inkindi ya Kera ya Kera",
    "fr": "Vase Céramique Ancien"
  },
  "description": {
    "en": "A beautifully crafted ceramic vase",
    "rw": "Inkindi ya kera y'ubuhanzi bwiza",
    "fr": "Un vase céramique magnifiquement fabriqué"
  },
  "category": "Ceramics",
  "period": "15th Century",
  "physicalCharacteristics": "Height: 45cm, Diameter: 25cm",
  "condition": "Good",
  "acquisitionMethod": "Donation",
  "acquisitionDate": "2023-01-15",
  "location": "National Museum of Rwanda",
  "heritageSiteId": 1,
  "isPublic": true,
  "createdBy": "heritage_manager",
  "createdDate": "2023-01-15T10:30:00"
}
```

#### 1.2 Get Artifact by ID
**GET** `/artifacts/{id}`

**Access**: Public (if isPublic=true), COMMUNITY_MEMBER+

**Response**: `200 OK`
```json
{
  "id": 1,
  "name": {
    "en": "Ancient Ceramic Vase",
    "rw": "Inkindi ya Kera ya Kera",
    "fr": "Vase Céramique Ancien"
  },
  "description": {
    "en": "A beautifully crafted ceramic vase",
    "rw": "Inkindi ya kera y'ubuhanzi bwiza",
    "fr": "Un vase céramique magnifiquement fabriqué"
  },
  "category": "Ceramics",
  "period": "15th Century",
  "physicalCharacteristics": "Height: 45cm, Diameter: 25cm",
  "condition": "Good",
  "acquisitionMethod": "Donation",
  "acquisitionDate": "2023-01-15",
  "location": "National Museum of Rwanda",
  "heritageSiteId": 1,
  "mediaIds": [1, 2, 3],
  "authenticationIds": [1],
  "provenanceRecordIds": [1],
  "isPublic": true,
  "createdBy": "heritage_manager",
  "createdDate": "2023-01-15T10:30:00",
  "updatedBy": "heritage_manager",
  "updatedDate": "2023-01-15T10:30:00"
}
```

#### 1.3 List All Artifacts
**GET** `/artifacts`

**Access**: Public (public artifacts only), COMMUNITY_MEMBER+

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": {
      "en": "Ancient Ceramic Vase",
      "rw": "Inkindi ya Kera ya Kera",
      "fr": "Vase Céramique Ancien"
    },
    "category": "Ceramics",
    "period": "15th Century",
    "condition": "Good",
    "location": "National Museum of Rwanda",
    "isPublic": true
  },
  {
    "id": 2,
    "name": {
      "en": "Traditional Drum",
      "rw": "Ingoma",
      "fr": "Tambour Traditionnel"
    },
    "category": "Musical Instruments",
    "period": "19th Century",
    "condition": "Excellent",
    "location": "Cultural Center",
    "isPublic": true
  }
]
```

#### 1.4 Update Artifact
**PUT** `/artifacts/{id}`

**Access**: SYSTEM_ADMINISTRATOR, HERITAGE_MANAGER

**Request Body**: Same as Create Artifact

**Response**: `200 OK` (Updated artifact)

#### 1.5 Delete Artifact
**DELETE** `/artifacts/{id}`

**Access**: SYSTEM_ADMINISTRATOR, HERITAGE_MANAGER

**Response**: `204 No Content`

### 2. Advanced Search and Filtering

#### 2.1 Advanced Search
**GET** `/artifacts/search`

**Access**: Public (public artifacts only), COMMUNITY_MEMBER+

**Query Parameters**:
- `searchTerm` (string, optional): Search by artifact name
- `location` (string, optional): Search by location
- `category` (string, optional): Filter by category
- `period` (string, optional): Filter by period
- `condition` (string, optional): Filter by condition
- `siteId` (long, optional): Filter by heritage site
- `acquisitionMethod` (string, optional): Filter by acquisition method
- `authenticationStatus` (string, optional): Filter by authentication status
- `isPublic` (boolean, optional): Filter by public status

**Example**:
```
GET /artifacts/search?category=Ceramics&period=15th Century&isPublic=true
```

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": {
      "en": "Ancient Ceramic Vase",
      "rw": "Inkindi ya Kera ya Kera",
      "fr": "Vase Céramique Ancien"
    },
    "category": "Ceramics",
    "period": "15th Century",
    "condition": "Good",
    "location": "National Museum of Rwanda",
    "isPublic": true
  }
]
```

#### 2.2 Search by Name
**GET** `/artifacts/search/name?searchTerm={term}`

**Access**: Public (public artifacts only), COMMUNITY_MEMBER+

**Response**: `200 OK` (List of matching artifacts)

#### 2.3 Search by Location
**GET** `/artifacts/search/location?location={location}`

**Access**: Public (public artifacts only), COMMUNITY_MEMBER+

**Response**: `200 OK` (List of matching artifacts)

#### 2.4 Filter by Category
**GET** `/artifacts/filter/category/{category}`

**Access**: Public (public artifacts only), COMMUNITY_MEMBER+

**Response**: `200 OK` (List of artifacts in category)

#### 2.5 Filter by Period
**GET** `/artifacts/filter/period/{period}`

**Access**: Public (public artifacts only), COMMUNITY_MEMBER+

**Response**: `200 OK` (List of artifacts from period)

#### 2.6 Filter by Condition
**GET** `/artifacts/filter/condition/{condition}`

**Access**: Public (public artifacts only), COMMUNITY_MEMBER+

**Response**: `200 OK` (List of artifacts with condition)

#### 2.7 Filter by Heritage Site
**GET** `/artifacts/filter/site/{siteId}`

**Access**: Public (public artifacts only), COMMUNITY_MEMBER+

**Response**: `200 OK` (List of artifacts from site)

#### 2.8 Filter by Acquisition Method
**GET** `/artifacts/filter/acquisition-method/{method}`

**Access**: Public (public artifacts only), COMMUNITY_MEMBER+

**Response**: `200 OK` (List of artifacts by acquisition method)

#### 2.9 Filter by Authentication Status
**GET** `/artifacts/filter/authentication-status/{status}`

**Access**: Public (public artifacts only), COMMUNITY_MEMBER+

**Response**: `200 OK` (List of artifacts by authentication status)

### 3. Statistics

#### 3.1 Overall Statistics
**GET** `/artifacts/statistics`

**Access**: Public (public artifacts only), COMMUNITY_MEMBER+

**Response**: `200 OK`
```json
{
  "totalArtifacts": 150,
  "publicArtifacts": 120,
  "privateArtifacts": 30
}
```

#### 3.2 Statistics by Category
**GET** `/artifacts/statistics/category`

**Access**: Public (public artifacts only), COMMUNITY_MEMBER+

**Response**: `200 OK`
```json
[
  {
    "category": "Ceramics",
    "count": 45
  },
  {
    "category": "Musical Instruments",
    "count": 30
  },
  {
    "category": "Textiles",
    "count": 25
  }
]
```

#### 3.3 Statistics by Period
**GET** `/artifacts/statistics/period`

**Access**: Public (public artifacts only), COMMUNITY_MEMBER+

**Response**: `200 OK`
```json
[
  {
    "period": "15th Century",
    "count": 20
  },
  {
    "period": "19th Century",
    "count": 35
  },
  {
    "period": "20th Century",
    "count": 45
  }
]
```

#### 3.4 Statistics by Condition
**GET** `/artifacts/statistics/condition`

**Access**: Public (public artifacts only), COMMUNITY_MEMBER+

**Response**: `200 OK`
```json
[
  {
    "condition": "Excellent",
    "count": 60
  },
  {
    "condition": "Good",
    "count": 70
  },
  {
    "condition": "Fair",
    "count": 20
  }
]
```

#### 3.5 Statistics by Acquisition Method
**GET** `/artifacts/statistics/acquisition-method`

**Access**: Public (public artifacts only), COMMUNITY_MEMBER+

**Response**: `200 OK`
```json
[
  {
    "acquisitionMethod": "Donation",
    "count": 80
  },
  {
    "acquisitionMethod": "Purchase",
    "count": 40
  },
  {
    "acquisitionMethod": "Excavation",
    "count": 30
  }
]
``` 