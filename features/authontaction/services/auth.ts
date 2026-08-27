import {
  createGuest,
  getGuest,
} from "@/features/gustes/services/guest.service";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({
      user,
    }: {
      user: { email?: string | null; name?: string | null };
    }) {
      try {
        const email = user.email;
        if (!email) return false;

        const existingUser = await getGuest(email);
        if (!existingUser) {
          await createGuest({ email, fullName: user.name ?? null });
        }
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    async session({ session }: { session: any }) {
      const email = session.user?.email;
      if (!email) return session;
      const user = await getGuest(email);
      if (user?.id) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);
