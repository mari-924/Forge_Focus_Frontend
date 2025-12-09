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
import { TabHeader } from '@/components/tab-header';
import * as SecureStore from 'expo-secure-store';

type Phase = 'prep' | 'study' | 'break';

export default function SessionScreen() {
  const params = useLocalSearchParams<{
    duration: string;
    sessionId?: string;
    from?: string;
  }>();
  const sessionId = params.sessionId;

  const duration = parseInt(params.duration || '0', 10);
  const durationInSeconds = duration * 60;

  const totalNonPrepDurationInSeconds = durationInSeconds || 25 * 60;

  // Durations per phase
  const prepDurationInSeconds = 5 * 60;      // 5 min prep
  const studyDurationInSeconds = 25 * 60;    // 25 min study
  const breakDurationInSeconds = 5 * 60;     // 5 min break

  // Phase: 'prep' -> 'study' <-> 'break'
  const [phase, setPhase] = useState<Phase>('prep');
  const [remainingTime, setRemainingTime] = useState(prepDurationInSeconds);
  const [isPlaying, setIsPlaying] = useState(false);

  // Track how much non-prep time is left in the entire session
  const [totalRemaining, setTotalRemaining] = useState(totalNonPrepDurationInSeconds);
  const [isFinished, setIsFinished] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progress = useSharedValue(1);

  const router = useRouter();

  // Reset when the total non-prep duration changes (e.g., new route params)
  useEffect(() => {
    setPhase('prep');
    setRemainingTime(prepDurationInSeconds);
    setIsPlaying(false);
    setIsFinished(false);
    setTotalRemaining(totalNonPrepDurationInSeconds);
    progress.value = 1;
  }, [totalNonPrepDurationInSeconds]);

  useEffect(() => {
    if (!isPlaying || isFinished) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      // 1) Handle per-phase countdown + phase transitions
      setRemainingTime((prev) => {
        if (prev <= 1) {
          // Phase finished -> switch to next (unless session is over by totalRemaining)
          let nextPhase: Phase;
          let nextDuration: number;

          if (phase === 'prep') {
            nextPhase = 'study';
            nextDuration = studyDurationInSeconds || 1;
          } else if (phase === 'study') {
            nextPhase = 'break';
            nextDuration = breakDurationInSeconds;
          } else {
            // from 'break' back to 'study'
            nextPhase = 'study';
            nextDuration = studyDurationInSeconds || 1;
          }

          setPhase(nextPhase);
          progress.value = withTiming(1, { duration: 300 });

          return nextDuration;
        }

        // Still in current phase
        const phaseTotal =
          phase === 'prep'
            ? prepDurationInSeconds
            : phase === 'study'
            ? studyDurationInSeconds || 1
            : breakDurationInSeconds;

        const newTime = prev - 1;
        const newProgress = newTime / phaseTotal;

        progress.value = withTiming(newProgress, { duration: 1000 });
        return newTime;
      });

      // 2) Handle total non-prep countdown
      setTotalRemaining((prevTotal) => {
        // Do NOT count prep towards the total
        if (phase === 'prep') return prevTotal;

        if (prevTotal <= 1) {
          // Session is done (non-prep time exhausted)
          setIsPlaying(false);
          setIsFinished(true);
          progress.value = withTiming(0, { duration: 300 });

          // Optional: auto-mark session complete
          completeSession();

          return 0;
        }

        return prevTotal - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    isPlaying,
    isFinished,
    phase,
    prepDurationInSeconds,
    studyDurationInSeconds,
    breakDurationInSeconds,
    completeSession,
    progress,
  ]);

  const handleReset = () => {
    setPhase('prep');
    setRemainingTime(prepDurationInSeconds);
    setIsPlaying(false);
    setIsFinished(false);
    setTotalRemaining(totalNonPrepDurationInSeconds);
    progress.value = withTiming(1, { duration: 300 });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const completeSession = async () => {
    if (!sessionId) return;
    const jwt = await SecureStore.getItemAsync('jwt');

    try {
      await fetch(`${process.env?.EXPO_PUBLIC_API_URL}/sessions/${sessionId}/complete`, {
        method: 'PATCH',
        headers: {
          Authorization: jwt ? `Bearer ${jwt}` : '',
        },
      });
    } catch (e) {
      console.log('Failed to mark session complete', e);
    }
  };

  const handleEndSession = async () => {
    await completeSession();
    router.push('/');
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getCircleColor = () => {
    if (isFinished) {
      return '#38633A';
    }

    const phaseTotal =
      phase === 'prep'
        ? prepDurationInSeconds
        : phase === 'study'
        ? studyDurationInSeconds || 1
        : breakDurationInSeconds;

    const percentage = remainingTime / phaseTotal;

    if (percentage > 0.66) return '#9ECAA3';
    if (percentage > 0.33) return '#4A6B4E';
    if (percentage > 0) return '#4A6B4E';
    return '#38633A';
  };

  const animatedRingStyle = useAnimatedStyle(() => {
    const scale = progress.value;
    return {
      transform: [{ scale }],
    };
  });

  const animatedProgressStyle = useAnimatedStyle(() => {
    const opacity = 1 - progress.value;
    return {
      opacity: opacity * 0.3,
    };
  });

  const displayTime = isFinished ? '00:00' : formatTime(remainingTime);
  const totalDisplayTime = formatTime(Math.max(totalRemaining, 0)); // small total non-prep timer
  const circleColor = getCircleColor();

  const phaseLabelText = isFinished
    ? 'SESSION COMPLETE'
    : phase === 'prep'
    ? 'PREP TIME'
    : phase === 'study'
    ? 'STUDY TIME'
    : 'BREAK TIME';

  return (
    <View style={styles.container}>
      <TabHeader title="FOCUS SESSION" />
      
      <View style={styles.content}>
        {/* Small total non-prep timer */}
        <View style={styles.totalTimerContainer}>
          <Text style={styles.totalTimerLabel}>SESSION TIME LEFT</Text>
          <Text style={styles.totalTimerText}>{totalDisplayTime}</Text>
          {/* If you literally want seconds instead:
              <Text style={styles.totalTimerText}>{totalRemaining}s</Text>
           */}
        </View>

        <View style={styles.timerContainer}>
          {/* Outer ring (background) */}
          <View style={[styles.circleRing, styles.circleRingBackground]} />
          
          {/* Progress ring (animated) */}
          <Animated.View 
            style={[
              styles.circleRing, 
              { 
                borderColor: circleColor,
                backgroundColor: circleColor + '20',
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
            <Text style={styles.phaseLabel}>{phaseLabelText}</Text>
            <Text style={styles.timerText}>{displayTime}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              isFinished && { opacity: 0.6 },
            ]}
            onPress={() => {
              if (isFinished) return; // avoid restarting without reset
              setIsPlaying((prev) => !prev);
            }}
          >
            <Text style={styles.controlButtonText}>
              {isFinished ? 'FINISHED' : isPlaying ? 'PAUSE' : 'START'}
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
    gap: 32,
  },
  totalTimerContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  totalTimerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E6F2E7',
    letterSpacing: 1,
    marginBottom: 2,
  },
  totalTimerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
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