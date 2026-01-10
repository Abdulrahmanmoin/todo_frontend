// frontend/src/lib/server-auth.ts
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';

// Create the Better Auth server instance
export const auth = betterAuth({
  appName: 'Todo App',
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  secret: process.env.BETTER_AUTH_SECRET || 'your-secret-key-change-in-production',

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
    minPasswordLength: 8,
  },

  // Social providers (optional)
  socialProviders: {
    // github: {
    //   clientId: process.env.GITHUB_CLIENT_ID!,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    // },
    // google: {
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // },
  },

  // Session configuration
  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 1 day
    freshAge: 10 * 60, // 10 minutes
  },

  // Database configuration (using in-memory for development)
  // In production, you should use a proper database adapter
  // database: drizzleAdapter(db, { provider: 'pg' }), // for PostgreSQL
  // database: drizzleAdapter(db, { provider: 'mysql' }), // for MySQL
  // database: drizzleAdapter(db, { provider: 'sqlite' }), // for SQLite

  // Additional user fields
  user: {
    additionalFields: {
      // Add any additional user fields here
      // role: {
      //   type: 'string',
      //   required: false,
      //   defaultValue: 'user',
      // },
    },
  },

  // Rate limiting
  rateLimit: {
    window: 60, // 60 seconds
    max: 10, // 10 requests
  },
});

// Export auth middleware for Next.js
export const {
  authHandler,
  signIn,
  signUp,
  signOut,
  getSession
} = auth;

// Export cookies helper
export const cookies = nextCookies();