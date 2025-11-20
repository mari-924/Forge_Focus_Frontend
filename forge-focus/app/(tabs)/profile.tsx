import { router } from 'expo-router';
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSession } from "@/hooks/ctx";
import useProfile from "@/hooks/useProfile";
import { TabHeader } from '@/components/tab-header';
import { Image } from 'expo-image';

export default function ProfileScreen() {
  const { signOut } = useSession();
  const { profile } = useProfile();
  return (
    <View style={styles.container}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <TabHeader
          title="PROFILE"
          rightContent={
            <>
              <TouchableOpacity
                accessibilityRole="button"
                style={styles.logoutButton}
                onPress={signOut}
              >
                <Text style={styles.logoutText}>LOGOUT</Text>
              </TouchableOpacity>
            </>
          }
        />
      <View style={styles.avatarCard}>
        {profile?.user?.profile_pic ? (
          <Image
            source={{ uri: profile?.user?.profile_pic??null }}
            style={styles.avatarPlaceholder}
            contentFit="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
        <Text style={styles.username}>{profile?.user?.username}</Text>
        <Text style={{ color: "#E2E8CE", fontSize: 14 }}>{profile?.user?.email}</Text>
      </View>

        <View style={styles.statsRow}>
          <StatBlock
            label="FOCUS STREAK"
            value="0"
          />
          <View style={styles.statDivider} />
          <StatBlock
            label="HIGHEST STREAK"
            value="15"
          />
        </View>

        <View style={styles.activityCard}>
          <Text style={styles.sectionLabel}>YOUR ACTIVITY</Text>
          <View style={styles.activityRow}>
            <ActivityItem label="TASKS COMPLETED: TODAY" value="0" />
            <View style={styles.activityDivider} />
            <ActivityItem label="TASKS COMPLETED: ALL TIME" value="150" />
          </View>
        </View>

        <View style={styles.friendsCard}>
          <Text style={styles.sectionLabel}>FRIENDS</Text>
          <View style={styles.friendsRow}>
            <TouchableOpacity style={styles.addFriendButton}>
              <Text style={styles.addFriendText}>Add Friends</Text>
              <Text style={styles.addFriendPlus}>+</Text>
            </TouchableOpacity>
            <Text style={styles.chevron}>›</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const StatBlock = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.statBlock}>
    <Text style={styles.statLabel}>{label}</Text>
    <View style={styles.flameWrapper}>
      <View style={styles.flameOuter}>
        <View style={styles.flameInner} />
      </View>
    </View>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const ActivityItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.activityItem}>
    <Text style={styles.activityLabel}>{label}</Text>
    <Text style={styles.activityValue}>{value}</Text>
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
    paddingHorizontal: 25,
    paddingTop: 0,
    paddingBottom: 120,
    gap: 30,
  },
  logoutButton: {
    backgroundColor: '#8FA892',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 1,
  },
  avatarCard: {
    alignItems: 'center',
    gap: 16,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#4A6B4E',
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F6F52',
    borderRadius: 20,
    padding: 20,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  statLabel: {
    color: '#D5E8D4',
    fontSize: 14,
    letterSpacing: 1,
    textAlign: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  flameWrapper: {
    height: 40,
    justifyContent: 'center',
  },
  flameOuter: {
    width: 32,
    height: 45,
    borderRadius: 16,
    backgroundColor: '#F6D365',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameInner: {
    width: 16,
    height: 25,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#83A384',
  },
  activityCard: {
    backgroundColor: '#4F6F52',
    borderRadius: 20,
    padding: 20,
    gap: 20,
  },
  sectionLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 2,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityItem: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  activityLabel: {
    color: '#D5E8D4',
    fontSize: 12,
    textAlign: 'center',
  },
  activityValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  activityDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#83A384',
  },
  friendsCard: {
    backgroundColor: '#4F6F52',
    borderRadius: 20,
    padding: 20,
    gap: 15,
  },
  friendsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#83A384',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  addFriendText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addFriendPlus: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  chevron: {
    color: '#FFFFFF',
    fontSize: 42,
    lineHeight: 42,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logo: {
    width: 130,
    height: 65,
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: 10,
  },
  headerLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    letterSpacing: 2,
  },
});

