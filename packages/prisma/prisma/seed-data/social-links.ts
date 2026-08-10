export type SeedSocialLink = {
  key: string
  platform: 'FACEBOOK' | 'INSTAGRAM' | 'WHATSAPP' | 'LINKEDIN' | 'TIKTOK' | 'X' | 'YOUTUBE' | 'OTHER'
  label: string
  url: string
  order: number
}

export const SEED_SOCIAL_LINKS: SeedSocialLink[] = [
  {
    key: 'whatsapp-main',
    platform: 'WHATSAPP',
    label: '+237 6 75 00 32 69',
    url: 'https://wa.me/237675003269',
    order: 0,
  },
  {
    key: 'facebook-main',
    platform: 'FACEBOOK',
    label: 'Facebook',
    url: 'https://web.facebook.com/profile.php?id=61583563763460',
    order: 1,
  },
]
