import { type AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase';
import { isServerDevAccessGranted } from '@/lib/dev-access-server';

const DEV_ONLY_DEMO_PASSWORD = 'AutoLoanPro2026!';

const DEV_ONLY_DEMO_EMAILS = new Set([
  'admin@autoloanpro.co',
  'demo@ally.com',
  'demo@dealer.com',
]);

type DemoUser = {
  id: string;
  email: string;
  name: string;
  role: 'lender' | 'dealer' | 'admin' | 'consumer';
  entityId: string | null;
  passwordHash?: string;
};

// Demo users for when Supabase is not configured
const DEMO_USERS: DemoUser[] = [
  {
    id: 'usr_lender_1',
    email: 'demo@ally.com',
    name: 'Ally Financial Rep',
    role: 'lender',
    entityId: 'LND-001'
  },
  {
    id: 'usr_dealer_1',
    email: 'demo@dealer.com',
    name: 'Houston Toyota',
    role: 'dealer',
    entityId: 'DLR-001'
  },
  {
    id: 'usr_admin_1',
    email: 'admin@autoloanpro.co',
    name: 'Admin User',
    role: 'admin',
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
        void req;
        const email = credentials.email.toLowerCase();
        const isProtectedDemoAccount = DEV_ONLY_DEMO_EMAILS.has(email);
        const devAccessGranted = await isServerDevAccessGranted();

        if (isProtectedDemoAccount && !devAccessGranted) {
          return null;
        }

        if (isSupabaseConfigured()) {
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password: credentials.password,
          });

          if (!authError && authData.user) {
            const serviceClient = getServiceClient();
            const { data: userRecord, error: userError } = await serviceClient
              .from('users')
              .select('id, email, name, role, entity_id')
              .eq('email', email)
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

          if (!devAccessGranted) {
            return null;
          }
        } else if (!devAccessGranted) {
          return null;
        }

        const user = DEMO_USERS.find(u => u.email === email);
        if (user && credentials.password === DEV_ONLY_DEMO_PASSWORD) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            entityId: user.entityId,
          };
        }

        const fallbackUser = DEMO_USERS.find(u => u.email === email && u.passwordHash);
        if (fallbackUser?.passwordHash && await bcrypt.compare(credentials.password, fallbackUser.passwordHash)) {
          return {
            id: fallbackUser.id,
            email: fallbackUser.email,
            name: fallbackUser.name,
            role: fallbackUser.role,
            entityId: fallbackUser.entityId,
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
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('NEXTAUTH_SECRET must be set in production');
    }
    // In development, generate a random secret
    return 'dev-only-secret-' + Math.random().toString(36);
  })(),
};
