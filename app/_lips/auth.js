import { createGuest, getGuest } from "./data-service";
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
    async signIn({ user }) {
      try {
        const existingUser = await getGuest(user.email);

        if (!existingUser) {
          await createGuest({ email: user.email, fullName: user.name });
        }
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },

    async session({ session }) {
      const user = await getGuest(session.user.email);
      session.user.id = user.id;
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
