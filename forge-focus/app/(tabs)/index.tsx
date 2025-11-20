import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/Forge-Focus-logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
          <Text style={styles.pageTitle}>HOME PAGE</Text>
        </View>

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
    paddingBottom: 60,
  },
  inner: {
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'flex-start',
  },
  logo: {
    width: 150,
    height: 75,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', 
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 90,
  },
  section: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF', 
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
    paddingTop: 10,
    paddingBottom: 5
  },
  sectionBar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4A6B4E', 
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    minHeight: 60,
  },
  chevron: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '200',
    lineHeight: 36,
  },
});
