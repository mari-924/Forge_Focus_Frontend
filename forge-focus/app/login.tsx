import { Image } from "expo-image";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSession } from "@/hooks/ctx";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";

export default function LoginScreen() {
  const { signIn, signInWithGitHub, session } = useSession();
  const [loggingIn, setLoggingIn] = useState(false);

  // Auto-navigate when session updates
  useEffect(() => {
    if (loggingIn && session) {
      setLoggingIn(false);
      router.replace("/(tabs)");
    }
  }, [session, loggingIn]);

  const handleGoogleLogin = async () => {
    if (loggingIn) return;
    setLoggingIn(true);
    try {
      await signIn();
    } catch (e) {
      console.error(e);
      setLoggingIn(false);
    }
  };

  const handleGitHubLogin = async () => {
    if (loggingIn) return;
    setLoggingIn(true);
    try {
      await signInWithGitHub();
    } catch (e) {
      console.error(e);
      setLoggingIn(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* 🔥 FULLSCREEN LOADING OVERLAY */}
      {loggingIn && (
        <View style={styles.loadingOverlay}>
          <LoadingScreen />
        </View>
      )}

      {/* NORMAL LOGIN UI */}
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/Forge-Focus-logo.png")}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      <Text style={styles.loginLabel}>LOGIN</Text>

      <View style={styles.inputsContainer}>
        <TextInput
          style={styles.input}
          placeholder="ENTER EMAIL..."
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="ENTER PASSWORD..."
          placeholderTextColor="#999"
          secureTextEntry
        />
      </View>

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialContainer}>
        <TouchableOpacity
          style={styles.socialIcon}
          onPress={handleGoogleLogin}
          disabled={loggingIn}
        >
          <Image
            source={require("@/assets/images/google-logo.png")}
            style={styles.socialLogo}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialIcon}
          onPress={handleGitHubLogin}
          disabled={loggingIn}
        >
          <Image
            source={require("@/assets/images/git-hub-logo.png")}
            style={styles.socialLogo}
          />
        </TouchableOpacity>
      </View>

      {/* NORMAL LOGIN + BACK BUTTONS */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.loginButton, loggingIn && { opacity: 0.3 }]}
          disabled={loggingIn}
          onPress={() => router.push("/(tabs)")}
        >
          <Text style={styles.loginButtonText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, loggingIn && { opacity: 0.3 }]}
          disabled={loggingIn}
          onPress={() => router.push("/")}
        >
          <Text style={styles.loginButtonText}>BACK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6B8E6F",
    alignItems: "center",
    justifyContent: "center",
  },

  // 🔥 FULL SCREEN overlay for loading screen
  loadingOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "#6B8E6F",
    zIndex: 20,
  },

  logoContainer: { marginBottom: 20 },
  logo: { width: 200, height: 100 },
  loginLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 30,
    letterSpacing: 2,
  },
  inputsContainer: {
    width: "100%",
    maxWidth: 350,
    marginBottom: 30,
    gap: 15,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#CCC",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 350,
    width: "100%",
    marginBottom: 30,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#FFF" },
  dividerText: { marginHorizontal: 15, color: "#FFF", fontWeight: "600" },
  socialContainer: { flexDirection: "row", gap: 30, marginBottom: 40 },
  socialIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  socialLogo: { width: 40, height: 40 },
  buttonsContainer: { width: "100%", maxWidth: 350, gap: 15 },
  loginButton: {
    width: "100%",
    backgroundColor: "#8FA892",
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    letterSpacing: 2,
  },
});
