import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function WelcomeScreen() {
  

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/Forge-Focus-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.buttonText}>SIGN UP</Text>
        </TouchableOpacity>
      </View>

      {/* Skip Link */}
      <TouchableOpacity 
        style={styles.skipContainer}
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={styles.skipText}>SKIP?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B8E6F', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 60,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 100,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
    marginBottom: 30,
  },
  button: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#8FA892', 
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    letterSpacing: 1,
    textTransform: 'uppercase',
    ...Platform.select({
      ios: { fontFamily: 'System', fontWeight: 'bold' },
      android: { fontFamily: 'sans-serif-medium', fontWeight: 'bold' },
      default: { fontFamily: 'System', fontWeight: 'bold' },
    }),
  },
  skipContainer: {
    marginTop: 20,
  },
  skipText: {
    color: '#FFFFFF', 
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
    ...Platform.select({
      ios: { fontFamily: 'System', fontWeight: 'bold' },
      android: { fontFamily: 'sans-serif', fontWeight: 'bold'},
      default: { fontFamily: 'System',  fontWeight: 'bold' },
    }),
  },
});
