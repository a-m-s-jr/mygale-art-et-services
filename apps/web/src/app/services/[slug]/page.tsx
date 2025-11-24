/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import ServiceClient from './ServiceClient'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SERVER_TRANSLATIONS } from '@/lib/locale.server'

export const revalidate = 86400 // 24 hours

/**
 * Slug list (keeps types safe)
 */
const SLUGS = [
  'architecture',
  'stylisme',
  'printing',
  'vitraux',
  'construction',
  'web-development',
] as const
export type ServiceSlug = (typeof SLUGS)[number]

type ContentBlock = {
  title: string
  items: string[]
  img?: string
}

type ServiceDataServer = {
  titleKey: string
  descKey: string
  img: string
  og?: string
  content: { fr: ContentBlock[]; en: ContentBlock[] }
}

/**
 * The bilingual service content structure — you already provided this; I preserved it and added no required per-block img fields.
 * If a content block includes `img`, ServiceClient will use it, otherwise it will fallback to the main service `img`.
 */
export const SERVICE_DATA: Record<ServiceSlug, ServiceDataServer> = {
  architecture: {
    titleKey: 'architecture',
    descKey: 'architecture',
    img: '/architecture.jpg',
    og: '/services/architecture/og.png',
    content: {
      fr: [
        {
          title: 'Conception et faisabilité',
          img: '/services/architecture/i.png',
          items: [
            "Conseil et analyse : Étude de la faisabilité du projet, analyse des règles d'urbanisme, estimation du budget et du calendrier.",
            'Conception : Élaboration des plans, esquisses et projets architecturaux pour répondre aux besoins du client.',
            'Choix du terrain : Assistance dans le choix du site approprié pour le projet.',
          ],
        },
        {
          title: 'Démarches administratives et réglementaires',
          img: '/services/architecture/ii.png',
          items: [
            'Autorisations : Préparation et soumission des demandes de permis de construire et autres autorisations nécessaires.',
            'Conformité : Assurer que le projet respecte les normes en vigueur.',
          ],
        },
        {
          title: 'Gestion de chantier',
          img: '/services/architecture/c.png',
          items: [
            'Suivi et pilotage : Coordination de toutes les entreprises et corps de métier sur le chantier.',
            'Gestion financière : Vérification des factures des entreprises et validation pour paiement.',
            'Réunions et comptes-rendus : Organisation de réunions de chantier régulières et rédaction de comptes-rendus.',
            'Livraison : Suivi du projet jusqu’à la livraison finale',
          ],
        },
        {
          title: 'Services complémentaires',
          img: '/services/architecture/iv.png',
          items: [
            'Rénovation et réhabilitation : Transformation, agrandissement ou modernisation de bâtiments existants.',
            'Évaluation économique : Estimation des coûts et aide au montage financier.',
            "Décoration intérieure et extérieure : Conception de l'aménagement des espaces.",
            "Appel d'offres : Organisation de la procédure pour sélectionner les entreprises.",
          ],
        },
      ],
      en: [
        {
          title: 'Design & Feasibility',
          img: '/services/architecture/i.png',
          items: [
            'Consulting & analysis: Feasibility studies, urban planning review, budget and schedule estimation.',
            'Design: Development of plans, sketches and architectural proposals tailored to client needs.',
            'Site selection: Assistance in choosing the most suitable site for the project.',
          ],
        },
        {
          title: 'Administrative & regulatory procedures',
          img: '/services/architecture/ii.png',
          items: [
            'Permits: Preparation and submission of building permits and other required approvals.',
            'Compliance: Ensuring projects meet applicable standards and regulations.',
          ],
        },
        {
          title: 'Construction Management',
          img: '/services/architecture/iii.png',
          items: [
            'Supervision & coordination: Management of contractors and site activities.',
            'Financial management: Verification and approval of contractor invoices.',
            'Meetings & reporting: Regular site meetings and detailed reports.',
            'Delivery: Follow-up through to final handover.',
          ],
        },
        {
          title: 'Complementary Services',
          img: '/services/architecture/iv.png',
          items: [
            'Renovation & rehabilitation: Transformation and modernization of existing buildings.',
            'Economic evaluation: Cost estimation and financial planning support.',
            'Interior & exterior design: Layout and aesthetic design for spaces.',
            'Tender management: Organization and handling of bidding procedures.',
          ],
        },
      ],
    },
  },
  stylisme: {
    titleKey: 'stylisme',
    descKey: 'stylisme',
    img: '/style.jpg',
    og: '/services/stylisme/og.png',
    content: {
      fr: [
        {
          title: 'Services de stylisme et de design',
          img: '/services/stylisme/i.png',
          items: [
            "Création de croquis et concepts : Réalisation de croquis et de planches tendances pour définir l'univers d'une collection.",
            'Sélection de tissus et de matériaux : Choix des matières et des couleurs en fonction du design et des exigences du projet.',
            "Conception de fiches techniques : Création de fiches détaillées pour la communication avec l'atelier de production.",
            'Conception numérique : Création de silhouettes mode, de textures et de motifs en format numérique.',
          ],
        },
        {
          title: 'Services de modélisme et de développement de produits',
          img: '/services/stylisme/ii.png',
          items: [
            'Création de patrons : Élaboration de patrons à plat ou en 3D.',
            'Gradation : Adaptation des tailles des patrons selon les standards.',
            'Moulage : Techniques de moulage sur mannequin.',
            'Développement et prototypage : Confection de prototypes pour tester le fit.',
            'Mise au point industrielle : Adaptation pour la production en série.',
          ],
        },
        {
          title: 'Services de collaboration et de consulting',
          img: '/services/stylisme/iii.png',
          items: [
            'Consulting mode : Accompagnement des créateurs de la conception à la production.',
            'Réseau de fournisseurs : Mise en relation avec fournisseurs et ateliers.',
            'Solutions éthiques et durables : Intégration de pratiques durables.',
          ],
        },
      ],
      en: [
        {
          title: 'Fashion Styling & Design Services',
          img: '/services/stylisme/i.png',
          items: [
            'Sketches & concepts: Creation of sketches and style-boards to define a collection identity.',
            'Fabric & material selection: Choosing appropriate materials and colors based on the design.',
            'Technical sheets: Detailed documentation for the production workshop.',
            'Digital design: Digital silhouettes, textures and pattern creation.',
          ],
        },
        {
          title: 'Pattern Making & Product Development',
          img: '/services/stylisme/ii.png',
          items: [
            'Pattern creation: Flat or 3D patterns developed manually or with software.',
            'Grading: Size adaptation according to industry standards.',
            'Draping: Mannequin-based techniques for complex shapes.',
            'Prototyping & fitting: Making prototypes to test fit and make adjustments.',
            'Industrial tuning: Preparing prototypes for mass production.',
          ],
        },
        {
          title: 'Collaboration & Consulting',
          img: '/services/stylisme/iii.png',
          items: [
            'Fashion consulting: Support from concept through production.',
            'Supplier network: Connections with suppliers and workshops.',
            'Sustainable solutions: Implementation of eco-friendly design practices.',
          ],
        },
      ],
    },
  },
  printing: {
    titleKey: 'print',
    descKey: 'print',
    img: '/print.jpg',
    og: '/services/printing/og.png',
    content: {
      fr: [
        {
          title: 'Impression textile',
          img: '/services/printing/i.png',
          items: [
            'Sérigraphie sur tissus',
            'Impression numérique haute qualité',
            'Création de motifs personnalisés',
            'Impression sur vêtements, tissus et accessoires',
          ],
        },
        {
          title: 'Services graphiques',
          img: '/services/printing/2-ii.png',
          items: [
            'Correction de visuels',
            'Préparation de fichiers pour impression',
            'Design sur mesure',
          ],
        },
      ],
      en: [
        {
          title: 'Textile Printing',
          img: '/services/printing/i.png',
          items: [
            'Screen printing on fabric',
            'High-resolution digital printing',
            'Custom pattern creation',
            'Printing on garments and accessories',
          ],
        },
        {
          title: 'Graphic Services',
          img: '/services/printing/2-ii.png',
          items: ['Artwork correction', 'Print-ready preparation', 'Custom design services'],
        },
      ],
    },
  },
  vitraux: {
    titleKey: 'vitraux',
    descKey: 'vitraux',
    img: '/vitreaux.jpg',
    og: '/services/vitraux/og.png',
    content: {
      fr: [
        {
          title: 'Conception et fabrication sur mesure',
          img: '/services/vitraux/i.png',
          items: [
            'Étude de projet : prise de mesures sur site, conception sur-mesure de fenêtres, portes, baies vitrées, vérandas, pergolas, etc.',
            'Fabrication : découpe des profilés aluminium et du vitrage, assemblage des éléments de menuiserie.',
            'Produits spécifiques : verrières de toit, cloisons aluminium/verre, murs-rideaux, façades.',
          ],
        },
        {
          title: 'Pose et installation',
          img: '/services/vitraux/ii.png',
          items: [
            'Installation d’ouvrages : pose de fenêtres, portes, baies vitrées, vérandas, garde-corps.',
            'Finitions et étanchéité : réalisation de l’étanchéité et des finitions du châssis.',
            'Fixations : fourniture et pose de pattes de scellement et systèmes de fixation.',
          ],
        },
        {
          title: 'Services de vitrerie et miroitier',
          img: '/services/vitraux/iii.png',
          items: [
            'Réparation et remplacement : remplacement de vitres brisées, réparation de fenêtres.',
            'Fabrication sur mesure : découpe de vitres et miroirs sur mesure.',
            'Produits verriers : installation de portes vitrées, verrières, et produits verriers.',
          ],
        },
      ],
      en: [
        {
          title: 'Custom Design & Fabrication',
          img: '/services/vitraux/i.png',
          items: [
            'Project study: on-site measurements and custom design of windows, doors and large glazing.',
            'Fabrication: cutting of aluminum profiles and glazing, assembly of joinery elements.',
            'Special products: skylights, interior glass partitions, curtain walls and storefront façades.',
          ],
        },
        {
          title: 'Installation',
          img: '/services/vitraux/ii.png',
          items: [
            'On-site installation of windows, doors, large glass panels and structures.',
            'Finishing & waterproofing: insulation and sealing details.',
            'Fixings: supply and installation of anchors and fastening systems.',
          ],
        },
        {
          title: 'Glazing & Mirror Services',
          img: '/services/vitraux/iii.png',
          items: [
            'Repair & replacement: emergency glass replacement and window repair.',
            'Custom fabrication: cutting glass and mirrors to measure.',
            'Glass products: installation of glass doors and bespoke elements.',
          ],
        },
      ],
    },
  },
  construction: {
    titleKey: 'construction',
    descKey: 'construction',
    img: '/construction.jpg',
    og: '/services/construction/og.png',
    content: {
      fr: [
        {
          title: 'Accessoires de construction',
          img: '/services/construction/i.png',
          items: [
            'Fourniture d’outils professionnels',
            'Matériaux fiables et durables',
            'Accessoires pour chantiers',
          ],
        },
        {
          title: 'Services associés',
          img: '/services/construction/ii.png',
          items: [
            'Conseil et accompagnement technique',
            'Solutions adaptées aux besoins des chantiers',
            'Support pour installations',
          ],
        },
      ],
      en: [
        {
          title: 'Construction Accessories',
          img: '/services/construction/i.png',
          items: [
            'Professional tools and equipment',
            'Reliable, durable materials',
            'Accessories for construction sites',
          ],
        },
        {
          title: 'Associated Services',
          img: '/services/construction/ii.png',
          items: [
            'Technical guidance and recommendations',
            'Adapted solutions for project needs',
            'Support for installations',
          ],
        },
      ],
    },
  },
  'web-development': {
    titleKey: 'webdev',
    descKey: 'webdev',
    img: '/web-dev.jpg',
    og: '/services/web-development/og.png',
    content: {
      fr: [
        {
          title: 'Développement web',
          img: '/services/web-development/i.png',
          items: [
            'Sites vitrines professionnels',
            'Sites responsives optimisés',
            'Intégration UI/UX moderne',
          ],
        },
        {
          title: 'Solutions digitales',
          img: '/services/web-development/ii.png',
          items: [
            'Systèmes de gestion',
            'Landing pages produits',
            'Optimisation SEO technique',
            'Tests d’intrusion',
          ],
        },
      ],
      en: [
        {
          title: 'Web Development',
          img: '/services/web-development/i.png',
          items: [
            'Professional showcase websites',
            'Responsive, mobile-first builds',
            'Modern UI/UX integration',
          ],
        },
        {
          title: 'Digital Solutions',
          img: '/services/web-development/ii.png',
          items: [
            'Management systems',
            'Product landing pages',
            'Technical SEO optimization',
            'Penetration Testing',
          ],
        },
      ],
    },
  },
}

export async function generateMetadata({
  params,
}: {
  params: { slug: ServiceSlug } | Promise<{ slug: ServiceSlug }>
}): Promise<Metadata> {
  const p = await params
  const slug = p.slug

  const data = SERVICE_DATA[slug]
  if (!data) return {}

  // Detect language from segment
  // Example: /fr/services/architecture → lang === 'fr'
  // Fallback to English
  const lang: 'fr' | 'en' = 'fr'
  const t = SERVER_TRANSLATIONS[lang]

  // SAFETY CHECKS
  const titleEntry = t.services[data.titleKey]
  const descEntry = t.services[data.descKey]

  if (!titleEntry) {
    //console.error(`[ERROR] Missing translation for titleKey: ${data.titleKey}`)
    return { title: 'Missing translation', description: '' }
  }

  if (!descEntry) {
    console.error(`[ERROR] Missing translation for descKey: ${data.descKey}`)
    return { title: titleEntry.title, description: '' }
  }

  const title = titleEntry.title
  const desc = descEntry.desc

  const baseUrl = 'https://mygale-art-and-services.com'
  const url = `${baseUrl}/services/${slug}`

  const ogImage = data.og ?? data.img ?? `${baseUrl}/hero-bg.jpg`

  return {
    title,
    description: desc,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: desc,
      url,
      siteName: 'MYGALE Art & Services',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: lang,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [ogImage],
    },
  }
}

// Unwrap params safely in case Next supplies a Promise
export default async function ServicePage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>
}) {
  const p = await params
  const slug = p.slug as ServiceSlug

  const data = SERVICE_DATA[slug as ServiceSlug]

  if (!data) {
    notFound()
  }

  return <ServiceClient slug={slug as ServiceSlug} data={data} />
}
