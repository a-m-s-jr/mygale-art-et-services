import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    apiToken?: string
    user?: {
      id?: string
      role?: string
      email?: string | null
      name?: string | null
    }
  }

  interface JWT {
    apiToken?: string
    role?: string
    id?: string
    email?: string
  }
}
