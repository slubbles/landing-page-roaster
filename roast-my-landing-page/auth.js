import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, profile }) {
      // Persist GitHub avatar + name into the JWT
      if (profile) {
        token.picture = profile.avatar_url;
        token.name = profile.name || profile.login;
      }
      return token;
    },
    async session({ session, token }) {
      // Make sure session always has the email
      if (token?.email) session.user.email = token.email;
      if (token?.picture) session.user.image = token.picture;
      if (token?.name) session.user.name = token.name;
      return session;
    },
  },
  session: { strategy: 'jwt' },
  trustHost: true,
});
