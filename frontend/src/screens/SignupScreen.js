import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { supabase } from '../services/api';
import { COLORS, ROUNDED, SPACING } from '../theme';

const SignupScreen = ({ navigation }) => {
  const { dispatch } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [is18Plus, setIs18Plus] = useState(false);

  const trimmedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const trimmedPassword = useMemo(() => password.trim(), [password]);
  const trimmedPassword2 = useMemo(() => password2.trim(), [password2]);

  const ensureSupabase = () => {
    if (supabase) return true;
    Alert.alert('ตั้งค่าไม่ครบ', 'ยังไม่ได้ตั้งค่า Supabase (EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY)');
    return false;
  };

  const guard18 = () => {
    if (is18Plus) return true;
    Alert.alert('คำเตือน', 'กรุณายืนยันว่าคุณอายุ 18 ปีขึ้นไปเพื่อใช้งานแอปนี้');
    return false;
  };

  const upsertProfile = async (userId) => {
    const baseName = trimmedEmail.split('@')[0] || 'MatchaUser';
    const displayName = baseName.slice(0, 24);
    await supabase.from('users').upsert({ id: userId, display_name: displayName, avatar_emoji: '🍵' });
  };

  const handleSignUp = async () => {
    if (!guard18()) return;
    if (!ensureSupabase()) return;
    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    if (trimmedPassword.length < 6) {
      Alert.alert('รหัสผ่านสั้นเกินไป', 'กรุณาตั้งรหัสผ่านอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (trimmedPassword !== trimmedPassword2) {
      Alert.alert('รหัสผ่านไม่ตรงกัน', 'กรุณายืนยันรหัสผ่านให้ตรงกัน');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error) {
        Alert.alert('สมัครสมาชิกไม่สำเร็จ', error.message);
        return;
      }

      const userId = data?.user?.id;
      if (userId) {
        await upsertProfile(userId);
        dispatch({
          type: 'SET_USER',
          payload: {
            success: true,
            userId,
            guestId: null,
            displayName: trimmedEmail.split('@')[0] || 'Matcha User',
            avatar: '🍵',
            interests: [],
          },
        });
        navigation.reset({ index: 0, routes: [{ name: 'OnboardingProfile' }] });
        return;
      }

      Alert.alert('สมัครสมาชิกแล้ว', 'กรุณายืนยันอีเมลในกล่องข้อความ แล้วกลับมาล็อกอินอีกครั้ง');
      navigation.navigate('Login');
    } catch (e) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>สมัครสมาชิก</Text>
          <Text style={styles.subtitle}>สร้างบัญชีเพื่อเริ่มหาเพื่อนใหม่</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>อีเมล</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={COLORS.textSecondary + '88'}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>รหัสผ่าน</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="อย่างน้อย 6 ตัวอักษร"
            placeholderTextColor={COLORS.textSecondary + '88'}
            secureTextEntry
            style={styles.input}
          />

          <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>ยืนยันรหัสผ่าน</Text>
          <TextInput
            value={password2}
            onChangeText={setPassword2}
            placeholder="พิมพ์รหัสผ่านอีกครั้ง"
            placeholderTextColor={COLORS.textSecondary + '88'}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity style={styles.checkboxContainer} onPress={() => setIs18Plus(!is18Plus)} activeOpacity={0.7}>
            <View style={[styles.checkbox, is18Plus && styles.checked]}>
              {is18Plus && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              ฉันยืนยันว่าอายุ <Text style={styles.boldText}>18 ปีขึ้นไป</Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabled]}
              onPress={handleSignUp}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>สร้างบัญชี</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, loading && styles.disabled]}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.secondaryText}>มีบัญชีแล้ว? เข้าสู่ระบบ</Text>
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
  content: {
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
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
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: ROUNDED.md,
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.18)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '700',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingVertical: SPACING.sm,
    borderRadius: ROUNDED.md,
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.12)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    marginRight: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checked: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  checkboxLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
    fontWeight: '600',
  },
  boldText: {
    fontWeight: '900',
    color: COLORS.text,
  },
  actions: {
    marginTop: SPACING.lg,
  },
  primaryButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: ROUNDED.full,
    paddingVertical: SPACING.md + 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  secondaryButton: {
    marginTop: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: ROUNDED.full,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.22)',
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default SignupScreen;
