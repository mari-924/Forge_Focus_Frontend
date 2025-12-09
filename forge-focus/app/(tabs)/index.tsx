import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { TabHeader } from '@/components/tab-header';
import { useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useSession } from '@/hooks/ctx';
import { useFocusEffect, useRouter, usePathname } from 'expo-router';
import { updateSession, deleteSession } from "@/api/sessions";

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
  
  const [editing, setEditing] = useState<FocusSession | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const router = useRouter();
  const pathname = usePathname(); 

  const loadSessions = useCallback(async () => {
    if (!email) return;

    const jwt = await SecureStore.getItemAsync('jwt');

    try {
      const res = await fetch(
        `${process.env?.EXPO_PUBLIC_API_URL}/sessions/user/${encodeURIComponent(email)}`,
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

  const startSessionWithDuration = (durationMinutes: number, id?: number) => {
    router.push({
      pathname: '/session',
      params: {
        duration: String(durationMinutes),
        sessionId: id ? String(id) : undefined,
        from: pathname,
      },
    });
  };

  // Save changes
  const saveEdit = async () => {
    if (!editing) return;

    await updateSession(editing.id, {
      durationMinutes: editing.durationMinutes,
      audioFile: editing.audioFile,
    });

    setModalVisible(false);
    loadSessions();
  };

  // Delete session
  const handleDelete = async () => {
    if (!editing) return;

    await deleteSession(editing.id);
    setModalVisible(false);
    loadSessions();
  };

  const openEditModal = (session: FocusSession) => {
    setEditing(session);
    setModalVisible(true);
  };

  return (
    <>
      {/* EDIT + DELETE MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Session</Text>

            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={String(editing?.durationMinutes || "")}
              onChangeText={(t) =>
                setEditing((prev) => ({ ...prev!, durationMinutes: Number(t) }))
              }
              placeholder="Duration (minutes)"
            />

            <TextInput
              style={styles.modalInput}
              value={editing?.audioFile || ""}
              placeholder="Music file name"
              onChangeText={(t) =>
                setEditing((prev) => ({ ...prev!, audioFile: t }))
              }
            />

            <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteText}>Delete Session</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: "white", marginTop: 12 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      {/* MAIN SCREEN */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          <TabHeader title="HOME PAGE" />

          <View style={styles.content}>
            
            {/* Previous Sessions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PREV SESSIONS</Text>

              {previousSessions.length === 0 ? (
                <Text style={styles.emptyText}>No sessions yet.</Text>
              ) : (
                <View style={styles.cardList}>
                  {previousSessions.map((s) => (
                    <View key={s.id} style={styles.card}>

                      <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => startSessionWithDuration(s.durationMinutes, s.id)}
                      >
                        <Text style={styles.cardTitle}>{s.title}</Text>
                        <Text style={styles.cardSubtitle}>
                          {s.audioFile ? `Time: ${s.durationMinutes} Minutes` : "No music"}
                          

                        </Text>
                        <Text style={styles.cardSubtitle}>
                          {s.audioFile ? `Music: ${s.audioFile}` : "No music"}
                          

                        </Text>
                      </TouchableOpacity>

                      {/* EDIT */}
                      <TouchableOpacity onPress={() => openEditModal(s)}>
                        <Text style={styles.icon}>Edit</Text>
                      </TouchableOpacity>
                    </View>
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
                    <View key={s.id} style={styles.card}>
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => startSessionWithDuration(s.durationMinutes, s.id)}
                      >
                        <Text style={styles.cardTitle}>{s.title}</Text>
                        <Text style={styles.cardSubtitle}>
                          {s.audioFile ? `Time: ${s.durationMinutes} Minutes` : "No music"}
                          

                        </Text>
                        <Text style={styles.cardSubtitle}>
                          {s.audioFile ? `Music: ${s.audioFile}` : "No music"}
                          

                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => openEditModal(s)}>
                      <Text style={styles.icon}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

          </View>
        </View>
      </ScrollView>
    </>
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
    letterSpacing: 1.5,
  },
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
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: '#E0EDE1',
    fontSize: 13,
  },
  icon: {
    fontSize: 24,
    color: "white",
    paddingHorizontal: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "80%",
    backgroundColor: "#4A6B4E",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: "#8FA892",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteBtn: {
    backgroundColor: "#B44141",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  deleteText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    color: "#FFFFFF",
    opacity: 0.7,
  },
});
