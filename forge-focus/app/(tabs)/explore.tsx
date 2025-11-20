import { Image } from 'expo-image';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const increments = [30, 45, 50, 60];
const audioOptions = ['NO AUDIO', 'RAIN', 'TRAIN', 'LOFI'];

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/Forge-Focus-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.headerTitle}>FORGE SESSION</Text>
        </View>

        <Section title="Increment By:">
          <View style={styles.pillRow}>
            {increments.map((value) => (
              <TouchableOpacity
                key={value}
                activeOpacity={0.8}
                style={styles.pill}
              >
                <Text style={styles.pillValue}>{value}</Text>
                <Text style={styles.pillLabel}>MINUTES</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        <Section title="Timer:">
          <View style={styles.timerCard}>
            <Text style={styles.timerValue}>00:00</Text>
            <View style={styles.timerButtons}>
              <TouchableOpacity style={styles.arrowButton}>
                <Text style={styles.arrowText}>⯅</Text>
                <Text style={styles.arrowText}>⯅</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.arrowButton}>
                <Text style={styles.arrowText}>⯆</Text>
                <Text style={styles.arrowText}>⯆</Text>
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
                style={styles.pill}
              >
                <Text style={styles.pillText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaText}>CREATE SESSION</Text>
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
    paddingTop: 52,
    paddingBottom: 140,
    gap: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logo: {
    width: 120,
    height: 60,
  },
  headerTitle: {
    color: '#FFFFFF',
    letterSpacing: 3,
    fontSize: 16,
    fontWeight: '600',
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
    backgroundColor: '#9ECAA3',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  pillValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pillLabel: {
    fontSize: 11,
    letterSpacing: 1,
    color: '#FFFFFF',
  },
  pillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 1,
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
    paddingVertical: 4,
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 22,
  },
  ctaButton: {
    alignSelf: 'center',
    backgroundColor: '#9ECAA3',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 60,
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 2,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 40,
    backgroundColor: '#4A6B4E',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navIcon: {
    width: 34,
    height: 34,
    tintColor: '#FFFFFF',
  },
});
