'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from '@/lib/locale'
import useReveal from '@/hooks/useReveal'

export default function HomeClient() {
  const { t } = useLocale()
  const [loading, setLoading] = useState(false)

  // activate reveal observer (adds .is-revealed class to .reveal elements)
  useReveal()

  const services = [
    {
      slug: 'architecture',
      title: t.services.architectureTitle,
      desc: t.services.architectureDesc,
      img: '/architecture.jpg',
    },
    {
      slug: 'stylisme',
      title: t.services.stylismeTitle,
      desc: t.services.stylismeDesc,
      // public folder file name — ensure this exists (you said "style.jpg" earlier, if your file is "stylisme.jpg" update here)
      img: '/style.jpg',
    },
    {
      slug: 'printing',
      title: t.services.printTitle,
      desc: t.services.printDesc,
      img: '/print.jpg',
    },
    {
      slug: 'vitraux',
      title: t.services.vitrauxTitle,
      desc: t.services.vitrauxDesc,
      img: '/vitreaux.jpg',
    },
    {
      slug: 'construction',
      title: t.services.constructionTitle,
      desc: t.services.constructionDesc,
      img: '/construction.jpg',
    },
    {
      slug: 'web-development',
      title: t.services.webdevTitle,
      desc: t.services.webdevDesc,
      img: '/web-dev.jpg',
    },
  ]

  return (
    <main className="min-h-screen bg-white text-black">
      {/* HERO */}
      <section
        className="relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        aria-label="Hero"
      >
        <div className="absolute inset-0 bg-linear-to-b from-white/80 to-white/60 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 py-28 flex flex-col items-center text-center gap-6 relative z-10">
          <div className="w-36 h-36">
            <Image
              src="/LOGO MYGALE 2.png"
              alt="MYGALE logo"
              width={144}
              height={144}
              className="w-full h-full animate-float"
              priority
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-[#003366] drop-shadow-sm">
            {t.siteTitle}
          </h1>

          <p className="max-w-3xl text-gray-600">{t.heroSubtitle}</p>

          <div className="mt-6 flex gap-3">
            <Link
              href="/contact"
              onClick={() => {
                setLoading(true)
                setTimeout(() => setLoading(false), 600)
              }}
              className="px-5 py-3 rounded-lg bg-[#003366] text-white transform transition hover:scale-[1.03] hover:shadow-lg"
            >
              {loading ? 'Loading…' : t.contactUs}
            </Link>

            <a
              href="#services"
              className="px-4 py-2 rounded-lg border transition hover:bg-gray-100 hover:scale-105"
            >
              {t.ourServices}
            </a>
            <a href="#location" className="px-4 py-2 rounded-lg border transition hover:bg-gray-100 hover:scale-105">
              {t.findUs}
            </a>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-16 bg-[#F4F6F8]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-6 reveal">{t.servicesTitle}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="group reveal bg-white p-6 rounded-xl shadow-sm border cursor-pointer
                           transform transition hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="h-40 w-full bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={s.img}
                    alt={s.title}
                    width={600}
                    height={320}
                    className="object-cover w-full h-full"
                  />
                </div>

                <h3 className="mt-4 font-semibold text-lg">{s.title}</h3>
                <p className="text-gray-600 mt-2 text-sm">{s.desc}</p>

                {/* Hover-only Learn More (Option B) */}
                <span
                  className="inline-block mt-3 text-[#003366] font-medium 
                                 opacity-0 group-hover:opacity-100 transition"
                >
                  <span className="text-[#003366] hover:underline">
                    Learn More/Apprendre encore plus ↗
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 reveal text-center">
          <h2 className="text-2xl font-semibold mb-4">{t.aboutTitle}</h2>
          <p className="text-gray-600">{t.aboutText}</p>
        </div>
      </section>
      {/* LOCATION SECTION */}
      <section className="py-16 bg-[#F4F6F8]" id="location">
        <div className="max-w-6xl mx-auto px-4 reveal text-center">
          <h2 className="text-3xl font-semibold mb-6">{t.location}</h2>
          <div className="w-full h-[350px] md:h-[450px] rounded-xl overflow-hidden shadow-lg border">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3981.0515640715926!2d11.4931364!3d3.7989195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x108bd11b473e59f7%3A0x4ce5c73b687f7408!2sMygale%20Art%20et%20Services!5e0!3m2!1sen!2scm!4v1764379907631!5m2!1sen!2scm"
              title="Mygale Art et Services location map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <a
            href="https://www.google.com/maps/place/Mygale+Art+et+Services/@3.7989195,11.4931364,17z/data=!3m1!4b1!4m6!3m5!1s0x108bd11b473e59f7:0x4ce5c73b687f7408!8m2!3d3.7989195!4d11.4931364!16s%2Fg%2F11mrrj1_wr?entry=ttu&g_ep=EgoyMDI1MTEyMy4xIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block px-6 py-3 rounded-lg bg-[#003366] text-white font-medium shadow hover:scale-105 transition"
          >
            Google Maps
          </a>
        </div>
      </section>
    </main>
  )
}
