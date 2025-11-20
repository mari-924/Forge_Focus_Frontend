import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSession } from "@/hooks/ctx";

export default function LoginScreen() {
  const { signIn } = useSession();
  const handleGoogleLogin = async () => {
    // TODO: Implement Google authentication
    console.log('Google login pressed');
    await signIn();
    router.replace('/(tabs)');
  };

  const handleGitHubLogin = () => {
    // TODO: Implement GitHub authentication
    console.log('GitHub login pressed');
    router.push('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/Forge-Focus-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      {/* Login Label */}
      <Text style={styles.loginLabel}>LOGIN</Text>

      {/* Input Fields */}
      <View style={styles.inputsContainer}>
        <TextInput
          style={styles.input}
          placeholder="ENTER EMAIL..."
          placeholderTextColor="#999999"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="ENTER PASSWORD..."
          placeholderTextColor="#999999"
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      {/* OR Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Login Icons */}
      <View style={styles.socialContainer}>
        <TouchableOpacity 
          style={styles.socialIcon}
          onPress={handleGoogleLogin}
          activeOpacity={0.7}
        >
          <Image
            source={require('@/assets/images/google-logo.png')}
            style={styles.socialLogo}
            contentFit="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.socialIcon}
          onPress={handleGitHubLogin}
          activeOpacity={0.7}
        >
          <Image
            source={require('@/assets/images/git-hub-logo.png')}
            style={styles.socialLogo}
            contentFit="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Buttons Container */}
      <View style={styles.buttonsContainer}>
        {/* Login Button */}
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.loginButtonText}>LOGIN</Text>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.loginButtonText}>BACK</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 100,
  },
  loginLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 30,
  },
  inputsContainer: {
    width: '100%',
    maxWidth: 350,
    gap: 15,
    marginBottom: 30,
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000000',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    marginBottom: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#FFFFFF',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 40,
  },
  socialIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  socialLogo: {
    width: 40,
    height: 40,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 350,
    gap: 15,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#8FA892',
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
