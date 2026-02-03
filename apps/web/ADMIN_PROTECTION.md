# Admin Route Protection

This document explains the admin route protection implementation in the Next.js application.

## Overview

All routes under `/admin` are protected and require:
1. User must be authenticated (logged in)
2. User must have `ADMIN` role

## Protection Layers

### 1. Middleware Layer (First Line of Defense)

**File:** `apps/web/middleware.ts`

- Runs on Edge Runtime for maximum performance
- Checks JWT token before any page loads
- Redirects unauthenticated users to `/login`
- Redirects non-admin users to `/unauthorized`
- Uses `getToken()` from NextAuth for token verification

```typescript
// Automatically protects all /admin routes
export const config = {
  matcher: ['/admin/:path*']
}
```

### 2. Layout Layer (Server-Side Verification)

**File:** `apps/web/src/app/admin/layout.tsx`

- Server Component that wraps all admin pages
- Double-checks authentication and role on the server
- Uses `getServerSession()` for session verification
- Provides fallback protection if middleware is bypassed

### 3. Server Action Layer (API Protection)

**File:** `apps/web/src/lib/auth-guard.ts`

Utilities for protecting Server Actions:

- `verifyAdmin()` - Throws error if not admin
- `verifyAuth()` - Throws error if not authenticated  
- `getAuthUser()` - Returns user or null (safe)

**Example usage in Server Actions:**

```typescript
'use server'

import { verifyAdmin } from '@/lib/auth-guard'

export async function deleteProduct(id: string) {
  // This will throw if user is not an admin
  await verifyAdmin()
  
  // Admin-only logic here
  await prisma.product.delete({ where: { id } })
}
```

## Pages

### `/admin`
- Admin dashboard
- Protected by layout
- Shows user info

### `/unauthorized`
- Landing page for non-admin users
- Shows appropriate message
- Links to login or home

### `/login`
- NextAuth sign-in page
- Supports callback URL for redirect after login

## Flow Diagrams

### Authenticated Admin User
```
User → /admin → Middleware (✓) → Layout (✓) → Admin Page (✓)
```

### Unauthenticated User
```
User → /admin → Middleware (✗) → Redirect to /login?callbackUrl=/admin
```

### Authenticated Non-Admin User
```
User → /admin → Middleware (✗) → Redirect to /unauthorized
```

## Security Features

1. **No Client-Side Role Checks** - All verification happens server-side
2. **Double Verification** - Both middleware and layout check authorization
3. **JWT-Based** - Uses NextAuth JWT tokens for fast verification
4. **Type-Safe** - TypeScript ensures correct role types
5. **Callback URLs** - Preserves intended destination after login

## Environment Variables Required

```env
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# OAuth providers (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email provider (optional)
EMAIL_SERVER_HOST=
EMAIL_SERVER_PORT=
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=
EMAIL_FROM=
```

## Testing

### Test as Admin
1. Ensure you have a user with `role: ADMIN` in the database
2. Sign in with that user
3. Navigate to `/admin` - should see dashboard

### Test as Regular User
1. Sign in with a user with `role: USER`
2. Navigate to `/admin` - should redirect to `/unauthorized`

### Test Unauthenticated
1. Sign out
2. Navigate to `/admin` - should redirect to `/login`

## Creating Admin Users

Run the seed script to create test users:

```bash
cd packages/prisma
npm run db:seed
```

This creates:
- `admin@mygale.cm` with ADMIN role
- `user@mygale.cm` with USER role

## Adding More Protected Routes

To protect additional routes:

1. Add to middleware matcher:
```typescript
export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',  // Add new pattern
  ]
}
```

2. Add verification in the middleware function
3. Create a layout with `verifyAdmin()` or `verifyAuth()`

## Best Practices

1. **Always use `verifyAdmin()` in Server Actions** that modify admin-only data
2. **Don't trust client-side role checks** - always verify on server
3. **Use the admin layout** for all admin pages
4. **Keep role logic centralized** in auth utilities
5. **Log security events** for audit trails (can be added to auth-guard.ts)

## Common Issues

### "Unauthorized" even though I'm admin
- Check that your user's role in database is exactly `'ADMIN'` (not 'admin')
- Verify JWT token includes role: `getToken()` in middleware
- Clear cookies and sign in again

### Middleware not running
- Ensure `middleware.ts` is in the root of `apps/web` folder
- Check the `matcher` config includes your route
- Restart the dev server

### Can't access after login
- Check that `NEXTAUTH_SECRET` is set
- Verify callback URL is preserved in login redirect
- Check session in browser DevTools

## Files Reference

- `apps/web/middleware.ts` - Edge middleware protection
- `apps/web/src/app/admin/layout.tsx` - Admin layout wrapper
- `apps/web/src/app/admin/page.tsx` - Admin dashboard
- `apps/web/src/app/admin/actions.ts` - Example protected Server Actions
- `apps/web/src/app/unauthorized/page.tsx` - Unauthorized page
- `apps/web/src/lib/auth.ts` - NextAuth configuration
- `apps/web/src/lib/auth-guard.ts` - Server-side verification utilities
- `apps/web/src/lib/session.ts` - Session helper utilities
- `apps/web/src/lib/rbac.ts` - Role-based access control helpers
