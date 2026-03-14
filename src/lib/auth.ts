import { type AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';

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
        const requestData = req as {
          query?: Record<string, string | string[] | undefined>;
          headers?: Record<string, string | undefined>;
          body?: Record<string, string | undefined>;
        };
        const callbackUrl = requestData.body?.callbackUrl || '';
        const devParam = requestData.query?.dev;
        const isDevQuery = Array.isArray(devParam) ? devParam.includes('true') : devParam === 'true';
        const isDevLogin =
          process.env.NODE_ENV !== 'production' &&
          (
            isDevQuery ||
            callbackUrl.includes('dev=true') ||
            requestData.headers?.referer?.includes('dev=true')
          );

        if (isSupabaseConfigured()) {
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (!authError && authData.user) {
            const serviceClient = getServiceClient();
            const { data: userRecord, error: userError } = await serviceClient
              .from('users')
              .select('id, email, name, role, entity_id')
              .eq('email', credentials.email)
              .single();

            await supabase.auth.signOut();

            if (userError) {
              console.error('Supabase user lookup error:', userError);
              return null;
            }

            return {
              id: String(userRecord.id),
              email: userRecord.email,
              name: userRecord.name,
              role: userRecord.role,
              entityId: userRecord.entity_id,
            };
          }

          if (process.env.NODE_ENV === 'production' || !isDevLogin) {
            return null;
          }
        } else if (process.env.NODE_ENV === 'production') {
          return null;
        }

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
