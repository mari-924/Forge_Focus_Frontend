import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { TabHeader } from '@/components/tab-header';
import { useSession } from '@/hooks/ctx';
import * as SecureStore from 'expo-secure-store';


const increments = [30, 60];
const audioOptions = ['NO AUDIO', 'RAIN', 'JAZZ', 'LOFI'];

export default function ExploreScreen() {
  const { session: email } = useSession();

  const [minutes, setMinutes] = useState(0);
  const [selectedIncrement, setSelectedIncrement] = useState<number | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);

  const resetForm = () => {
    setMinutes(0);
    setSelectedIncrement(null);
    setSelectedAudio(null);
  };

  const createSessionOnServer = async (options: { scheduled: boolean }) => {
    if (!email) return;

    const jwt = await SecureStore.getItemAsync("jwt");

    const body = {
      title: options.scheduled ? "Scheduled Focus Session" : "Focus Session",
      durationMinutes: minutes,
      audioFile: selectedAudio || 'NO AUDIO',
      isPrev: false,
      notes: null,
    };

    const res = await fetch(
      `${process.env?.EXPO_PUBLIC_API_URL}/sessions?hostEmail=${encodeURIComponent(email)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: jwt ? `Bearer ${jwt}` : "",
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      console.log("Failed to create session", await res.text());
      return null;
    }

    const created = await res.json();
    return created;
  };
  // Format time as MM:00 for display only
  const formatTime = (mins: number) => {
    return `${String(mins).padStart(2, '0')}:00`;
  };

  // Sets the increment amount for arrows
  const selectIncrement = (mins: number) => {
    setSelectedIncrement(mins);
  };

  // Select audio option
  const selectAudio = (audio: string) => {
    setSelectedAudio(audio);
  };

  // Adjust timer with arrows (minimum 60 minutes)
  const adjustTimer = (delta: number) => {
    if (selectedIncrement !== null) {
      const incrementAmount = delta > 0 ? selectedIncrement : -selectedIncrement;
      const newMinutes = Math.max(60, minutes + incrementAmount);
      setMinutes(newMinutes);
    }
  };

  // Navigate to session page with selected duration and audio
  const handleScheduleSession = async () => {
    if (minutes === 0) return;

    const sessionFromServer = await createSessionOnServer({ scheduled: true });
    if (!sessionFromServer) return;

    resetForm();
    router.push('/(tabs)'); 
  };

  // Navigate to session page with selected duration and audio (minimum 60 minutes)
  const handleCreateSession = async () => {
    if (minutes < 60) return;

    const sessionFromServer = await createSessionOnServer({ scheduled: false });
    if (!sessionFromServer) return;

    router.push({
      pathname: '/session',
      params: { 
        duration: minutes.toString(),
        audio: selectedAudio || 'NO AUDIO',
        sessionId: sessionFromServer.id?.toString() ?? '',
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TabHeader title="FORGE SESSION" />

        <Section title="Increment By:">
          <View style={styles.pillRow}>
            {increments.map((value) => (
              <TouchableOpacity
                key={value}
                activeOpacity={0.8}
                style={[
                  styles.pill,
                  selectedIncrement === value && styles.pillSelected,
                ]}
                onPress={() => {
                  selectIncrement(value);
                  // Set minimum to 60 if current time is less
                  if (minutes < 60) {
                    setMinutes(60);
                  }
                }}
              >
                <Text style={styles.pillValue}>{value === 60 ? '1' : value}</Text>
                <Text style={styles.pillLabel}>{value === 60 ? 'HOUR' : 'MINUTES'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        <Section title="Timer:">
          <View style={styles.timerCard}>
            <Text style={styles.timerValue}>{formatTime(minutes)}</Text>
            <View style={styles.timerButtons}>
              <TouchableOpacity 
                style={[styles.arrowButton, selectedIncrement === null && styles.arrowButtonDisabled]}
                onPress={() => adjustTimer(1)}
                disabled={selectedIncrement === null}
              >
                <Image
                  source={require('@/assets/images/up-arrow.png')}
                  style={[
                    styles.arrowImage,
                    selectedIncrement === null && styles.arrowImageDisabled
                  ]}
                  contentFit="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.arrowButton, selectedIncrement === null && styles.arrowButtonDisabled]}
                onPress={() => adjustTimer(-1)}
                disabled={selectedIncrement === null}
              >
                <Image
                  source={require('@/assets/images/up-arrow.png')}
                  style={[
                    styles.arrowImage,
                    styles.arrowImageDown,
                    selectedIncrement === null && styles.arrowImageDisabled
                  ]}
                  contentFit="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        </Section>

        <Section title="Audio:">
          <View style={styles.pillRow}>
            {audioOptions.map((option) => (
              <TouchableOpacity
                key={option}
                activeOpacity={0.8}
                style={[
                  styles.pill,
                  selectedAudio === option && styles.pillSelected,
                ]}
                onPress={() => selectAudio(option)}
              >
                <Text style={styles.pillText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        <TouchableOpacity 
          style={[styles.ctaButton, minutes < 60 && styles.ctaButtonDisabled]}
          onPress={handleCreateSession}
          disabled={minutes < 60}
        >
          <Text style={styles.ctaText}>CREATE SESSION</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.ctaButton, minutes === 0 && styles.ctaButtonDisabled]}
          onPress={handleScheduleSession}
          disabled={minutes === 0}
        >
          <Text style={styles.ctaText}>SCHEDULE SESSION</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B8E6F',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 140,
    gap: 30,
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    letterSpacing: 2,
  },
  sectionBody: {
    backgroundColor: '#4F6F52',
    borderRadius: 16,
    padding: 16,
  },
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  pill: {
    flex: 1,
    minWidth: 70,
    backgroundColor: '#38633A',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pillSelected: {
    backgroundColor: '#5A7A5D',
    borderWidth: 2,
    borderColor: '#5A7A5D',
  },
  pillValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  pillLabel: {
    fontSize: 11,
    letterSpacing: 1,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  pillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#38633A',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  timerValue: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  timerButtons: {
    gap: 18,
  },
  arrowButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  arrowButtonDisabled: {
    opacity: 0.4,
  },
  arrowImage: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  arrowImageDown: {
    transform: [{ rotate: '180deg' }],
  },
  arrowImageDisabled: {
    opacity: 0.5,
  },
  ctaButton: {
    alignSelf: 'center',
    backgroundColor: '#38633A',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
  navIcon: {
    width: 34,
    height: 34,
    tintColor: '#FFFFFF',
  },
});
