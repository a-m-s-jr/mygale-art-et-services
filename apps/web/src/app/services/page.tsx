import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
//import { getLocaleDict } from '@/lib/locale' // server helper (if you exported one). If not, we'll simply render static headings.

export default function ServicesIndexPage() {
  // We can't call client hooks here. Use a server-side minimal object or pass static text.
  // If you want localized server text, export a server helper from lib/locale.ts instead.
  const t = {
    servicesTitle: 'Nos services',
  }

  const list = [
    { slug: 'architecture', title: 'Architecture', img: '/architecture.jpg' },
    { slug: 'stylisme', title: 'Stylisme', img: '/style.jpg' },
    { slug: 'printing', title: 'Imprimerie', img: '/print.jpg' },
    { slug: 'vitraux', title: 'Vitraux', img: '/vitreaux.jpg' },
    { slug: 'construction', title: 'Construction', img: '/construction.jpg' },
    { slug: 'web-development', title: 'Web Development', img: '/web-dev.jpg' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold mb-8">{t.servicesTitle}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {list.map((s) => (
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
  )
}
