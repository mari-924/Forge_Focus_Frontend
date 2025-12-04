import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TabHeader } from '@/components/tab-header';
import { useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useSession } from '@/hooks/ctx';
import { useFocusEffect } from 'expo-router';

type FocusSession = {
  id: number;
  title: string;
  durationMinutes: number;
  audioFile: string | null;
  isPrev: boolean;
  notes: string | null;
};

type UserSessionsResponse = {
  previous: FocusSession[];
  scheduled: FocusSession[];
};


export default function HomeScreen() {
  const { session: email } = useSession();
  const [previousSessions, setPreviousSessions] = useState<FocusSession[]>([]);
  const [scheduledSessions, setScheduledSessions] = useState<FocusSession[]>([]);

  const loadSessions = useCallback(async () => {
    if (!email) return;

    const jwt = await SecureStore.getItemAsync("jwt");

    try {
      const res = await fetch(
        `${process.env?.EXPO_PUBLIC_API_URL}/sessions/user/${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: jwt ? `Bearer ${jwt}` : "",
          },
        }
      );
      if (!res.ok) {
        console.log("Failed to load sessions", await res.text());
        return;
      }

      const data: UserSessionsResponse = await res.json();
      setPreviousSessions(data.previous || []);
      setScheduledSessions(data.scheduled || []);
    } catch (e) {
      console.log("Error loading sessions", e);
    }
  }, [email]);

  // Run whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [loadSessions])
  );
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.inner}>
        <TabHeader title="HOME PAGE" />

        <View style={styles.content}>

          {/* Friends Section (unchanged for now) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FRIENDS</Text>
            <View style={styles.sectionBar}>
              <Text style={styles.chevron}>›</Text>
            </View>
          </View>

          {/* Previous Sessions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PREV SESSIONS</Text>
            <View style={styles.sectionBarList}>
              {previousSessions.length === 0 ? (
                <Text style={styles.emptyText}>No sessions yet.</Text>
              ) : (
                previousSessions.map((s) => (
                  <View key={s.id} style={styles.sessionRow}>
                    <Text style={styles.sessionTitle}>
                      {s.title || `Session #${s.id}`}
                    </Text>
                    <Text style={styles.sessionMeta}>
                      {s.durationMinutes} min · {s.audioFile || 'NO AUDIO'}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Scheduled Sessions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SCHEDULED SESSIONS</Text>
            <View style={styles.sectionBarList}>
              {scheduledSessions.length === 0 ? (
                <Text style={styles.emptyText}>No scheduled sessions.</Text>
              ) : (
                scheduledSessions.map((s) => (
                  <View key={s.id} style={styles.sessionRow}>
                    <Text style={styles.sessionTitle}>
                      {s.title || `Session #${s.id}`}
                    </Text>
                    <Text style={styles.sessionMeta}>
                      {s.durationMinutes} min · {s.audioFile || 'NO AUDIO'}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B8E6F', 
  },
  scrollContent: {
    paddingBottom: 40,
  },
  inner: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  sectionBarList: {
    width: '100%',
    backgroundColor: '#4A6B4E',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  sessionRow: {
    paddingVertical: 4,
  },
  sessionTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  sessionMeta: {
    color: '#D7E2D8',
    fontSize: 12,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
  },
  content: {
    gap: 30,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF', 
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    paddingTop: 8,
    paddingBottom: 4
  },
  sectionBar: {
    width: '100%',
    backgroundColor: '#4A6B4E', 
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    minHeight: 60,
    maxHeight: 80,
  },
  chevron: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '200',
    lineHeight: 36,
  },
});
