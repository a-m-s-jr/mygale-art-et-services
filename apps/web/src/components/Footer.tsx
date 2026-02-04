// apps/web/src/components/Footer.tsx
import React from 'react'

export default function Footer() {
  return (
    <footer className="border-t mt-12 py-8 bg-neutral-400">
      <div className="max-w-6xl mx-auto px-4 text-sm text-gray-800 flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <div className="font-semibold text-[#003366]">MYGALE ART ET SERVICES</div>
          <div>Yaoundé, Cameroon</div>

          <div className="mt-2">
            Email:{' '}
            <a className="underline" href="mailto:mygaleartetservices@gmail.com">
              mygaleartetservices@gmail.com
            </a>
          </div>

          <div>
            WhatsApp:{' '}
            <a
              className="underline"
              href="https://wa.me/237675003269"
              target="_blank"
              rel="noreferrer"
            >
              +237 6 75 00 32 69
            </a>
          </div>
        </div>

        <div className="flex gap-4">
          <a
            className="underline"
            href="https://web.facebook.com/profile.php?id=61583563763460"
            target="_blank"
            rel="noreferrer"
          >
            Facebook
          </a>
        </div>
      </div>
    </footer>
  )
}
