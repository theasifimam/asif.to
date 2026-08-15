import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

if (process.env.NODE_ENV !== "production" && !process.env.AUTH_URL) {
  process.env.AUTH_URL = "http://localhost:3000";
}

const apiUrl = process.env.AUTH_API_URL || process.env.NEXT_PUBLIC_API_URL;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({ authorization: { params: { prompt: "select_account" } } }),
    GitHub({ authorization: { params: { scope: "read:user user:email" } } }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (
        !account ||
        !["google", "github"].includes(account.provider) ||
        !user.email
      )
        return false;
      if (!apiUrl || !process.env.AUTH_INTERNAL_SECRET)
        throw new Error("OAuth persistence is not configured");
      const response = await fetch(
        `${apiUrl.replace(/\/$/, "")}/auth/oauth/upsert`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-internal-secret": process.env.AUTH_INTERNAL_SECRET,
          },
          body: JSON.stringify({
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            name: user.name,
            email: user.email,
            image: user.image,
            emailVerified:
              account.provider === "github"
                ? Boolean(user.email)
                : Boolean(profile?.email_verified),
          }),
          cache: "no-store",
        },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result?.data?.user?.id) return false;
      user.id = result.data.user.id;
      user.username = result.data.user.username;
      user.provider = result.data.user.provider;
      user.createdAt = result.data.user.createdAt;
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id;
        token.username = user.username;
        token.provider = user.provider || account?.provider;
        token.createdAt = user.createdAt;
        token.authenticatedAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId || token.sub;
        session.user.username = token.username;
        session.user.provider = token.provider;
        session.user.createdAt = token.createdAt;
        session.authenticatedAt = token.authenticatedAt;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        /* invalid callback URL */
      }
      return baseUrl;
    },
  },
});
