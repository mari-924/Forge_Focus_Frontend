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
  import { signInOrCreateUser } from "@/api/api";
  import useAuth0 from "@/app/auth";

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
    
    username: g.name ?? "",
    email: g.email,
    profile_pic: g.photo ?? null,
  });

  const mapGithubToUser = (gh: any): NewUser => ({
    googleId: null,
    username: gh.login ?? "",
    email: gh.email ?? "",
    profile_pic: gh.avatar_url ?? null,
  });

  export function SessionProvider({ children }: PropsWithChildren) {
    const { login } = useAuth0();

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
        const backendUser = await signInOrCreateUser();
        setUser(backendUser);
        setSession(googleUser.email);
        return dbUser;
      } finally {
        isSigningInRef.current = false;
      }
    }, [setSession]);

    
    const signInWithGitHub = useCallback(async () => {
      const auth = await login("github");
      if (!auth) return null;
    
      const { profile: rawProfile, tokens } = auth;
      const profile: any = rawProfile;
    
      // 1️⃣ Send Auth0 ID token to backend for verification
      const backend = await verifyGithubToken(tokens.id_token);
      await SecureStore.setItemAsync("jwt", backend.access_token);
    
      // 2️⃣ Use profile values for local DB
      const gh = {
        username: profile.nickname ?? profile.name ?? "GitHub User",
        email: profile.email,
        avatar_url: profile.picture,
        id: profile.sub.replace("github|", "")
      };
    
      // 3️⃣ Upsert to SQLite
      let dbUser = await users.getByEmail(gh.email);
      if (!dbUser) {
        await db.withTransactionAsync(async () => {
          dbUser = await users.create({
            googleId: null,
            username: gh.username,
            email: gh.email,
            profile_pic: gh.avatar_url,
          });
        });
      }
    
      // 4️⃣ Backend ensures user exists
      const backendUser = await signInOrCreateUser();
      setUser(backendUser);
    
      // 5️⃣ Persist session email
      setSession(gh.email);
    
      return dbUser;
    }, [setSession]);
    
    
    useEffect(() => {
      console.log("🔵 SESSION CHANGED:", session);
    }, [session]);

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
