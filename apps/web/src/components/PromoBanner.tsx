'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@prisma/client'

interface PromoBannerProps {
  featuredItems: Product[]
}

export function PromoBanner({ featuredItems }: PromoBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % featuredItems.length)
  }, [featuredItems.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length)
  }, [featuredItems.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Auto-rotate slides every 5 seconds
  useEffect(() => {
    if (isPaused || featuredItems.length <= 1) return

    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isPaused, nextSlide, featuredItems.length])

  // Don't render if no featured items
  if (featuredItems.length === 0) {
    return null
  }

  const currentItem = featuredItems[currentIndex]
  const linkHref = currentItem.type === 'PRODUCT' ? '/products' : '/services'

  return (
    <div
      className="relative bg-linear-to-r from-blue-600 to-purple-600 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div className="relative h-64 md:h-80 lg:h-96">
        {featuredItems.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="container mx-auto px-4 h-full">
              <div className="flex items-center h-full gap-8">
                {/* Image */}
                {item.images.length > 0 && (
                  <div className="hidden md:block relative w-1/2 h-3/4 shrink-0">
                    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl">
                      <Image
                        src={item.images[0]}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={index === 0}
                      />
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 text-white">
                  <div className="inline-block px-3 py-1 bg-amber-400 text-gray-900 rounded-full text-sm font-semibold mb-4">
                    ⭐ Featured {item.type.toLowerCase()}
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 line-clamp-2">
                    {item.title}
                  </h2>
                  
                  <p className="text-lg md:text-xl text-blue-100 mb-6 line-clamp-3">
                    {item.description}
                  </p>

                  {item.price && (
                    <div className="text-2xl md:text-3xl font-bold mb-6">
                      ${item.price.toFixed(2)}
                    </div>
                  )}

                  <Link
                    href={linkHref}
                    className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Learn More →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      {featuredItems.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {featuredItems.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Pause Indicator */}
      {isPaused && featuredItems.length > 1 && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-sm rounded-full">
          Paused
        </div>
      )}
    </div>
  )
}
