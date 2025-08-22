# Meng CMS API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
Most endpoints require authentication via JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Health Check
#### GET /
Check if the API is running.

**Response:**
```json
{
  "message": "Meng CMS API is running!"
}
```

---

## Authentication Endpoints (`/api/auth`)

### Login
#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "username": "string", // username or email
  "password": "string"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string",
    "name": "string",
    "summary": "string",
    "socials": ["string"],
    "profile_image_path": "string",
    "created_at": "date",
    "updated_at": "date"
  },
  "token": "string"
}
```

**Error Responses:**
- `400`: Missing username or password
- `401`: Invalid credentials
- `500`: Server error

### Get Profile
#### GET /api/auth/profile
Get current user's profile information. Requires authentication.

**Response (200):**
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "name": "string",
  "summary": "string",
  "socials": ["string"],
  "profile_image_path": "string",
  "created_at": "date",
  "updated_at": "date"
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: User not found
- `500`: Server error

### Update Profile
#### PUT /api/auth/profile
Update user profile information. Requires authentication.

**Request Body:**
```json
{
  "email": "string",     // optional
  "name": "string",      // optional
  "summary": "string",   // optional
  "socials": ["string"]  // optional array of strings
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string",
    "name": "string",
    "summary": "string",
    "socials": ["string"],
    "profile_image_path": "string",
    "created_at": "date",
    "updated_at": "date"
  }
}
```

**Error Responses:**
- `400`: Invalid email format or invalid socials format
- `401`: Unauthorized
- `409`: Email already in use
- `500`: Server error

### Change Password
#### PUT /api/auth/password
Change user password. Requires authentication.

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"  // minimum 6 characters
}
```

**Response (200):**
```json
{
  "message": "Password updated successfully"
}
```

**Error Responses:**
- `400`: Missing passwords or new password too short
- `401`: Current password incorrect or unauthorized
- `404`: User not found
- `500`: Server error

### Upload Profile Image
#### POST /api/auth/profile/image
Upload a new profile image. Requires authentication.

**Request:** Multipart form data
- `image`: Image file (max 5MB, images only)

**Response (200):**
```json
{
  "message": "Profile image uploaded successfully",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string",
    "name": "string",
    "summary": "string",
    "socials": ["string"],
    "profile_image_path": "string",
    "created_at": "date",
    "updated_at": "date"
  },
  "imageUrl": "string"
}
```

**Error Responses:**
- `400`: No image file provided or invalid file type
- `401`: Unauthorized
- `404`: User not found
- `500`: Server error

---

## Categories Endpoints (`/api/categories`)

### Get Categories
#### GET /api/categories
Get all categories for the authenticated user.

**Response (200):**
```json
[
  {
    "id": "number",
    "name": "string",
    "user_id": "number",
    "created_at": "date",
    "updated_at": "date"
  }
]
```

**Error Responses:**
- `401`: Unauthorized
- `500`: Server error

### Create Category
#### POST /api/categories
Create a new category. Requires authentication.

**Request Body:**
```json
{
  "name": "string"
}
```

**Response (201):**
```json
{
  "id": "number",
  "name": "string",
  "user_id": "number",
  "created_at": "date",
  "updated_at": "date"
}
```

**Error Responses:**
- `401`: Unauthorized
- `500`: Server error

### Update Category
#### PUT /api/categories/:id
Update an existing category. Requires authentication.

**Request Body:**
```json
{
  "name": "string"
}
```

**Response (200):**
```json
{
  "id": "number",
  "name": "string",
  "user_id": "number",
  "created_at": "date",
  "updated_at": "date"
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Category not found or unauthorized
- `500`: Server error

### Delete Category
#### DELETE /api/categories/:id
Delete a category. Requires authentication.

**Response (204):** No content

**Error Responses:**
- `401`: Unauthorized
- `404`: Category not found or unauthorized
- `500`: Server error

---

## Artworks Endpoints (`/api/artworks`)

### Get Artworks
#### GET /api/artworks
Get paginated list of artworks for the authenticated user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 25)
- `search` (optional): Search in title and description
- `categoryIds` (optional): JSON array of category IDs to filter by

**Response (200):**
```json
{
  "data": [
    {
      "id": "number",
      "image_path": "string",
      "title": "string",
      "description": "string",
      "user_id": "number",
      "created_at": "date",
      "updated_at": "date",
      "artwork_categories": [
        {
          "category": {
            "id": "number",
            "name": "string",
            "user_id": "number",
            "created_at": "date",
            "updated_at": "date"
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number",
    "hasNextPage": "boolean",
    "hasPrevPage": "boolean"
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `500`: Server error

### Get Single Artwork
#### GET /api/artworks/:id
Get a specific artwork by ID. Requires authentication.

**Response (200):**
```json
{
  "id": "number",
  "image_path": "string",
  "title": "string",
  "description": "string",
  "user_id": "number",
  "created_at": "date",
  "updated_at": "date",
  "artwork_categories": [
    {
      "category": {
        "id": "number",
        "name": "string",
        "user_id": "number",
        "created_at": "date",
        "updated_at": "date"
      }
    }
  ]
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Artwork not found
- `500`: Server error

### Create Artwork
#### POST /api/artworks
Create a new artwork. Requires authentication.

**Request:** Multipart form data
- `image`: Image file (required)
- `title`: String (optional)
- `description`: String (optional)
- `categoryIds`: JSON array of category IDs (optional)

**Response (201):**
```json
{
  "id": "number",
  "image_path": "string",
  "title": "string",
  "description": "string",
  "user_id": "number",
  "created_at": "date",
  "updated_at": "date",
  "artwork_categories": [
    {
      "category": {
        "id": "number",
        "name": "string",
        "user_id": "number",
        "created_at": "date",
        "updated_at": "date"
      }
    }
  ]
}
```

**Error Responses:**
- `400`: No image file provided
- `401`: Unauthorized
- `500`: Server error

### Update Artwork
#### PUT /api/artworks/:id
Update an existing artwork. Requires authentication.

**Request:** Multipart form data
- `image`: Image file (optional)
- `title`: String (optional)
- `description`: String (optional)
- `categoryIds`: JSON array of category IDs (optional)

**Response (200):**
```json
{
  "id": "number",
  "image_path": "string",
  "title": "string",
  "description": "string",
  "user_id": "number",
  "created_at": "date",
  "updated_at": "date",
  "artwork_categories": [
    {
      "category": {
        "id": "number",
        "name": "string",
        "user_id": "number",
        "created_at": "date",
        "updated_at": "date"
      }
    }
  ]
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Artwork not found or unauthorized
- `500`: Server error

### Delete Artwork
#### DELETE /api/artworks/:id
Delete an artwork. Requires authentication.

**Response (204):** No content

**Error Responses:**
- `401`: Unauthorized
- `404`: Artwork not found or unauthorized
- `500`: Server error

---

## Projects Endpoints (`/api/projects`)

### Get Projects
#### GET /api/projects
Get paginated list of projects for the authenticated user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 25)
- `search` (optional): Search in title and description
- `categoryIds` (optional): JSON array of category IDs to filter by

**Response (200):**
```json
{
  "data": [
    {
      "id": "number",
      "batch_image_path": ["string"],
      "title": "string",
      "description": "string",
      "user_id": "number",
      "created_at": "date",
      "updated_at": "date",
      "project_categories": [
        {
          "category": {
            "id": "number",
            "name": "string",
            "user_id": "number",
            "created_at": "date",
            "updated_at": "date"
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number",
    "hasNextPage": "boolean",
    "hasPrevPage": "boolean"
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `500`: Server error

### Get Single Project
#### GET /api/projects/:id
Get a specific project by ID. Requires authentication.

**Response (200):**
```json
{
  "id": "number",
  "batch_image_path": ["string"],
  "title": "string",
  "description": "string",
  "user_id": "number",
  "created_at": "date",
  "updated_at": "date",
  "project_categories": [
    {
      "category": {
        "id": "number",
        "name": "string",
        "user_id": "number",
        "created_at": "date",
        "updated_at": "date"
      }
    }
  ]
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Project not found
- `500`: Server error

### Create Project
#### POST /api/projects
Create a new project. Requires authentication.

**Request:** Multipart form data
- `images`: Array of image files (required, max 10 files)
- `title`: String (required)
- `description`: String (optional)
- `categoryIds`: JSON array of category IDs (optional)

**Response (201):**
```json
{
  "id": "number",
  "batch_image_path": ["string"],
  "title": "string",
  "description": "string",
  "user_id": "number",
  "created_at": "date",
  "updated_at": "date",
  "project_categories": [
    {
      "category": {
        "id": "number",
        "name": "string",
        "user_id": "number",
        "created_at": "date",
        "updated_at": "date"
      }
    }
  ]
}
```

**Error Responses:**
- `400`: No images provided or title missing
- `401`: Unauthorized
- `500`: Server error

### Update Project
#### PUT /api/projects/:id
Update an existing project with complex image management. Requires authentication.

**Request:** Multipart form data
- `modifiedImages`: Array of replacement image files (optional, max 10)
- `addedImages`: Array of new image files (optional, max 10)
- `title`: String (optional)
- `description`: String (optional)
- `categoryIds`: JSON array of category IDs (optional)
- `modifiedImageIndices`: Array of indices for modified images
- `removedImageIndices`: JSON array of indices to remove

**Response (200):**
```json
{
  "id": "number",
  "batch_image_path": ["string"],
  "title": "string",
  "description": "string",
  "user_id": "number",
  "created_at": "date",
  "updated_at": "date",
  "project_categories": [
    {
      "category": {
        "id": "number",
        "name": "string",
        "user_id": "number",
        "created_at": "date",
        "updated_at": "date"
      }
    }
  ]
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Project not found or unauthorized
- `500`: Server error

### Delete Project
#### DELETE /api/projects/:id
Delete a project. Requires authentication.

**Response (204):** No content

**Error Responses:**
- `401`: Unauthorized
- `404`: Project not found or unauthorized
- `500`: Server error

---

## Error Handling

All endpoints return consistent error responses in the following format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `204`: No Content (successful deletion)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `404`: Not Found
- `409`: Conflict (e.g., email already exists)
- `500`: Internal Server Error

## Data Types

- `string`: Text value
- `number`: Numeric value (integer)
- `boolean`: True or false
- `date`: ISO 8601 date string
- `array`: Array of values

## File Upload Requirements

- **Profile Images**: Max 5MB, image files only
- **Artwork Images**: Single image file required
- **Project Images**: 1-10 image files, batch upload supported
- Supported formats: All standard image formats (JPEG, PNG, GIF, etc.)
- Files are uploaded to ImageKit CDN for optimized delivery

## Security Notes

- All authenticated endpoints require a valid JWT token
- Users can only access and modify their own data
- File uploads are validated for type and size
- Passwords are hashed using bcrypt
- Input validation is performed on all endpoints