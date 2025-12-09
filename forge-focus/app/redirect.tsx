import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function Redirect() {
  const router = useRouter();

  useEffect(() => {
    // Immediately go back or to login screen
    router.back();
  }, []);

  return <View />;
}
