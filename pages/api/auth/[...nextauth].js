import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      const allowed_emails = process.env.ALLOWED_EMAILS.split(",")
      if (!allowed_emails.includes(user.email)) {
        return false
      }
      return true
    },
  }
}
export default NextAuth(authOptions)

