/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { type NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

/**
 * Use a dev singleton to avoid multiple PrismaClient instances during HMR.
 */
declare global {
  var __prismaClient: PrismaClient | undefined
}
const prisma = global.__prismaClient ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') global.__prismaClient = prisma

const PRIVATE_KEY =
  process.env.JWT_PRIVATE_KEY ||
  (() => {
    // fallback: if env points to a pem file path, try to load it
    const p = path.resolve(process.cwd(), 'apps', 'api', 'jwt_private.pem')
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8')
    return undefined
  })()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any),
  providers: [
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      from: `no-reply@${process.env.NEXTAUTH_URL?.replace(/^https?:\/\//, '')}`,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],

  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET ?? 'change_this_in_prod',

  callbacks: {
    // Persist identifying info into the token when user signs in
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role ?? 'VIEWER'
        token.email = (user as any).email ?? token.email
      }

      // Ensure apiToken is available in the token (signed with your API private key).
      // If you do not have PRIVATE_KEY available, apiToken won't be created.
      if (PRIVATE_KEY && token.id) {
        try {
          token.apiToken = jwt.sign(
            {
              sub: token.id,
              email: token.email,
              role: token.role,
            },
            PRIVATE_KEY,
            {
              algorithm: 'RS256',
              expiresIn: Number(process.env.JWT_EXPIRES_IN ?? 900),
              issuer: process.env.JWT_ISSUER ?? 'mygale',
              audience: process.env.JWT_AUD ?? 'api',
            },
          )
        } catch (e) {
          // fall through without breaking auth if signing fails
          console.warn("Failed signing apiToken:", e);
        }
      }

      return token
    },

    // Expose apiToken and user id/role in session
    async session({ session, token }) {
      return {
        ...session,
        apiToken: token.apiToken as string | undefined,
        user: {
          ...(session.user ?? {}),
          id: token.id,
          role: token.role,
          email: token.email ?? session.user?.email,
        },
      } as any
    },
  },
}

export default NextAuth(authOptions)
