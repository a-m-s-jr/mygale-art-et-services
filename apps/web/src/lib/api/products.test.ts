/**
 * Example tests for Products API endpoints
 * 
 * These are example requests you can use to test the API.
 * Copy and paste them into your terminal or API client.
 */

// Base URL
const BASE_URL = 'http://localhost:3000'

// ============================================
// PUBLIC ENDPOINTS (No Authentication Required)
// ============================================

// 1. Get all published products
const testGetPublishedProducts = async () => {
  const response = await fetch(`${BASE_URL}/api/products`)
  const data = await response.json()
  console.log('Published products:', data)
  return data
}

// 2. Get published products filtered by type
const testGetProductsByType = async () => {
  const response = await fetch(`${BASE_URL}/api/products?type=PRODUCT`)
  const data = await response.json()
  console.log('Published products (PRODUCT type):', data)
  return data
}

const testGetServicesByType = async () => {
  const response = await fetch(`${BASE_URL}/api/products?type=SERVICE`)
  const data = await response.json()
  console.log('Published services:', data)
  return data
}

// 3. Get single product by ID
const testGetProductById = async (id: string) => {
  const response = await fetch(`${BASE_URL}/api/products/${id}`)
  const data = await response.json()
  console.log('Product by ID:', data)
  return data
}

// 4. Try to get unpublished product (should fail for non-admin)
const testGetUnpublishedProduct = async (id: string) => {
  const response = await fetch(`${BASE_URL}/api/products/${id}`)
  const data = await response.json()
  console.log('Unpublished product (should be 404):', data)
  return data
}

// ============================================
// ADMIN ENDPOINTS (Authentication Required)
// ============================================

// Note: You need to be logged in as admin for these to work
// The session cookie is automatically included by the browser

// 5. Get all products (including unpublished) - ADMIN ONLY
const testGetAllProducts = async () => {
  const response = await fetch(`${BASE_URL}/api/admin/products`)
  const data = await response.json()
  console.log('All products (admin):', data)
  return data
}

// 6. Get only draft products - ADMIN ONLY
const testGetDraftProducts = async () => {
  const response = await fetch(`${BASE_URL}/api/admin/products?published=false`)
  const data = await response.json()
  console.log('Draft products:', data)
  return data
}

// 7. Create new product - ADMIN ONLY
const testCreateProduct = async () => {
  const response = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Test Product',
      description: 'This is a test product created via API',
      price: 99.99,
      type: 'PRODUCT',
      images: ['https://via.placeholder.com/400'],
      published: false,
    }),
  })
  const data = await response.json()
  console.log('Created product:', data)
  return data
}

// 8. Create new service - ADMIN ONLY
const testCreateService = async () => {
  const response = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Test Service',
      description: 'This is a test service created via API',
      type: 'SERVICE',
      published: true,
    }),
  })
  const data = await response.json()
  console.log('Created service:', data)
  return data
}

// 9. Update product - ADMIN ONLY
const testUpdateProduct = async (id: string) => {
  const response = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Updated Product Title',
      description: 'Updated description',
      price: 149.99,
      type: 'PRODUCT',
      images: ['https://via.placeholder.com/400'],
      published: true,
    }),
  })
  const data = await response.json()
  console.log('Updated product:', data)
  return data
}

// 10. Delete product - ADMIN ONLY
const testDeleteProduct = async (id: string) => {
  const response = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
  })
  const data = await response.json()
  console.log('Deleted product:', data)
  return data
}

// ============================================
// VALIDATION TESTS
// ============================================

// 11. Try to create product with invalid data
const testCreateProductValidation = async () => {
  const response = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: '', // Empty title (invalid)
      description: 'Test',
      type: 'INVALID_TYPE', // Invalid type
    }),
  })
  const data = await response.json()
  console.log('Validation errors:', data)
  return data
}

// ============================================
// AUTHENTICATION TESTS
// ============================================

// 12. Try to create without auth (should fail)
const testCreateWithoutAuth = async () => {
  // Open incognito window or sign out first
  const response = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'omit', // Don't send cookies
    body: JSON.stringify({
      title: 'Test',
      description: 'Test',
      type: 'PRODUCT',
    }),
  })
  const data = await response.json()
  console.log('Create without auth (should be 401):', data)
  return data
}

// ============================================
// CURL EXAMPLES
// ============================================

/*
# Get published products
curl http://localhost:3000/api/products

# Get published services only
curl http://localhost:3000/api/products?type=SERVICE

# Get single product
curl http://localhost:3000/api/products/cm5abc123

# Create product (requires admin auth)
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "title": "New Product",
    "description": "Product description",
    "price": 99.99,
    "type": "PRODUCT",
    "images": [],
    "published": false
  }'

# Update product (requires admin auth)
curl -X PUT http://localhost:3000/api/products/cm5abc123 \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "title": "Updated Title",
    "description": "Updated description",
    "price": 149.99,
    "type": "PRODUCT",
    "images": [],
    "published": true
  }'

# Delete product (requires admin auth)
curl -X DELETE http://localhost:3000/api/products/cm5abc123 \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Get all products including drafts (requires admin auth)
curl http://localhost:3000/api/admin/products \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
*/

// ============================================
// TEST SUITE
// ============================================

export const runAllTests = async () => {
  console.log('🧪 Running API Tests...\n')

  try {
    console.log('1️⃣ Testing public endpoints...')
    await testGetPublishedProducts()
    await testGetProductsByType()
    await testGetServicesByType()
    
    console.log('\n2️⃣ Testing admin endpoints...')
    console.log('⚠️  You must be logged in as admin for these to work')
    await testGetAllProducts()
    await testGetDraftProducts()
    
    console.log('\n3️⃣ Testing CRUD operations...')
    const created = await testCreateProduct()
    if (created.success && created.data?.id) {
      await testUpdateProduct(created.data.id)
      await testGetProductById(created.data.id)
      await testDeleteProduct(created.data.id)
    }
    
    console.log('\n4️⃣ Testing validation...')
    await testCreateProductValidation()
    
    console.log('\n✅ All tests completed!')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Export individual test functions
export {
  testGetPublishedProducts,
  testGetProductsByType,
  testGetServicesByType,
  testGetProductById,
  testGetUnpublishedProduct,
  testGetAllProducts,
  testGetDraftProducts,
  testCreateProduct,
  testCreateService,
  testUpdateProduct,
  testDeleteProduct,
  testCreateProductValidation,
  testCreateWithoutAuth,
}
