  import {
    useContext,
    createContext,
    type PropsWithChildren,
    useEffect,
    useCallback,
    useRef, useState
  } from "react";
  import {
    GoogleSignin,
    statusCodes,
    isSuccessResponse,
  } from "@react-native-google-signin/google-signin";
  import { Platform } from "react-native";
  import { useStorageState } from "./useStorageState";
  import { useRepos } from "@/db/index";
  import * as SecureStore from "expo-secure-store";
  import { verifyGoogleToken, signInOrCreateUser } from "@/api/api";
  import type { User, NewUser, GoogleUser } from "@/types/types";

  const API_BASE_URL =
    (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) ??
    "https://focus-forge-cst438-38b937c199bc.herokuapp.com";

    type AuthContextType = {
      signIn: () => Promise<User | null>;
      signOut: () => Promise<void>;
      session: string | null;
      isLoading: boolean;
      user: User | null;
      setUser: (user: User | null) => void;
    };

    const AuthContext = createContext<AuthContextType>({
      signIn: async () => null,
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
    username: g.name ?? "", // Google may return null name
    email: g.email,
    profile_pic: g.photo ?? null,
  });

  export function SessionProvider({ children }: PropsWithChildren) {
    const [[isLoading, session], setSession] = useStorageState("session");
    const [user, setUser] = useState<User | null>(null);
    const { db,users } = useRepos();

    const isSigningInRef = useRef(false);

    useEffect(() => {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
        forceCodeForRefreshToken: false,
        profileImageSize: 128,
      });
    }, []);

    const signIn = useCallback(async (): Promise<User | null> => {
      if (isSigningInRef.current) return null;
      isSigningInRef.current = true;

      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      const res = await GoogleSignin.signIn();
      if (!isSuccessResponse(res)) return null;

      const { user: googleUser, idToken } = res.data;
      if (!idToken) return null;

      // Verify token with backend
      const { access_token } = await verifyGoogleToken(idToken);
      console.log("Backend JWT:", access_token);
      await SecureStore.setItemAsync("jwt", access_token);
      // Create or retrieve user
      let dbUser = await users.getByGoogleId(googleUser.id);
              if (!dbUser) {
                await db.withTransactionAsync(async () => {
                  dbUser = await users.create(mapGoogleToUser(googleUser));
                });
              }
      console.log("Signed in as:", dbUser);

      if (!dbUser) {
        await db.withTransactionAsync(async () => {
          dbUser = await users.create(mapGoogleToUser(googleUser));
        });
      }
      setUser(dbUser); 
      setSession(googleUser.email);

      isSigningInRef.current = false;
      return dbUser;
    }, [setSession]);

    const signOut = useCallback(async () => {
      try {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
        await SecureStore.deleteItemAsync("jwt");
      } finally {
        setSession(null);
      }
    }, [setSession]);

    return (
      <AuthContext.Provider value={{ signIn, signOut, session, isLoading, user, setUser }}>
        {children}
      </AuthContext.Provider>
    );
  }
