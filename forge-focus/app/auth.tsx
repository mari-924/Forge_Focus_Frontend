import * as AuthSession from "expo-auth-session";
import { useState } from "react";
import Constants from "expo-constants";
import { jwtDecode } from "jwt-decode";

const redirectUri = AuthSession.makeRedirectUri({
  scheme: "forgefocus",
  path: "redirect",
});

if (!Constants.expoConfig?.extra) {
  throw new Error("Missing Expo Config Extra");
}

const auth0Domain = Constants.expoConfig.extra.auth0Domain;
const clientId = Constants.expoConfig.extra.auth0ClientId;

export default function useAuth0() {
  async function login(provider = "github") {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: "forgefocus",
      path: "redirect",
    });

    const discovery = {
      authorizationEndpoint: `https://${auth0Domain}/authorize`,
      tokenEndpoint: `https://${auth0Domain}/oauth/token`,
    };

    const request = new AuthSession.AuthRequest({
      clientId,
      redirectUri,
      responseType: "code",
      scopes: ["openid", "profile", "email"],
      extraParams: {
        connection: provider,
        redirect_uri: redirectUri,
      },
    });

    const result = await request.promptAsync(discovery);

    if (result.type === "success") {
      const tokenRes = await fetch(`https://${auth0Domain}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: clientId,
          code: result.params.code,
          redirect_uri: redirectUri,
          code_verifier: request.codeVerifier,
        }),
      });

      const tokens = await tokenRes.json();

      // decode ID token -> GitHub profile
      const profile = jwtDecode(tokens.id_token);

      console.log("Auth0 Profile:", profile);
      console.log("Auth0 Tokens:", tokens);

      return { profile, tokens }; // THIS IS THE FIX
    }

    return null;
  }

  return { login };
}
