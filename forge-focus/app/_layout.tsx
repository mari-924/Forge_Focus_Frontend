import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SQLiteProvider } from 'expo-sqlite';
import { initDB } from '@/db/innit';
import { SessionProvider } from '@/hooks/ctx';
import { StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Slot, Stack } from 'expo-router';



export default function RootLayout() {
  const colorScheme = useColorScheme();
 
  return (
    <GestureHandlerRootView style = {styles.container}>
    <SQLiteProvider databaseName='flexzone_database.db' onInit={initDB} >
    <SessionProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="session" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
    <StatusBar style="auto" />
    </ThemeProvider>
    </SessionProvider>
    </SQLiteProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
  },
});