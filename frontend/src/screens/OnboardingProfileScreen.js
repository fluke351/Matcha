import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS, ROUNDED, SPACING } from '../theme';

const AVATARS = ['🍵', '🧋', '🍰', '🎧', '🎮', '📚', '🏃', '🎬', '✈️', '🐱', '🎨', '💻', '🌿', '☁️', '🌙', '✨'];

const OnboardingProfileScreen = ({ navigation }) => {
  const { state, dispatch } = useApp();
  const initialName = state.user?.displayName || '';
  const initialAvatar = state.user?.avatar || '🍵';

  const [displayName, setDisplayName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);

  const trimmedName = useMemo(() => displayName.trim(), [displayName]);

  const handleNext = () => {
    if (!state.user) {
      navigation.navigate('Welcome');
      return;
    }

    if (!trimmedName || trimmedName.length < 2) {
      Alert.alert('ชื่อโปรไฟล์', 'กรุณาใส่ชื่ออย่างน้อย 2 ตัวอักษร');
      return;
    }

    dispatch({ type: 'UPDATE_USER', payload: { displayName: trimmedName, avatar } });
    navigation.navigate('Interests');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>ตั้งค่าโปรไฟล์ 🍵</Text>
          <Text style={styles.subtitle}>เลือกชื่อและอวาตาร์เพื่อให้เพื่อนใหม่จำคุณได้ง่าย</Text>
        </View>

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

        <TouchableOpacity style={styles.primaryButton} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>ต่อไป</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: SPACING.sm,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
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
  primaryButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: ROUNDED.full,
    paddingVertical: SPACING.md + 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
    marginTop: SPACING.sm,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
});

export default OnboardingProfileScreen;
