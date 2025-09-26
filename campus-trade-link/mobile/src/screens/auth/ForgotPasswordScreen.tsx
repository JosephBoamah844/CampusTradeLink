import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authApi } from '../../lib/api';
import { RootStackParamList } from '../../navigation';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your email address',
      });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      Toast.show({
        type: 'success',
        text1: 'Email Sent',
        text2: 'Check your email for reset instructions',
      });
      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to send reset email',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Header */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.mainContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail-outline" size={64} color="#2563eb" />
            </View>
            
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            <View style={styles.form}>
              <Input
                label="Email Address"
                placeholder="your.email@st.ug.edu.gh"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />

              <Button
                title="Send Reset Link"
                onPress={handleForgotPassword}
                isLoading={isLoading}
                disabled={isLoading}
                style={styles.submitButton}
              />
            </View>

            <TouchableOpacity 
              style={styles.backToLogin}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.backToLoginText}>
                Remember your password? Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  form: {
    marginBottom: 32,
  },
  submitButton: {
    marginTop: 8,
  },
  backToLogin: {
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '500',
  },
});