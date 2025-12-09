import { View, Text, StyleSheet, ActivityIndicator, Animated, Easing } from "react-native";
import { useEffect, useRef } from "react";
import { Image } from "expo-image";

export default function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Looping spin animation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* <Image
        source={require("@/assets/images/Forge-Focus-logo.png")}
        style={styles.logo}
      /> */}

      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </Animated.View>

      <Text style={styles.text}>Preparing your workspace...</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6B8E6F", // Your theme background
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 160,
    height: 80,
    marginBottom: 20,
    tintColor: "#FFFFFF",
  },
  text: {
    marginTop: 16,
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
    letterSpacing: 1,
  },
});
