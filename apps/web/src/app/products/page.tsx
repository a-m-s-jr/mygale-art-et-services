import { PrismaClient, ProductType } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'

const prisma = new PrismaClient()

export const metadata: Metadata = {
  title: 'Our Products | Mygale Art & Services',
  description: 'Browse our collection of unique art products and creative works.',
  openGraph: {
    title: 'Our Products | Mygale Art & Services',
    description: 'Browse our collection of unique art products and creative works.',
  },
}

async function getPublishedProducts() {
  return await prisma.product.findMany({
    where: {
      published: true,
      type: ProductType.PRODUCT,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function ProductsPage() {
  const products = await getPublishedProducts()

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our Products
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our unique collection of art pieces and creative products
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold mb-2">No products available yet</h2>
            <p className="text-gray-600">
              Check back soon for new additions to our collection
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <article
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Image */}
                <div className="relative aspect-square bg-gray-100">
                  {product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="text-6xl mb-2">🎨</div>
                        <p className="text-sm">No image</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2 line-clamp-1">
                    {product.title}
                  </h2>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Price */}
                  {product.price !== null && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-2xl font-bold text-gray-900">
                        ${product.price.toFixed(2)}
                      </span>
                      <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  )}

                  {product.price === null && (
                    <button className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium">
                      Learn More
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* CTA Section */}
        {products.length > 0 && (
          <div className="mt-16 text-center">
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                Looking for something specific?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                We offer custom products tailored to your needs. Get in touch to discuss your project.
              </p>
              <Link
                href="/contact"
                className="inline-block px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium"
              >
                Contact Us
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
