import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const payload = {
          public_key: credentials.publicKey,
          signed_message: credentials.signature,
        };

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/v0/wallet`,
          {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const user = await res.json();

        if (!res.ok) {
          throw new Error(user.exception);
        }
        // If no error and we have user data, return it
        if (res.ok && user) {
          return user;
        }

        // Return null if user data could not be retrieved
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          accessToken: user.token.access,
          refreshToken: user.token.refresh,
          user: {
            username: user.user.username,
            picture: user.user.image_id,
            pk: user.user.pk,
            id: user.user.id,
          },
          accessTokenExpires: Date.now() * 43200,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.user = {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        username: token.user.username,
        id: token.user.id,
        picture: token.user.image_id,
        pk: token.user.pk,
      };

      return session;
    },
  },
  jwt: {
    secret: "SECRET_HERE",
  },
  // Enable debug messages in the console if you are having problems
  debug: process.env.NODE_ENV === "development",
});

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/v0/refresh`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.accessToken}`,
          "X-REFRESH": token.refreshToken,
        },
        body: JSON.stringify({
          auth: {
            access: token.accessToken,
            refresh: token.refreshToken,
          },
        }),
        method: "POST",
      }
    );

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access,
      accessTokenExpires: Date.now() * 43200,
      username: token.user.username,
      picture: token.user.image_id,
      id: token.user.id,
      pk: token.user.pk,
      refreshToken: refreshedTokens.refresh ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error(error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
