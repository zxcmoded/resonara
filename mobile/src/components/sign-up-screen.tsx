import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
  ActivityIndicator,
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
import { useAuth } from '@/context/auth';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import { useFacebookAuth } from '@/hooks/use-facebook-auth';

interface Props {
  onNavigateToSignIn: () => void;
}

export function SignUpScreen({ onNavigateToSignIn }: Props) {
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  const google = useGoogleAuth();
  const facebook = useFacebookAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <ResonaraLogo size={72} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.heading}>Sign Up</Text>

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Jade Herrera"
              placeholderTextColor={ResonaraTheme.textMuted}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
              selectionColor={ResonaraTheme.accent}
            />
          </View>

          {/* Email */}
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

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                placeholder="••••••••"
                placeholderTextColor={ResonaraTheme.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                selectionColor={ResonaraTheme.accent}
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={8}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={ResonaraTheme.textMuted}
                />
              </Pressable>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                placeholder="••••••••"
                placeholderTextColor={ResonaraTheme.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                selectionColor={ResonaraTheme.accent}
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword((v) => !v)}
                hitSlop={8}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={ResonaraTheme.textMuted}
                />
              </Pressable>
            </View>
          </View>

          {/* Sign Up button */}
          <Pressable onPress={signUp} style={styles.primaryButtonWrapper}>
            <LinearGradient
              colors={['#5B8DEF', '#3B6FD4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Sign Up</Text>
            </LinearGradient>
          </Pressable>

          {/* OR divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Facebook */}
          <Pressable
            style={[styles.socialButton, facebook.isLoading && styles.socialButtonDisabled]}
            onPress={facebook.handleSignIn}
            disabled={facebook.isLoading}>
            {facebook.isLoading
              ? <ActivityIndicator size="small" color={ResonaraTheme.text} />
              : <Image style={styles.glow} source={require('@/assets/images/socmed/fb.png')} />}
            <Text style={styles.socialButtonText}>Sign In with Facebook</Text>
          </Pressable>

          {/* Google */}
          <Pressable
            style={[styles.socialButton, google.isLoading && styles.socialButtonDisabled]}
            onPress={google.handleSignIn}
            disabled={google.isLoading}>
            {google.isLoading
              ? <ActivityIndicator size="small" color={ResonaraTheme.text} />
              : <Image style={styles.glow} source={require('@/assets/images/socmed/google.png')} />}
            <Text style={styles.socialButtonText}>Sign In with Google</Text>
          </Pressable>
        </View>

        {/* Sign In link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?{' '}</Text>
          <Pressable onPress={onNavigateToSignIn} hitSlop={8}>
            <Text style={styles.footerLink}>Sign in</Text>
          </Pressable>
        </View>
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
    marginBottom: 28,
  },
  form: {
    gap: 14,
  },
  heading: {
    color: ResonaraTheme.text,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
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
  inputRow: {
    position: 'relative',
  },
  inputWithIcon: {
    paddingRight: 44,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  primaryButtonWrapper: {
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 4,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: ResonaraTheme.border,
  },
  dividerText: {
    color: ResonaraTheme.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: ResonaraTheme.verified,
    borderRadius: 30,
    paddingVertical: 14,
  },
  socialButtonText: {
    color: ResonaraTheme.text,
    fontSize: 15,
    fontWeight: '500',
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: ResonaraTheme.textSecondary,
    fontSize: 13,
  },
  footerLink: {
    color: ResonaraTheme.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  glow: {
    width: 20,
    height: 20,
  },
});
