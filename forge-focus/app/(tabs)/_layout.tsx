import { Image } from 'expo-image';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { useSession } from '@/hooks/ctx';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { session, isLoading } = useSession();
  if (isLoading) return null;
  if (!session) return <Redirect href="/login" />;
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#8FA892',
        tabBarInactiveTintColor: '#6B8E6F',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#4A6B4E', 
          borderTopWidth: 0,
        },
      }}>
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Forge',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/assets/images/anvil.png')}
              style={{ 
                width: 28, 
                height: 28,
                opacity: focused ? 1 : 0.6,
              }}
              contentFit="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/assets/images/home-5-xxl.png')}
              style={{ 
                width: 28, 
                height: 28,
                opacity: focused ? 1 : 0.6,
              }}
              contentFit="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/assets/images/user-xxl.png')}
              style={{ 
                width: 28, 
                height: 28,
                opacity: focused ? 1 : 0.6,
              }}
              contentFit="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="session"
        options={{
          href: null   
        }}
      />
    </Tabs>
  );
}
