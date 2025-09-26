import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Button from '../components/UI/Button';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Info */}
        <View style={styles.profileCard}>
          {/* Cover */}
          <View style={styles.cover} />
          
          {/* Profile Picture */}
          <View style={styles.profilePictureContainer}>
            {user.profileImageUrl ? (
              <Image
                source={{ uri: user.profileImageUrl }}
                style={styles.profilePicture}
              />
            ) : (
              <View style={styles.profilePicturePlaceholder}>
                <Text style={styles.profilePictureText}>
                  {(user.displayName || user.username).charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {user.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="white" />
              </View>
            )}
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={styles.displayName}>
              {user.displayName || user.username}
            </Text>
            <Text style={styles.username}>@{user.username}</Text>
            {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{user.postsCount}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{user.followersCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{user.followingCount}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          {/* Edit Button */}
          <Button
            title="Edit Profile"
            variant="outline"
            style={styles.editButton}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="person-outline" size={20} color="#6B7280" />
            <Text style={styles.actionText}>My Posts</Text>
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="storefront-outline" size={20} color="#6B7280" />
            <Text style={styles.actionText}>My Products</Text>
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="notifications-outline" size={20} color="#6B7280" />
            <Text style={styles.actionText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="settings-outline" size={20} color="#6B7280" />
            <Text style={styles.actionText}>Settings</Text>
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <Button
            title="Sign Out"
            variant="outline"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  settingsButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cover: {
    height: 80,
    backgroundColor: '#2563eb',
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginTop: -30,
    marginBottom: 16,
  },
  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'white',
  },
  profilePicturePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D1D5DB',
    borderWidth: 3,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePictureText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  stat: {
    alignItems: 'center',
    marginHorizontal: 24,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  editButton: {
    margin: 16,
  },
  actions: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
    flex: 1,
  },
  logoutContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    borderColor: '#EF4444',
  },
});