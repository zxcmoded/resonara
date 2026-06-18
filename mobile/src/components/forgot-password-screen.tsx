import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ResonaraLogo } from '@/components/resonara-logo';
import { ResonaraTheme } from '@/constants/theme';

export function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend() {
    if (!email.trim()) return;
    setIsLoading(true);
    // TODO: wire up real password-reset API call here
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    setSubmitted(true);
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <ResonaraLogo size={68} />
        </View>

        {submitted ? (
          /* ── Success state ── */
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="mail-outline" size={40} color={ResonaraTheme.accent} />
            </View>
            <Text style={styles.successHeading}>Check your inbox</Text>
            <Text style={styles.successBody}>
              We sent a password reset link to{'\n'}
              <Text style={styles.successEmail}>{email}</Text>
            </Text>
            <Text style={styles.successHint}>
              Didn't receive it? Check your spam folder or try again.
            </Text>

            <Pressable
              style={styles.primaryButtonWrapper}
              onPress={() => setSubmitted(false)}>
              <LinearGradient
                colors={['#5B8DEF', '#3B6FD4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          /* ── Input state ── */
          <View style={styles.form}>
            <Text style={styles.heading}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="jade@email.com"
                placeholderTextColor={ResonaraTheme.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                selectionColor={ResonaraTheme.accent}
              />
            </View>

            <Pressable
              style={[styles.primaryButtonWrapper, (!email.trim() || isLoading) && styles.buttonDisabled]}
              onPress={handleSend}
              disabled={!email.trim() || isLoading}>
              <LinearGradient
                colors={['#5B8DEF', '#3B6FD4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>
                  {isLoading ? 'Sending…' : 'Send Reset Link'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {/* Back to sign in */}
        <Pressable style={styles.backRow} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={16} color={ResonaraTheme.accent} />
          <Text style={styles.backText}>Back to Sign In</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ResonaraTheme.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  form: {
    gap: 16,
  },
  heading: {
    color: ResonaraTheme.text,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: ResonaraTheme.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    color: ResonaraTheme.text,
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: ResonaraTheme.text,
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    color: ResonaraTheme.text,
    fontSize: 15,
  },
  primaryButtonWrapper: {
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 30,
  },
  primaryButtonText: {
    color: ResonaraTheme.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  successContainer: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 8,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ResonaraTheme.surface,
    borderWidth: 1,
    borderColor: ResonaraTheme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successHeading: {
    color: ResonaraTheme.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  successBody: {
    color: ResonaraTheme.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  successEmail: {
    color: ResonaraTheme.text,
    fontWeight: '600',
  },
  successHint: {
    color: ResonaraTheme.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 32,
  },
  backText: {
    color: ResonaraTheme.accent,
    fontSize: 13,
    fontWeight: '600',
  },
});
