/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
// FIXED: import shared prisma instance instead of wrong imports
import prisma from 'prisma'
import jwt from 'jsonwebtoken'

export default NextAuth({
  // Use Prisma adapter if you want DB-backed sessions & accounts
  adapter: PrismaAdapter(prisma),

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
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: { strategy: 'jwt' }, // keep session in a secure JWT on web side
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // include user info in the NextAuth JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role ?? 'VIEWER'
      }
      return token
    },

    // When NextAuth returns session to client, include the API token
    async session({ session, token }) {
      // sign an API JWT using our private key so Nest can validate
      const apiToken = jwt.sign(
        {
          sub: token.id,
          email: token.email,
          role: token.role,
        },
        process.env.JWT_PRIVATE_KEY!,
        {
          algorithm: 'RS256',
          expiresIn: Number(process.env.JWT_EXPIRES_IN ?? 900),
          issuer: process.env.JWT_ISSUER ?? 'mygale',
          audience: process.env.JWT_AUD ?? 'api',
        },
      )

      return {
        ...session,
        user: { ...(session.user ?? {}), id: token.id, role: token.role },
        apiToken,
      }
    },
  },

  // Security settings
  cookies: {
    // defaults are fine but set secure cookies in prod (NEXTAUTH_URL must be https)
  },
})
