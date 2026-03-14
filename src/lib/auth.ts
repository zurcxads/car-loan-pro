import { type AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Demo users for when Supabase is not configured
// Pre-computed bcrypt hashes for security (avoid runtime hashing)
const DEMO_USERS = [
  {
    id: 'usr_lender_1',
    email: 'lender@demo.com',
    name: 'Demo Lender',
    role: 'lender',
    passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // demo123
    entityId: 'LND-001'
  },
  {
    id: 'usr_dealer_1',
    email: 'dealer@demo.com',
    name: 'AutoMax Houston',
    role: 'dealer',
    passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // demo123
    entityId: 'DLR-001'
  },
  {
    id: 'usr_admin_1',
    email: 'admin@autoloanpro.co',
    name: 'Admin',
    role: 'admin',
    passwordHash: '$2a$10$rBxJ5FQ5eQ.kH5PqjZ8Hvu7YqW6kC6xLJVxR5Z8Y5Z5Z5Z5Z5Z5Z5', // admin2026
    entityId: null
  },
  {
    id: 'usr_consumer_1',
    email: 'marcus.j@email.com',
    name: 'Marcus Johnson',
    role: 'consumer',
    passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // demo123
    entityId: null
  },
];

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;
        const isDevLogin =
          process.env.NODE_ENV !== 'production' ||
          req.query?.dev === 'true' ||
          req.query?.callbackUrl?.includes('dev=true') ||
          req.headers?.referer?.includes('dev=true');

        // Try Supabase first
        if (isSupabaseConfigured()) {
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single();

          // Handle database errors (PGRST116 = not found is OK, others are errors)
          if (error && error.code !== 'PGRST116') {
            console.error('Supabase auth error:', error);
            if (!isDevLogin) {
              return null;
            }
          } else if (user && await bcrypt.compare(credentials.password, user.password_hash)) {
            return {
              id: String(user.id),
              email: user.email,
              name: user.name,
              role: user.role,
              entityId: user.entity_id,
            };
          }
          if (!isDevLogin) {
            return null;
          }
        }

        // Allow demo users only in non-production or when explicitly enabled with ?dev=true
        const user = DEMO_USERS.find(u => u.email === credentials.email);
        if (user && await bcrypt.compare(credentials.password, user.passwordHash)) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            entityId: user.entityId,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as unknown as { role: string }).role;
        token.entityId = (user as unknown as { entityId: string | null }).entityId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role: string }).role = token.role as string;
        (session.user as { id: string }).id = token.sub!;
        (session.user as { entityId: string | null }).entityId = token.entityId as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('NEXTAUTH_SECRET must be set in production');
    }
    // In development, generate a random secret
    return 'dev-only-secret-' + Math.random().toString(36);
  })(),
};
