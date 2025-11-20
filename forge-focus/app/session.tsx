import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { TabHeader } from '@/components/tab-header';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function SessionScreen() {
  const params = useLocalSearchParams<{ duration: string }>();
  const duration = parseInt(params.duration || '0', 10); // Duration in minutes
  const durationInSeconds = duration * 60;

  const [remainingTime, setRemainingTime] = useState(durationInSeconds);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const progress = useSharedValue(1);

  const radius = 120;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  // Initialize progress when component mounts or duration changes
  useEffect(() => {
    progress.value = 1;
    setRemainingTime(durationInSeconds);
  }, [durationInSeconds]);

  useEffect(() => {
    if (isPlaying && remainingTime > 0) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            progress.value = withTiming(0, { duration: 300 });
            return 0;
          }
          const newTime = prev - 1;
          const newProgress = newTime / durationInSeconds;
          progress.value = withTiming(newProgress, { duration: 1000 });
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      startTimeRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, durationInSeconds, progress]);

  const handleReset = () => {
    setRemainingTime(durationInSeconds);
    setIsPlaying(false);
    progress.value = withTiming(1, { duration: 300 });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Memoize color calculation for better performance on Android
  const circleColor = useMemo(() => {
    const percentage = remainingTime / durationInSeconds;
    if (percentage > 0.66) return '#9ECAA3';
    if (percentage > 0.33) return '#6B8E6F';
    if (percentage > 0) return '#4A6B4E';
    return '#38633A';
  }, [remainingTime, durationInSeconds]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={styles.container}>
      <TabHeader title="FOCUS SESSION" />
      
      <View style={styles.content}>
        <View style={styles.timerContainer}>
          <Svg width={280} height={280} style={styles.svg}>
            {/* Background circle */}
            <Circle
              cx={140}
              cy={140}
              r={radius}
              stroke="#4A6B4E"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress circle */}
            <AnimatedCircle
              cx="140"
              cy="140"
              r={radius}
              stroke={circleColor}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeLinecap="round"
              transform="rotate(-90 140 140)"
              animatedProps={animatedProps}
            />
          </Svg>
          <View style={styles.timerTextContainer}>
            <Text style={styles.timerText}>{formatTime(remainingTime)}</Text>
          </View>
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
            onPress={handleReset}
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
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  timerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 280,
    height: 280,
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

