# Featured Products/Services - Promotional Banner Setup

## Overview
A dynamic, admin-managed promotional banner system has been implemented that displays featured products and services in a Yahoo-style carousel at the top of the site.

## What's Been Added

### 1. Database Schema Changes
- Added `featured` boolean field to the `Product` model in Prisma schema
- Migration applied: `20260203120000_add_featured_field`

### 2. Admin Features
- ⭐ Featured checkbox in product/service creation form
- ⭐ Featured checkbox in product/service edit form
- Only published AND featured items appear in the banner
- Visual indicator with amber/yellow styling to highlight featured items

### 3. Frontend Components
- **PromoBanner.tsx** - Client-side carousel with:
  - Auto-rotation every 5 seconds
  - Manual navigation (prev/next buttons)
  - Dot indicators
  - Pause on hover
  - Responsive design (mobile, tablet, desktop)
  - Smooth transitions
  - Image optimization with Next.js Image

- **PromoBannerWrapper.tsx** - Server component that:
  - Fetches featured items from database
  - Only shows published AND featured items
  - Limits to 10 items max
  - Provides data to client carousel

### 4. Integration
- Banner integrated into root layout (`apps/web/src/app/layout.tsx`)
- Positioned between Navbar and main content
- Automatically hidden if no featured items exist

## Setup Instructions

### Step 1: Install Dependencies (if needed)
```bash
cd packages/prisma
pnpm install
```

### Step 2: Regenerate Prisma Client
The Prisma client needs to recognize the new `featured` field:

```bash
cd packages/prisma
npx prisma generate
```

Or from the root:
```bash
pnpm --filter @repo/prisma prisma:generate
```

### Step 3: Verify Database
The migration has already been applied. To verify:

```bash
docker exec mygale_postgres psql -U postgres -d mygale_db -c "\d products"
```

You should see the `featured` column listed.

### Step 4: Feature Your First Item
1. Navigate to `/admin/products` (requires ADMIN role)
2. Click "Edit" on an existing product or create a new one
3. Check both ✅ "Publish immediately" AND ⭐ "Feature in promotional banner"
4. Save the item
5. Visit the homepage to see the banner appear!

## How It Works

### Admin Workflow
1. Admin creates/edits a product or service
2. Admin checks "Publish immediately" (makes it visible to public)
3. Admin checks "Feature in promotional banner" (adds to carousel)
4. Item appears in homepage banner automatically

### Frontend Behavior
- Server component fetches: `published = true AND featured = true`
- Items ordered by creation date (newest first)
- Maximum 10 items in carousel
- If no featured items exist, banner doesn't render
- Banner auto-rotates unless user hovers (pauses)
- Fully responsive across all screen sizes

### SEO Benefits
- Server-side rendering (SSR) for featured items
- Optimized images with Next.js Image component
- Semantic HTML structure
- No JavaScript required for initial render

## Files Modified/Created

### Schema & Migrations
- `packages/prisma/prisma/schema.prisma` - Added `featured` field
- `packages/prisma/prisma/migrations/20260203120000_add_featured_field/migration.sql`

### Components
- `apps/web/src/components/PromoBanner.tsx` (new)
- `apps/web/src/components/PromoBannerWrapper.tsx` (new)

### Admin Forms
- `apps/web/src/app/admin/products/new/page.tsx` - Added featured checkbox
- `apps/web/src/app/admin/products/edit/[id]/page.tsx` - Added featured checkbox

### Validation & Actions
- `apps/web/src/lib/schemas/product.ts` - Added featured to Zod schema
- `apps/web/src/app/admin/actions.ts` - Handle featured in create/update

### Layout
- `apps/web/src/app/layout.tsx` - Integrated PromoBannerWrapper

## Customization

### Change Auto-Rotate Interval
Edit `apps/web/src/components/PromoBanner.tsx`:
```typescript
const interval = setInterval(nextSlide, 5000) // Change 5000 to desired ms
```

### Change Maximum Featured Items
Edit `apps/web/src/components/PromoBannerWrapper.tsx`:
```typescript
take: 10, // Change to desired limit
```

### Styling
The banner uses Tailwind CSS classes. Main styling in:
- Background: `bg-linear-to-r from-blue-600 to-purple-600`
- Height: `h-64 md:h-80 lg:h-96`
- Featured badge: `bg-amber-400`

### Link Behavior
Currently links to `/products` or `/services` based on type.
To link to individual product pages, update line in `PromoBanner.tsx`:
```typescript
const linkHref = `/products/${currentItem.id}` // Individual pages
```

## Troubleshooting

### Banner doesn't appear
1. Ensure at least one item has both `published = true` AND `featured = true`
2. Clear browser cache and refresh
3. Check browser console for errors

### TypeScript errors about 'featured'
Run: `npx prisma generate` in the `packages/prisma` directory

### Images not loading
1. Verify image URLs are valid
2. Check Next.js image domains configuration in `next.config.js`
3. For Cloudinary images, ensure proper configuration

## Performance

- **Server-Side**: Single database query on page load
- **Client-Side**: Lightweight React component (~3KB gzipped)
- **Images**: Optimized with Next.js Image (lazy loading, responsive sizes)
- **Animations**: CSS transitions (GPU-accelerated)

## Security

- ✅ Only ADMIN users can mark items as featured
- ✅ Server-side validation ensures featured flag is boolean
- ✅ Featured items must also be published
- ✅ XSS protection via React's built-in escaping

## Future Enhancements

Consider adding:
- [ ] Individual product detail pages with more info
- [ ] Click tracking/analytics for featured items
- [ ] A/B testing different featured items
- [ ] Scheduled featuring (start/end dates)
- [ ] Priority/ordering for featured items
- [ ] Banner click-through rate reporting
