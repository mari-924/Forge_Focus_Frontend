import {
  useContext,
  createContext,
  type PropsWithChildren,
  useEffect,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";
import { useStorageState } from "./useStorageState";
import { useRepos } from "@/db/index";
import * as SecureStore from "expo-secure-store";
import { verifyGoogleToken, verifyGithubToken } from "@/api/api";
import type { User, NewUser, GoogleUser } from "@/types/types";
import * as Linking from "expo-linking";

import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";


WebBrowser.maybeCompleteAuthSession();

const API_BASE_URL =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) ??
  "https://focus-forge-cst438-38b937c199bc.herokuapp.com";

type AuthContextType = {
  signIn: () => Promise<User | null>;
  signInWithGitHub: () => Promise<User | null>;
  signOut: () => Promise<void>;
  session: string | null;
  isLoading: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  signIn: async () => null,
  signInWithGitHub: async () => null,
  signOut: async () => {},
  session: null,
  isLoading: false,
  user: null,
  setUser: () => {},
});

export function useSession() {
  const value = useContext(AuthContext);
  if (!value)
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  return value;
}

const mapGoogleToUser = (g: GoogleUser): NewUser => ({
  googleId: g.id,
  githubId: null,
  username: g.name ?? "",
  email: g.email,
  profile_pic: g.photo ?? null,
});

const mapGithubToUser = (gh: any): NewUser => ({
  googleId: null,
  githubId: String(gh.id),
  username: gh.login ?? "",
  email: gh.email ?? "",
  profile_pic: gh.avatar_url ?? null,
});

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");
  const [user, setUser] = useState<User | null>(null);
  const { db, users } = useRepos();

  const isSigningInRef = useRef(false);
  useEffect(() => {
    const handler = (event: Linking.EventType) => {
      const url = event.url;
      console.log("Deep Link Received:", url);
    };
  
    const subscription = Linking.addEventListener("url", handler);
  
    return () => subscription.remove();
  }, []);
  // -------------------- GOOGLE CONFIG --------------------
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
      forceCodeForRefreshToken: false,
      profileImageSize: 128,
    });
  }, []);

  // -------------------- GOOGLE LOGIN --------------------
  const signIn = useCallback(async (): Promise<User | null> => {
    if (isSigningInRef.current) return null;
    isSigningInRef.current = true;

    try {
      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      }

      const res = await GoogleSignin.signIn();
      if (!isSuccessResponse(res)) return null;

      const { user: googleUser, idToken } = res.data;
      if (!idToken) return null;

      const { access_token } = await verifyGoogleToken(idToken);
      await SecureStore.setItemAsync("jwt", access_token);

      let dbUser = await users.getByGoogleId(googleUser.id);
      if (!dbUser) {
        await db.withTransactionAsync(async () => {
          dbUser = await users.create(mapGoogleToUser(googleUser));
        });
      }

      setUser(dbUser);
      setSession(googleUser.email);
      return dbUser;
    } finally {
      isSigningInRef.current = false;
    }
  }, [setSession]);

  // -------------------- GITHUB OAUTH SETUP (HOOKS!) --------------------
  async function fetchGitHubUser(token: string) {
    const res = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}` }
    });
  
    return res.json();
  }
  
  const log = (...args: any[]) => console.log("🔎[Auth Debug]:", ...args);
  const logError = (...args: any[]) => console.error("❌[Auth Error]:", ...args);
  // -------------------- GITHUB LOGIN --------------------
  const signInWithGitHub = useCallback(async (): Promise<User | null> => {
    try {
      log("Starting GitHub OAuth flow…");

      const clientId = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID!;
      const callbackUrl =
        "https://focus-forge-cst438-38b937c199bc.herokuapp.com/api/auth/github/callback";

      const encodedCallback = encodeURIComponent(callbackUrl);
      const authUrl =
        `https://github.com/login/oauth/authorize` +
        `?client_id=${clientId}` +
        `&redirect_uri=${encodedCallback}` +
        `&scope=read:user%20user:email`;

      log("GitHub Auth URL:", authUrl);
      log("Expected callback URL:", callbackUrl);

      // Capture deep link BEFORE opening browser
      const deepLinkPromise = new Promise<string>((resolve) => {
        const sub = Linking.addEventListener("url", (event) => {
          log("Deep link EVENT fired!", event.url);
          resolve(event.url);
          sub.remove();
        });
      });

      log("Opening GitHub OAuth screen…");
      const browserResult = await WebBrowser.openAuthSessionAsync(
        authUrl,
        "forgefocus://redirect"
      );

      log("Browser result:", browserResult);

      if (browserResult.type === "cancel") {
        logError("User canceled the GitHub login.");
        return null;
      }

      log("Waiting for deep link redirect…");
      const redirectUrl = await deepLinkPromise;
      log("Deep link received:", redirectUrl);

      const parsed = Linking.parse(redirectUrl);
      log("Parsed deep link:", parsed);

      const token = parsed.queryParams?.token as string | undefined;

      if (!token) {
        logError("No 'token' query param found in deep link:", redirectUrl);
        return null;
      }

      log("GitHub token extracted:", token);

      // Step 4 — validate token with backend
      log("Sending token to backend /auth/github:", token);

      const { access_token } = await verifyGithubToken(token);
      log("Backend issued JWT:", access_token);

      await SecureStore.setItemAsync("jwt", access_token);
      log("JWT saved in SecureStore.");

      // Step 5 — fetch GitHub user
      const githubUser = await fetchGitHubUser(token);

      log("Looking for user in SQLite:", githubUser.id);
      let dbUser = await users.getByGitHubId(String(githubUser.id));

      if (!dbUser) {
        log("User not found, creating new record…");

        await db.withTransactionAsync(async () => {
          dbUser = await users.create(mapGithubToUser(githubUser));
        });
        log("Created new user:", dbUser);
      } else {
        log("Found existing DB user:", dbUser);
      }

      if (!dbUser) {
        logError("Failed to create or fetch DB user.");
        return null;
      }

      setUser(dbUser);
      setSession(dbUser.email);
      log("GitHub login SUCCESS. Session set.");

      return dbUser;
    } catch (err: any) {
      logError("GitHub login FAILED:", err.message, err);
      return null;
    }
  }, [users, db, setUser, setSession]);
  
  

  // -------------------- SIGN OUT --------------------
  const signOut = useCallback(async () => {
    await GoogleSignin.signOut();
    await SecureStore.deleteItemAsync("jwt");
    setSession(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signInWithGitHub,
        signOut,
        session,
        isLoading,
        user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
