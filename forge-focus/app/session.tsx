import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TabHeader } from '@/components/tab-header';

export default function SessionScreen() {
  const params = useLocalSearchParams<{ duration: string }>();
  const duration = parseInt(params.duration || '0', 10); // Duration in minutes
  const durationInSeconds = duration * 60;

  const [isPlaying, setIsPlaying] = useState(false);
  const [key, setKey] = useState(0);

  const handleComplete = () => {
    // Timer completed
    setIsPlaying(false);
    return { shouldRepeat: false };
  };

  const formatTime = (remainingTime: number) => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <TabHeader title="FOCUS SESSION" />
      
      <View style={styles.content}>
        <View style={styles.timerContainer}>
          <CountdownCircleTimer
            key={key}
            isPlaying={isPlaying}
            duration={durationInSeconds}
            colors={['#9ECAA3', '#6B8E6F', '#4A6B4E', '#38633A']}
            colorsTime={[durationInSeconds, durationInSeconds * 0.66, durationInSeconds * 0.33, 0]}
            size={280}
            strokeWidth={20}
            onComplete={handleComplete}
          >
            {({ remainingTime }) => (
              <View style={styles.timerTextContainer}>
                <Text style={styles.timerText}>{formatTime(remainingTime)}</Text>
              </View>
            )}
          </CountdownCircleTimer>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <Text style={styles.controlButtonText}>
              {isPlaying ? 'PAUSE' : 'START'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {
              setKey((prev) => prev + 1);
              setIsPlaying(false);
            }}
          >
            <Text style={styles.controlButtonText}>RESET</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => router.back()}
          >
            <Text style={styles.controlButtonText}>END SESSION</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B8E6F',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 40,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  controls: {
    gap: 20,
    width: '100%',
    maxWidth: 300,
  },
  controlButton: {
    backgroundColor: '#38633A',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 2,
    fontSize: 16,
  },
});

