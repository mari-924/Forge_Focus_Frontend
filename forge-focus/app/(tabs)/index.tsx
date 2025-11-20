import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TabHeader } from '@/components/tab-header';

export default function HomeScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.inner}>
        <TabHeader title="HOME PAGE" />

        {/* Main Content */}
        <View style={styles.content}>
          {/* Friends Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FRIENDS</Text>
            <View style={styles.sectionBar}>
              <Text style={styles.chevron}>›</Text>
            </View>
          </View>

          {/* Previous Sessions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PREV SESSIONS</Text>
            <View style={styles.sectionBar}>
              <Text style={styles.chevron}>›</Text>
            </View>
          </View>
          
          {/* Scheduled Sessions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SCHEDULED SESSIONS</Text>
            <View style={styles.sectionBar}>
              <Text style={styles.chevron}>›</Text>
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
