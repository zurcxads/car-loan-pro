import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: 'consumer' | 'dealer' | 'lender' | 'admin';
      entityId: string | null;
    };
  }

  interface User {
    role: string;
    entityId: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    entityId: string | null;
  }
}
