# Products API Documentation

Backend API endpoints for managing Products and Services.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Admin-only endpoints require NextAuth session authentication with `ADMIN` role.

**Headers:**
- Cookie: `next-auth.session-token` (set automatically by NextAuth)

---

## Public Endpoints

### Get Published Products

Get a list of all published products/services.

**Endpoint:** `GET /api/products`

**Auth Required:** No

**Query Parameters:**
- `type` (optional): Filter by type (`PRODUCT` or `SERVICE`)
- `limit` (optional): Number of items to return
- `offset` (optional): Number of items to skip

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cm5abc123",
      "title": "Custom Portrait",
      "description": "Hand-painted portrait",
      "price": 299.99,
      "type": "PRODUCT",
      "images": ["https://example.com/image.jpg"],
      "published": true,
      "createdAt": "2026-02-03T10:00:00.000Z",
      "updatedAt": "2026-02-03T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

**Examples:**

```bash
# Get all published products
curl http://localhost:3000/api/products

# Get only published products (type: PRODUCT)
curl http://localhost:3000/api/products?type=PRODUCT

# Get only published services
curl http://localhost:3000/api/products?type=SERVICE

# Get with pagination
curl http://localhost:3000/api/products?limit=10&offset=0
```

---

### Get Single Product

Get a single product by ID (only if published, or if admin).

**Endpoint:** `GET /api/products/[id]`

**Auth Required:** No (but admins can see unpublished)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cm5abc123",
    "title": "Custom Portrait",
    "description": "Hand-painted portrait",
    "price": 299.99,
    "type": "PRODUCT",
    "images": ["https://example.com/image.jpg"],
    "published": true,
    "createdAt": "2026-02-03T10:00:00.000Z",
    "updatedAt": "2026-02-03T10:00:00.000Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Product not found or not published
- `500` - Server error

**Example:**

```bash
curl http://localhost:3000/api/products/cm5abc123
```

---

## Admin Endpoints

### Get All Products (Admin)

Get all products including unpublished drafts.

**Endpoint:** `GET /api/admin/products`

**Auth Required:** Yes (ADMIN role)

**Query Parameters:**
- `type` (optional): Filter by type (`PRODUCT` or `SERVICE`)
- `published` (optional): Filter by publish status (`true` or `false`)
- `limit` (optional): Number of items to return
- `offset` (optional): Number of items to skip

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 5,
  "total": 12
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not admin)
- `500` - Server error

**Examples:**

```bash
# Get all products (including unpublished)
curl -X GET http://localhost:3000/api/admin/products \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Get only drafts
curl http://localhost:3000/api/admin/products?published=false

# Get only published
curl http://localhost:3000/api/admin/products?published=true
```

---

### Create Product

Create a new product or service.

**Endpoint:** `POST /api/products`

**Auth Required:** Yes (ADMIN role)

**Request Body:**
```json
{
  "title": "Custom Portrait",
  "description": "Hand-painted portrait on canvas",
  "price": 299.99,
  "type": "PRODUCT",
  "images": ["https://example.com/image.jpg"],
  "published": true
}
```

**Validation Rules:**
- `title`: Required, 1-200 characters
- `description`: Required, 1-5000 characters
- `price`: Optional, must be ≥ 0
- `type`: Required, must be "PRODUCT" or "SERVICE"
- `images`: Optional, array of valid URLs
- `published`: Optional, boolean (default: false)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cm5abc123",
    "title": "Custom Portrait",
    "description": "Hand-painted portrait on canvas",
    "price": 299.99,
    "type": "PRODUCT",
    "images": ["https://example.com/image.jpg"],
    "published": true,
    "createdAt": "2026-02-03T10:00:00.000Z",
    "updatedAt": "2026-02-03T10:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "title": ["Title is required"],
    "price": ["Price must be positive"]
  }
}
```

**Status Codes:**
- `201` - Created
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `500` - Server error

**Example:**

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "title": "Architecture Consultation",
    "description": "Professional architectural design services",
    "type": "SERVICE",
    "published": false
  }'
```

---

### Update Product

Update an existing product.

**Endpoint:** `PUT /api/products/[id]`

**Auth Required:** Yes (ADMIN role)

**Request Body:** (same as Create Product)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cm5abc123",
    "title": "Updated Title",
    ...
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Product not found
- `500` - Server error

**Example:**

```bash
curl -X PUT http://localhost:3000/api/products/cm5abc123 \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "title": "Updated Title",
    "description": "Updated description",
    "price": 399.99,
    "type": "PRODUCT",
    "images": [],
    "published": true
  }'
```

---

### Delete Product

Delete a product permanently.

**Endpoint:** `DELETE /api/products/[id]`

**Auth Required:** Yes (ADMIN role)

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Product not found
- `500` - Server error

**Example:**

```bash
curl -X DELETE http://localhost:3000/api/products/cm5abc123 \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

For validation errors:

```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "fieldName": ["Error message 1", "Error message 2"]
  }
}
```

---

## Security

### Authentication

- Uses NextAuth session-based authentication
- Session token stored in HTTP-only cookie
- Automatic CSRF protection

### Authorization

**Public Access:**
- `GET /api/products` - Only published items
- `GET /api/products/[id]` - Only published items

**Admin Access Required:**
- `POST /api/products` - Create
- `PUT /api/products/[id]` - Update
- `DELETE /api/products/[id]` - Delete
- `GET /api/admin/products` - List all (including drafts)

### Data Protection

- Unpublished products are never exposed to non-admin users
- All admin endpoints verify role = ADMIN
- Input validation with Zod schema
- Prisma ORM prevents SQL injection

---

## Testing

### Using cURL

```bash
# 1. Get all published products (no auth needed)
curl http://localhost:3000/api/products

# 2. Try to create without auth (should fail)
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "description": "Test", "type": "PRODUCT"}'

# 3. Sign in as admin at http://localhost:3000/login

# 4. Get session token from browser cookies

# 5. Create product with admin auth
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "title": "Test Product",
    "description": "Test Description",
    "type": "PRODUCT",
    "published": true
  }'
```

### Using Postman

1. **Base URL:** `http://localhost:3000`
2. **Auth:** Inherit from parent (set at collection level)
3. **Collection Variables:**
   - `baseUrl`: `http://localhost:3000`
   - `sessionToken`: (copy from browser after login)

### Using Next.js fetch

```typescript
// Public: Get published products
const response = await fetch('/api/products')
const data = await response.json()

// Admin: Create product (client component)
const response = await fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'New Product',
    description: 'Description',
    type: 'PRODUCT',
    published: false,
  }),
})
```

---

## Database Schema

```prisma
model Product {
  id          String      @id @default(uuid())
  title       String
  description String
  price       Float?
  images      String[]
  type        ProductType
  published   Boolean     @default(false)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@map("products")
}

enum ProductType {
  PRODUCT
  SERVICE
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding:

- NextAuth built-in rate limiting for auth endpoints
- Custom middleware for API endpoints
- Redis-based rate limiting for production

---

## Files

**API Routes:**
- `apps/web/src/app/api/products/route.ts` - GET (list), POST (create)
- `apps/web/src/app/api/products/[id]/route.ts` - GET, PUT, DELETE
- `apps/web/src/app/api/admin/products/route.ts` - GET (admin list)

**Validation:**
- `apps/web/src/lib/schemas/product.ts` - Zod schema

**Database:**
- `packages/prisma/prisma/schema.prisma` - Prisma schema
