import { PrismaClient, ProductType } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'

const prisma = new PrismaClient()

export const metadata: Metadata = {
  title: 'Our Services | Mygale Art & Services',
  description: 'Professional art and creative services tailored to your needs.',
  openGraph: {
    title: 'Our Services | Mygale Art & Services',
    description: 'Professional art and creative services tailored to your needs.',
  },
}

async function getPublishedServices() {
  return await prisma.product.findMany({
    where: {
      published: true,
      type: ProductType.SERVICE,
    },
    orderBy: { createdAt: 'desc' },
  })
}

// Static service categories (kept for navigation to dedicated service pages)
const staticServices = [
  { slug: 'architecture', title: 'Architecture', img: '/architecture.jpg' },
  { slug: 'stylisme', title: 'Stylisme', img: '/style.jpg' },
  { slug: 'printing', title: 'Imprimerie', img: '/print.jpg' },
  { slug: 'vitraux', title: 'Vitraux', img: '/vitreaux.jpg' },
  { slug: 'construction', title: 'Construction', img: '/construction.jpg' },
  { slug: 'web-development', title: 'Web Development', img: '/web-dev.jpg' },
]

export default async function ServicesIndexPage() {
  const dynamicServices = await getPublishedServices()

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Nos Services
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional art and creative services crafted with expertise and passion
          </p>
        </div>

        {/* Dynamic Services from Database */}
        {dynamicServices.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Featured Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dynamicServices.map((service) => (
                <article
                  key={service.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
                >
                  {/* Image */}
                  {service.images.length > 0 && (
                    <div className="relative h-48 bg-gray-100">
                      <Image
                        src={service.images[0]}
                        alt={service.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-2xl font-semibold mb-3">
                      {service.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 flex-1">
                      {service.description}
                    </p>

                    {/* Price and CTA */}
                    <div className="space-y-3">
                      {service.price !== null && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm text-gray-500">Starting at</span>
                          <span className="text-3xl font-bold text-gray-900">
                            ${service.price.toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      <Link
                        href={`/contact?service=${encodeURIComponent(service.title)}`}
                        className="block w-full px-6 py-3 bg-black text-white text-center rounded-lg hover:bg-gray-800 transition font-medium"
                      >
                        {service.price !== null ? 'Get Started' : 'Request Quote'}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Static Service Categories */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Service Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {staticServices.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="group block rounded-lg border p-4 hover:shadow-lg transition"
              >
                <div className="h-40 w-full rounded overflow-hidden bg-gray-100">
                  <Image
                    src={s.img}
                    alt={s.title}
                    width={800}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <div className="mt-2 text-sm text-[#003366] group-hover:underline">
                  Learn More/Apprendre encore plus ↗
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="text-xl font-semibold mb-2">Quality First</h3>
              <p className="text-gray-600">
                Every service delivered with meticulous attention to detail
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Fast Turnaround</h3>
              <p className="text-gray-600">
                We respect your deadlines and deliver on time
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="text-xl font-semibold mb-2">Personalized</h3>
              <p className="text-gray-600">
                Tailored solutions that match your unique vision
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-linear-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-4">
              Have a project in mind?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg">
              Let's discuss how we can bring your creative vision to life with our professional services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-block px-8 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition font-medium"
              >
                Get in Touch
              </Link>
              <Link
                href="/about"
                className="inline-block px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-black transition font-medium"
              >
                Learn About Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
