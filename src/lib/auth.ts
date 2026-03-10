import { type AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Demo users for when Supabase is not configured
const DEMO_USERS = [
  { id: 'usr_lender_1', email: 'lender@demo.com', name: 'Demo Lender', role: 'lender', passwordHash: bcrypt.hashSync('demo123', 10), entityId: 'LND-001' },
  { id: 'usr_dealer_1', email: 'dealer@demo.com', name: 'AutoMax Houston', role: 'dealer', passwordHash: bcrypt.hashSync('demo123', 10), entityId: 'DLR-001' },
  { id: 'usr_admin_1', email: 'admin@carloanpro.com', name: 'Admin', role: 'admin', passwordHash: bcrypt.hashSync('admin2026', 10), entityId: null },
  { id: 'usr_consumer_1', email: 'marcus.j@email.com', name: 'Marcus Johnson', role: 'consumer', passwordHash: bcrypt.hashSync('demo123', 10), entityId: null },
];

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Try Supabase first
        if (isSupabaseConfigured()) {
          const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single();

          if (user && await bcrypt.compare(credentials.password, user.password_hash)) {
            return {
              id: String(user.id),
              email: user.email,
              name: user.name,
              role: user.role,
              entityId: user.entity_id,
            };
          }
          // Fall through to demo users if Supabase lookup fails
        }

        // Fallback to demo users
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
        token.role = (user as { role: string }).role;
        token.entityId = (user as { entityId: string | null }).entityId;
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
  secret: process.env.NEXTAUTH_SECRET || 'car-loan-pro-dev-secret-change-in-production',
};
