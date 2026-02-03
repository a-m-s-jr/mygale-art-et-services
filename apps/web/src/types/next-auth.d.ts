import NextAuth from 'next-auth'
import { Role } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    apiToken?: string
    user?: {
      id?: string
      role?: Role
      email?: string | null
      name?: string | null
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role: Role
  }

  interface JWT {
    apiToken?: string
    role?: Role
    id?: string
    email?: string
  }
}
