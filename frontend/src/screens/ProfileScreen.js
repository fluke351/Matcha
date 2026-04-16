import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS, ROUNDED, SPACING } from '../theme';

const AVATARS = ['🍵', '🧋', '🍰', '🎧', '🎮', '📚', '🏃', '🎬', '✈️', '🐱', '🎨', '💻', '🌿', '☁️', '🌙', '✨'];

const ProfileScreen = ({ navigation }) => {
  const { state, dispatch } = useApp();
  const initialName = state.user?.displayName || '';
  const initialAvatar = state.user?.avatar || '🍵';

  const [displayName, setDisplayName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);

  const trimmedName = useMemo(() => displayName.trim(), [displayName]);
  const hasChanges = trimmedName !== initialName || avatar !== initialAvatar;

  const handleSave = () => {
    if (!state.user) {
      navigation.navigate('Welcome');
      return;
    }

    if (!trimmedName || trimmedName.length < 2) {
      Alert.alert('ชื่อโปรไฟล์', 'กรุณาใส่ชื่ออย่างน้อย 2 ตัวอักษร');
      return;
    }

    dispatch({ type: 'UPDATE_USER', payload: { displayName: trimmedName, avatar } });
    Alert.alert('สำเร็จ', 'บันทึกโปรไฟล์แล้ว');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton} activeOpacity={0.8}>
          <Text style={styles.headerIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>โปรไฟล์</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.headerButton, !hasChanges && styles.headerButtonDisabled]}
          activeOpacity={0.8}
          disabled={!hasChanges}
        >
          <Text style={[styles.headerActionText, !hasChanges && styles.headerActionTextDisabled]}>บันทึก</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>อวาตาร์</Text>
          <View style={styles.avatarPreview}>
            <Text style={styles.avatarPreviewText}>{avatar}</Text>
          </View>
          <View style={styles.avatarGrid}>
            {AVATARS.map(a => {
              const selected = a === avatar;
              return (
                <TouchableOpacity
                  key={a}
                  style={[styles.avatarChip, selected && styles.avatarChipSelected]}
                  onPress={() => setAvatar(a)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.avatarChipText}>{a}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>ชื่อที่แสดง</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="เช่น Matcha143"
            placeholderTextColor={COLORS.textSecondary + '88'}
            style={styles.input}
            maxLength={24}
            autoCapitalize="none"
          />
          <Text style={styles.helperText}>ยาวได้สูงสุด 24 ตัวอักษร</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>เมนูลัด</Text>
          <View style={styles.quickRow}>
            <TouchableOpacity style={styles.quickButton} onPress={() => navigation.navigate('Interests')} activeOpacity={0.85}>
              <Text style={styles.quickIcon}>🏷️</Text>
              <Text style={styles.quickText}>ความสนใจ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickButton} onPress={() => navigation.navigate('Privacy')} activeOpacity={0.85}>
              <Text style={styles.quickIcon}>🔒</Text>
              <Text style={styles.quickText}>ความเป็นส่วนตัว</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.quickRow}>
            <TouchableOpacity style={styles.quickButton} onPress={() => navigation.navigate('BlockedUsers')} activeOpacity={0.85}>
              <Text style={styles.quickIcon}>🚫</Text>
              <Text style={styles.quickText}>ผู้ใช้ที่บล็อค</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickButton} onPress={() => navigation.navigate('Settings')} activeOpacity={0.85}>
              <Text style={styles.quickIcon}>⚙️</Text>
              <Text style={styles.quickText}>ตั้งค่า</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    minWidth: 72,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonDisabled: {
    opacity: 0.4,
  },
  headerIcon: {
    fontSize: 22,
    color: COLORS.text,
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  headerActionText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  headerActionTextDisabled: {
    color: COLORS.textSecondary,
  },
  content: {
    padding: SPACING.xl,
    paddingTop: SPACING.md,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: ROUNDED.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  avatarPreview: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 3,
    borderColor: 'rgba(123, 201, 164, 0.35)',
    marginBottom: SPACING.md,
  },
  avatarPreviewText: {
    fontSize: 44,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  avatarChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.16)',
    margin: 6,
  },
  avatarChipSelected: {
    backgroundColor: 'rgba(123, 201, 164, 0.18)',
    borderColor: COLORS.secondary,
  },
  avatarChipText: {
    fontSize: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: ROUNDED.md,
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.18)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '700',
  },
  helperText: {
    marginTop: SPACING.xs,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  quickButton: {
    flex: 0.48,
    borderRadius: ROUNDED.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.12)',
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIcon: {
    fontSize: 22,
    marginBottom: SPACING.xs,
  },
  quickText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },
});

export default ProfileScreen;
