import { Image } from 'expo-image';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface TabHeaderProps {
  title: string;
  rightContent?: React.ReactNode;
  style?: ViewStyle;
}

export function TabHeader({ title, rightContent, style }: TabHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      <Image
        source={require('@/assets/images/Forge-Focus-logo.png')}
        style={styles.logo}
        contentFit="contain"
      />
      <View style={styles.rightContainer}>
        {rightContent ? (
          <>
            <Text style={styles.headerTitle}>{title}</Text>
            {rightContent}
          </>
        ) : (
          <Text style={styles.headerTitle}>{title}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  logo: {
    width: 120,
    height: 60,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  rightContainer: {
    alignItems: 'flex-end',
    gap: 10,
  },
});

