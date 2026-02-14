//@ts-nocheck

import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        //checking if both were provided
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and Password are required");
        }
        //checking user in db by email. no user match = null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        //no user with that email = reject
        if (!user) {
          throw new Error("No account has been found with this email");
        }

        //comparing password and hashes passwrd with bcypt.compare
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        //if password doesnt match - reject
        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        //if succeeded, return the user data
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
