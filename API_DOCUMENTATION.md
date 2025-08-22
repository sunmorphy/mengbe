# Portfolio Backend API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication via JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

**Note:** Read operations (GET requests) for artworks, categories, and projects do NOT require authentication.

---

## Authentication Endpoints (`/auth`)

### Login
#### POST /auth/login
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
    "id": 1,
    "username": "string",
    "email": "string",
    "name": "string",
    "summary": "string",
    "socials": ["string"],
    "profile_image_path": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  },
  "token": "jwt_token_string"
}
```

### Get User Profile by ID (NO AUTH REQUIRED)
#### GET /auth/profile/:userId
Get public profile information for a specific user.

**Response (200):**
```json
{
  "id": 1,
  "username": "string",
  "name": "string",        // Note: email is excluded for privacy
  "summary": "string",
  "socials": ["string"],
  "profile_image_path": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Get Current User Profile (NO AUTH REQUIRED)
#### GET /auth/profile
Get current authenticated user's profile.

**Response (200):**
```json
{
  "id": 1,
  "username": "string",
  "email": "string",       // Email included for own profile
  "name": "string",
  "summary": "string",
  "socials": ["string"],
  "profile_image_path": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Update User Profile
#### PUT /auth/profile
**Requires Authentication**

**Request Body:**
```json
{
  "email": "string",     // Optional
  "name": "string",      // Optional
  "summary": "string",   // Optional
  "socials": ["string"] // Optional array
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "name": "string",
    "summary": "string",
    "socials": ["string"],
    "profile_image_path": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### Change Password
#### PUT /auth/password
**Requires Authentication**

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"  // Minimum 6 characters
}
```

**Response (200):**
```json
{
  "message": "Password updated successfully"
}
```

### Upload Profile Image
#### POST /auth/profile/image
**Requires Authentication**
Content-Type: multipart/form-data

**Form Data:**
- `image`: file (Image file, max 5MB)

**Response (200):**
```json
{
  "message": "Profile image uploaded successfully",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "name": "string",
    "summary": "string",
    "socials": ["string"],
    "profile_image_path": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  },
  "imageUrl": "string"
}
```

---

## Artwork Endpoints (`/artworks`)

### Get All Artworks (NO AUTH REQUIRED)
#### GET /artworks
Get paginated list of all artworks.

**Query Parameters:**
- `page`: number (optional, default: 1)
- `limit`: number (optional, default: 25)
- `search`: string (optional, searches title and description)
- `categoryIds`: JSON array string (optional, filters by category IDs)
- `type`: string (optional, filters by type: "portfolio" or "scratch")

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "image_path": "string",
      "title": "string",
      "description": "string",
      "type": "portfolio",
      "user_id": 1,
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "artwork_categories": [
        {
          "category": {
            "id": 1,
            "name": "string",
            "user_id": 1,
            "created_at": "timestamp",
            "updated_at": "timestamp"
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 100,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Get Artworks by User ID (NO AUTH REQUIRED)
#### GET /artworks/user/:userId
Get paginated list of artworks for a specific user.

**Query Parameters:** Same as Get All Artworks

**Response (200):** Same format as Get All Artworks

### Get Single Artwork (NO AUTH REQUIRED)
#### GET /artworks/:id

**Response (200):**
```json
{
  "id": 1,
  "image_path": "string",
  "title": "string",
  "description": "string",
  "type": "portfolio",
  "user_id": 1,
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "artwork_categories": [
    {
      "category": {
        "id": 1,
        "name": "string",
        "user_id": 1,
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    }
  ]
}
```

### Create Artwork
#### POST /artworks
**Requires Authentication**
Content-Type: multipart/form-data

**Form Data:**
- `image`: file (Required image file)
- `title`: string (Optional)
- `description`: string (Optional)
- `type`: string (Optional, "portfolio" or "scratch", default: "portfolio")
- `categoryIds`: string (Optional JSON array string, e.g., "[1,2,3]")

**Response (201):** Same format as Get Single Artwork

### Update Artwork
#### PUT /artworks/:id
**Requires Authentication**
Content-Type: multipart/form-data

**Form Data:**
- `image`: file (Optional new image file)
- `title`: string (Optional)
- `description`: string (Optional)
- `type`: string (Optional, "portfolio" or "scratch")
- `categoryIds`: string (Optional JSON array string)

**Response (200):** Same format as Get Single Artwork

### Delete Artwork
#### DELETE /artworks/:id
**Requires Authentication**

**Response (204):** No content

---

## Project Endpoints (`/projects`)

### Get All Projects (NO AUTH REQUIRED)
#### GET /projects
Get paginated list of all projects.

**Query Parameters:** Same as artworks

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "batch_image_path": ["string"],  // Array of image URLs
      "title": "string",
      "description": "string",
      "user_id": 1,
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "project_categories": [
        {
          "category": {
            "id": 1,
            "name": "string",
            "user_id": 1,
            "created_at": "timestamp",
            "updated_at": "timestamp"
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 100,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Get Projects by User ID (NO AUTH REQUIRED)
#### GET /projects/user/:userId
Get paginated list of projects for a specific user.

**Query Parameters:** Same as Get All Projects

**Response (200):** Same format as Get All Projects

### Get Single Project (NO AUTH REQUIRED)
#### GET /projects/:id

**Response (200):**
```json
{
  "id": 1,
  "batch_image_path": ["string"],
  "title": "string",
  "description": "string",
  "user_id": 1,
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "project_categories": [...]
}
```

### Create Project
#### POST /projects
**Requires Authentication**
Content-Type: multipart/form-data

**Form Data:**
- `images`: file[] (Required, multiple image files, max 10)
- `title`: string (Required)
- `description`: string (Optional)
- `categoryIds`: string (Optional JSON array string)

**Response (201):** Same format as Get Single Project

### Update Project
#### PUT /projects/:id
**Requires Authentication**
Content-Type: multipart/form-data

**Form Data:**
- `modifiedImages`: file[] (Optional, replacement images)
- `addedImages`: file[] (Optional, new images to add)
- `title`: string (Optional)
- `description`: string (Optional)
- `categoryIds`: string (Optional JSON array string)
- `modifiedImageIndices`: string[] (Indices of images being modified)
- `removedImageIndices`: string (JSON array string of indices to remove)

**Response (200):** Same format as Get Single Project

### Delete Project
#### DELETE /projects/:id
**Requires Authentication**

**Response (204):** No content

---

## Category Endpoints (`/categories`)

### Get All Categories (NO AUTH REQUIRED)
#### GET /categories

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "string",
    "user_id": 1,
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

### Create Category
#### POST /categories
**Requires Authentication**

**Request Body:**
```json
{
  "name": "string"  // Required
}
```

**Response (201):**
```json
{
  "id": 1,
  "name": "string",
  "user_id": 1,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Update Category
#### PUT /categories/:id
**Requires Authentication**

**Request Body:**
```json
{
  "name": "string"  // Required
}
```

**Response (200):** Same format as Create Category

### Delete Category
#### DELETE /categories/:id
**Requires Authentication**

**Response (204):** No content

---

## Error Responses

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "Error message describing what went wrong"
}
```

#### 401 Unauthorized
```json
{
  "error": "Invalid credentials" | "Token required" | "Invalid token"
}
```

#### 404 Not Found
```json
{
  "error": "Resource not found" | "User not found" | "Artwork not found"
}
```

#### 409 Conflict
```json
{
  "error": "Email already in use" | "Resource already exists"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to perform operation",
  "message": "Additional error details (in development mode)"
}
```

---

## Important Notes

1. All timestamps are in ISO 8601 format
2. File uploads use multipart/form-data content type
3. JSON requests use application/json content type
4. Bearer tokens should be included in Authorization header for protected routes
5. **Read operations (GET) for artworks, categories, and projects do NOT require authentication**
6. **New user-specific endpoints allow fetching content by user ID without authentication**
7. Image files are uploaded to ImageKit CDN
8. Profile images have a 5MB size limit
9. Project uploads support up to 10 images at once
10. Category IDs in query parameters should be JSON-encoded arrays as strings
11. User profile by ID endpoint excludes email for privacy reasons