import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { TabHeader } from '@/components/tab-header';
import { useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useSession } from '@/hooks/ctx';
import { useFocusEffect, router, usePathname, useRouter } from 'expo-router';

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
  
  const router = useRouter();
  const pathname = usePathname(); 

  const loadSessions = useCallback(async () => {
    if (!email) return;

    const jwt = await SecureStore.getItemAsync('jwt');

    try {
      const res = await fetch(
        `${process.env?.EXPO_PUBLIC_API_URL}/sessions/user/${encodeURIComponent(
          email
        )}`,
        {
          headers: {
            Authorization: jwt ? `Bearer ${jwt}` : '',
          },
        }
      );
      if (!res.ok) {
        console.log('Failed to load sessions', await res.text());
        return;
      }

      const data: UserSessionsResponse = await res.json();
      setPreviousSessions(data.previous || []);
      setScheduledSessions(data.scheduled || []);
    } catch (e) {
      console.log('Error loading sessions', e);
    }
  }, [email]);

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [loadSessions])
  );

  // Helper: go to session screen with timer set
  const startSessionWithDuration = (durationMinutes: number) => {
    console.log('Starting session from:', pathname);
  
    router.push({
      pathname: '/session',
      params: {
        duration: String(durationMinutes),
        from: pathname, // <-- pass where we came from
      },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.inner}>
        <TabHeader title="HOME PAGE" />

        <View style={styles.content}>
          {/* Friends Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FRIENDS</Text>
            <TouchableOpacity
              style={styles.sectionBar}
              onPress={() => {
                // TODO: navigate to friends screen
                console.log('Friends pressed');
              }}
            >
              <Text style={styles.sectionBarText}>View Friends</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Previous Sessions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PREV SESSIONS</Text>

            {previousSessions.length === 0 ? (
              <Text style={styles.emptyText}>No sessions yet.</Text>
            ) : (
              <View style={styles.cardList}>
                {previousSessions.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={styles.card}
                    activeOpacity={0.8}
                    onPress={() => {
                      // Start a new session using this session's duration
                      startSessionWithDuration(s.durationMinutes);
                    }}
                  >
                    <View style={styles.cardTextContainer}>
                      <Text style={styles.cardTitle}>
                        {s.title || `Session #${s.id}`}
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        {s.notes
                          ? s.notes
                          : s.audioFile
                          ? `Audio: ${s.audioFile}`
                          : 'No notes'}
                      </Text>
                    </View>
                    <Text style={styles.cardMeta}>
                      {s.durationMinutes} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          {/* Scheduled Sessions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SCHEDULED SESSIONS</Text>

            {scheduledSessions.length === 0 ? (
              <Text style={styles.emptyText}>No scheduled sessions.</Text>
            ) : (
              <View style={styles.cardList}>
                {scheduledSessions.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={styles.card}
                    activeOpacity={0.8}
                    onPress={() => {
                      // Start session with scheduled duration
                      startSessionWithDuration(s.durationMinutes);
                    }}
                  >
                    <View style={styles.cardTextContainer}>
                      <Text style={styles.cardTitle}>
                        {s.title || `Session #${s.id}`}
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        {s.notes
                          ? s.notes
                          : s.audioFile
                          ? `Audio: ${s.audioFile}`
                          : 'No notes'}
                      </Text>
                    </View>
                    <Text style={styles.cardMeta}>
                      {s.durationMinutes} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
    paddingBottom: 4,
  },

  // Friends bar
  sectionBar: {
    width: '100%',
    backgroundColor: '#4A6B4E',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 60,
  },
  sectionBarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '200',
    lineHeight: 36,
  },

  // Cards
  cardList: {
    gap: 12,
  },
  card: {
    width: '100%',
    backgroundColor: '#4A6B4E',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 64,
  },
  cardTextContainer: {
    flexShrink: 1,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#E0EDE1',
    fontSize: 13,
  },
  cardMeta: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },

  emptyText: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
  },
});