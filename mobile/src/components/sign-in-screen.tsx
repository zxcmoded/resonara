import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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

export function SignInScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn, isAuthenticated } = useAuth();
  const google = useGoogleAuth();
  const facebook = useFacebookAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to main app once authenticated (covers email and social)
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated]);

  async function handleSignIn() {
    setError(null);
    setIsSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    if (error) setError(error);
    setIsSubmitting(false);
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
          <ResonaraLogo size={80} />
          <Text style={styles.tagline}>More than music. A shared experience.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.heading}>Sign In</Text>

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

          {/* Forgot password */}
          <Pressable onPress={() => router.push('/forgot-password')} hitSlop={8}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </Pressable>

          {/* Inline error */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Sign In button */}
          <Pressable
            onPress={handleSignIn}
            disabled={isSubmitting}
            style={[styles.primaryButtonWrapper, isSubmitting && styles.buttonDisabled]}>
            <LinearGradient
              colors={['#5B8DEF', '#3B6FD4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}>
              {isSubmitting
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.primaryButtonText}>Sign In</Text>}
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
              : <Image style={styles.socialIcon} source={require('@/assets/images/socmed/fb.png')} />}
            <Text style={styles.socialButtonText}>Sign In with Facebook</Text>
          </Pressable>

          {/* Google */}
          <Pressable
            style={[styles.socialButton, google.isLoading && styles.socialButtonDisabled]}
            onPress={google.handleSignIn}
            disabled={google.isLoading}>
            {google.isLoading
              ? <ActivityIndicator size="small" color={ResonaraTheme.text} />
              : <Image style={styles.socialIcon} source={require('@/assets/images/socmed/google.png')} />}
            <Text style={styles.socialButtonText}>Sign In with Google</Text>
          </Pressable>
        </View>

        {/* Sign Up link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?{' '}</Text>
          <Pressable onPress={() => router.push('/sign-up')} hitSlop={8}>
            <Text style={styles.footerLink}>Sign up</Text>
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
    marginBottom: 36,
    gap: 8,
  },
  tagline: {
    color: ResonaraTheme.textSecondary,
    fontSize: 12,
    textAlign: 'center',
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
  forgotPassword: {
    color: ResonaraTheme.accent,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'right',
    marginTop: -4,
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
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: '#FF3378',
    fontSize: 13,
    textAlign: 'center',
    marginTop: -4,
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
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
});
