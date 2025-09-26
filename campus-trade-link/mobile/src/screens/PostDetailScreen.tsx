import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function PostDetailScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.placeholder}>Post Detail Screen</Text>
        <Text style={styles.subtext}>Full post view with comments</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#6B7280',
  },
});