import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ResonaraTheme } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase';

interface Props {
  visible: boolean;
  onClose: () => void;
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]?.toUpperCase() ?? '').slice(0, 2).join('');
}

async function uploadAvatar(userId: string, uri: string): Promise<string> {
  // Read image as ArrayBuffer via fetch (works in both native and web)
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, arrayBuffer, { contentType, upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  // Bust the cache so the new image is fetched immediately
  return `${data.publicUrl}?t=${Date.now()}`;
}

export function EditProfileModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Sync form fields with current user data each time the modal opens
  useEffect(() => {
    if (visible) {
      setName(user?.name ?? '');
      setUsername(user?.username ?? '');
      setLocalAvatarUri(null);
    }
  }, [visible, user]);

  const displayAvatar = localAvatarUri ?? user?.avatar;
  const userInitials = name ? initials(name) : '?';

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photo library to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setLocalAvatarUri(result.assets[0].uri);
    }
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      let avatarUrl: string | undefined;

      if (localAvatarUri) {
        try {
          avatarUrl = await uploadAvatar(user.id, localAvatarUri);
        } catch (uploadErr: any) {
          const msg: string = uploadErr?.message ?? '';
          if (msg.toLowerCase().includes('bucket not found')) {
            Alert.alert(
              'Storage not set up',
              'The "avatars" storage bucket does not exist yet.\n\nGo to Supabase Dashboard → Storage → New bucket, name it "avatars", enable Public, then save.'
            );
          } else {
            Alert.alert('Upload failed', msg || 'Could not upload photo');
          }
          return;
        }
      }

      const { error } = await updateProfile({
        name: name.trim() || undefined,
        username: username.trim() || undefined,
        avatarUrl,
      });

      if (error) {
        Alert.alert('Update failed', error);
        return;
      }

      setLocalAvatarUri(null);
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (saving) return;
    setLocalAvatarUri(null);
    setName(user?.name ?? '');
    setUsername(user?.username ?? '');
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable style={styles.headerBtn} onPress={handleClose} disabled={saving}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Avatar picker */}
          <View style={styles.avatarSection}>
            <Pressable style={styles.avatarWrapper} onPress={pickImage} disabled={saving}>
              <LinearGradient
                colors={['#FF3378', '#9B51E0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarRing}>
                {displayAvatar ? (
                  <Image
                    source={{ uri: displayAvatar }}
                    style={styles.avatarImg}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitials}>{userInitials}</Text>
                  </View>
                )}
              </LinearGradient>

              {/* Camera badge */}
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </View>
            </Pressable>
            <Text style={styles.changePhotoText}>Tap to change photo</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Full name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor={ResonaraTheme.textMuted}
                autoCapitalize="words"
                autoCorrect={false}
                selectionColor={ResonaraTheme.accent}
                editable={!saving}
              />
            </View>

            {/* Username */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.usernameRow}>
                <Text style={styles.atSign}>@</Text>
                <TextInput
                  style={[styles.input, styles.usernameInput]}
                  value={username}
                  onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                  placeholder="username"
                  placeholderTextColor={ResonaraTheme.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectionColor={ResonaraTheme.accent}
                  editable={!saving}
                />
              </View>
            </View>

            {/* Email (read-only) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.input, styles.inputReadOnly]}>
                <Text style={styles.readOnlyText}>{user?.email}</Text>
              </View>
              <Text style={styles.fieldHint}>Email cannot be changed here</Text>
            </View>
          </View>

          {/* Save button */}
          <Pressable
            style={[styles.saveWrapper, saving && styles.saveDisabled]}
            onPress={handleSave}
            disabled={saving}>
            <LinearGradient
              colors={['#5B8DEF', '#3B6FD4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveBtn}>
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ResonaraTheme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ResonaraTheme.border,
  },
  headerBtn: {
    minWidth: 60,
  },
  cancelText: {
    color: ResonaraTheme.accent,
    fontSize: 16,
  },
  headerTitle: {
    color: ResonaraTheme.text,
    fontSize: 17,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 24,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  avatarRing: {
    padding: 3,
    borderRadius: 56,
  },
  avatarImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: ResonaraTheme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: ResonaraTheme.text,
    fontSize: 30,
    fontWeight: '700',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ResonaraTheme.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: ResonaraTheme.background,
  },
  changePhotoText: {
    color: ResonaraTheme.accent,
    fontSize: 13,
    fontWeight: '500',
  },
  form: {
    gap: 18,
    marginBottom: 28,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    color: ResonaraTheme.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: ResonaraTheme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ResonaraTheme.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    color: ResonaraTheme.text,
    fontSize: 15,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ResonaraTheme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ResonaraTheme.border,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  atSign: {
    color: ResonaraTheme.textMuted,
    fontSize: 15,
    paddingRight: 2,
  },
  usernameInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  inputReadOnly: {
    justifyContent: 'center',
    opacity: 0.5,
  },
  readOnlyText: {
    color: ResonaraTheme.text,
    fontSize: 15,
  },
  fieldHint: {
    color: ResonaraTheme.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  saveWrapper: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  saveDisabled: {
    opacity: 0.6,
  },
  saveBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 30,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
