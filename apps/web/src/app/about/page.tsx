import React from 'react'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-semibold">About MyGale</h2>
      <p className="text-gray-300">
        MyGale helps teams capture and respond to customer messages quickly and reliably. We focus
        on real-time delivery, safe retries for webhooks, and an admin experience that reduces
        friction.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="bg-neutral-850 p-4 rounded-lg border border-neutral-800">
          <h4 className="font-semibold">Mission</h4>
          <p className="text-sm text-gray-300 mt-2">
            Make customer communication delightful and accountable.
          </p>
        </div>
        <div className="bg-neutral-850 p-4 rounded-lg border border-neutral-800">
          <h4 className="font-semibold">Security</h4>
          <p className="text-sm text-gray-300 mt-2">
            We take data privacy seriously and follow least-privilege access.
          </p>
        </div>
        <div className="bg-neutral-850 p-4 rounded-lg border border-neutral-800">
          <h4 className="font-semibold">Scale</h4>
          <p className="text-sm text-gray-300 mt-2">
            Design that scales from solo founders to enterprise teams.
          </p>
        </div>
      </div>
    </div>
  )
}
