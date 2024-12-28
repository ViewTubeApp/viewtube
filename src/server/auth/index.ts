import NextAuth from "next-auth";
import "server-only";

import authConfig from "./config";

export const { handlers, auth: authMiddleware, signIn, signOut } = NextAuth(authConfig);
