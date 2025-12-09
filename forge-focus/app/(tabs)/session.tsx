import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { TabHeader } from '@/components/tab-header';
import * as SecureStore from 'expo-secure-store';

// Map audio choices to local bundled assets. Only LOFI currently supported.
const getAudioSource = (audioType: string) => {
  switch (audioType) {
    case 'LOFI':
      return require('@/assets/lofi/25_lofi_time.m4a');
    default:
      return null; // NO AUDIO
  }
};

export default function SessionScreen() {
  const params = useLocalSearchParams<{
    duration: string;
    audio?: string;
    sessionId?: string;
    from?: string;
  }>();
  const sessionId = params.sessionId;
  const duration = parseInt(params.duration || '0', 10);
  const durationInSeconds = duration * 60;
  const audioType = params.audio || 'NO AUDIO';

  // Prep duration (5 minutes)
  const prepDurationInSeconds = 5 * 60;

  const [remainingTime, setRemainingTime] = useState(prepDurationInSeconds);
  const [isPlaying, setIsPlaying] = useState(false);

  // NEW: track whether we're in prep or main session
  const [isPrepPhase, setIsPrepPhase] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const progress = useSharedValue(1);

  const router = useRouter();

  // Initialize audio
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const audioSource = getAudioSource(audioType);
        if (audioSource) {
          const { sound } = await Audio.Sound.createAsync(
            audioSource,
            { 
              isLooping: true,
              volume: 0.5, // Adjust volume (0.0 to 1.0)
              shouldPlay: false,
            }
          );
          soundRef.current = sound;
        }
      } catch (error) {
        console.log('Error setting up audio:', error);
      }
    };

    setupAudio();

    // Cleanup audio on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [audioType]);

  // Initialize progress when component mounts or duration changes
  useEffect(() => {
    setIsPrepPhase(true);
    setRemainingTime(prepDurationInSeconds);
    progress.value = 1;
  }, [durationInSeconds]);

  // Control audio playback based on timer state
  useEffect(() => {
    const controlAudio = async () => {
      if (!soundRef.current) return;

      try {
        if (isPlaying && remainingTime > 0) {
          // Play audio when timer starts
          const status = await soundRef.current.getStatusAsync();
          if (!status.isLoaded || !status.isPlaying) {
            await soundRef.current.playAsync();
          }
        } else {
          // Pause audio when timer pauses or stops
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded && status.isPlaying) {
            await soundRef.current.pauseAsync();
          }
        }
      } catch (error) {
        console.log('Error controlling audio:', error);
      }
    };

    controlAudio();
  }, [isPlaying, remainingTime]);

  useEffect(() => {
    if (isPlaying && remainingTime > 0) {
      
      intervalRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            // Phase just ended
            if (isPrepPhase) {
              // Prep finished -> start main session automatically
              setIsPrepPhase(false);
              // Reset progress bar for the main session
              progress.value = withTiming(1, { duration: 300 });
              return durationInSeconds; // start main session full
            } else {
              // Main session finished
              setIsPlaying(false);
              progress.value = withTiming(0, { duration: 300 });
              // Stop audio when timer ends
              if (soundRef.current) {
                soundRef.current.stopAsync();
              }
              return 0;
            }
          }

          // Still in current phase: decrement
          const phaseTotal = isPrepPhase
            ? prepDurationInSeconds
            : durationInSeconds || 1; // avoid divide-by-zero

          const newTime = prev - 1;
          const newProgress = newTime / phaseTotal;

          progress.value = withTiming(newProgress, { duration: 1000 });
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, isPrepPhase, durationInSeconds, progress]);

  const handleReset = async () => {
    // Reset back to prep phase
    setIsPrepPhase(true);
    setRemainingTime(prepDurationInSeconds);
    setIsPlaying(false);
    progress.value = withTiming(1, { duration: 300 });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Stop and reset audio
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.setPositionAsync(0);
      } catch (error) {
        console.log('Error resetting audio:', error);
      }
    }
  };

  const completeSession = async () => {
    if (!sessionId) return;
    const jwt = await SecureStore.getItemAsync("jwt");
  
    try {
      await fetch(`${process.env?.EXPO_PUBLIC_API_URL}/sessions/${sessionId}/complete`, {
        method: "PATCH",
        headers: {
          Authorization: jwt ? `Bearer ${jwt}` : "",
        },
      });
    } catch (e) {
      console.log("Failed to mark session complete", e);
    }
  };
  
  const handleEndSession = async () => {
    // Stop audio before ending session
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      } catch (error) {
        console.log('Error stopping audio:', error);
      }
    }
    await completeSession();
    router.push('/');
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Calculate color based on remaining time for current phase
  const getCircleColor = () => {
    const phaseTotal = isPrepPhase
      ? prepDurationInSeconds
      : durationInSeconds || 1;
    const percentage = remainingTime / phaseTotal;

    if (percentage > 0.66) return '#9ECAA3';
    if (percentage > 0.33) return '#6B8E6F';
    if (percentage > 0) return '#4A6B4E';
    return '#38633A';
  };

  // Animated style for the progress ring
  const animatedRingStyle = useAnimatedStyle(() => {
    const scale = progress.value;
    return {
      transform: [{ scale }],
    };
  });

  // Animated style for the inner circle (shows progress)
  const animatedProgressStyle = useAnimatedStyle(() => {
    const opacity = 1 - progress.value;
    return {
      opacity: opacity * 0.3,
    };
  });

  const displayTime = formatTime(remainingTime);
  const circleColor = getCircleColor();

  return (
    <View style={styles.container}>
      <TabHeader title="FOCUS SESSION" />
      
      <View style={styles.content}>
        <View style={styles.timerContainer}>
          {/* Outer ring (background) */}
          <View style={[styles.circleRing, styles.circleRingBackground]} />
          
          {/* Progress ring (animated) */}
          <Animated.View 
            style={[
              styles.circleRing, 
              { 
                borderColor: circleColor,
                backgroundColor: circleColor + '20', // Add transparency
              },
              animatedRingStyle
            ]} 
          />
          
          {/* Inner progress fill */}
          <Animated.View 
            style={[
              styles.circleInner,
              { backgroundColor: circleColor },
              animatedProgressStyle
            ]} 
          />
          
          {/* Timer text */}
          <View style={styles.timerTextContainer}>
            <Text style={styles.phaseLabel}>
              {isPrepPhase ? 'PREP TIME' : 'FOCUS TIME'}
            </Text>
            <Text style={styles.timerText}>{displayTime}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setIsPlaying((prev) => !prev)}
          >
            <Text style={styles.controlButtonText}>
              {isPlaying ? 'PAUSE' : 'START'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleReset}
          >
            <Text style={styles.controlButtonText}>RESET</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleEndSession}
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
    width: 280,
    height: 280,
    position: 'relative',
  },
  circleRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 20,
  },
  circleRingBackground: {
    borderColor: '#4A6B4E',
    backgroundColor: 'transparent',
  },
  circleInner: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    top: 20,
    left: 20,
  },
  timerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 280,
    height: 280,
    position: 'absolute',
    zIndex: 10,
  },
  phaseLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 4,
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