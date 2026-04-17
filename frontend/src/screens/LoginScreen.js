import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { authApi, supabase } from '../services/api';
import { SUPABASE_CONFIG_ERROR } from '../services/api';
import { COLORS, ROUNDED, SPACING } from '../theme';

const LoginScreen = ({ navigation }) => {
  const { dispatch } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [is18Plus, setIs18Plus] = useState(false);
  const [notice, setNotice] = useState('');

  const trimmedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const trimmedPassword = useMemo(() => password.trim(), [password]);

  const ensureSupabase = () => {
    if (supabase) return true;
    const msg = SUPABASE_CONFIG_ERROR || 'ยังไม่ได้ตั้งค่า Supabase: EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY';
    setNotice(msg);
    Alert.alert('ตั้งค่าไม่ครบ', msg);
    return false;
  };

  const guard18 = () => {
    if (is18Plus) return true;
    setNotice('กรุณายืนยันว่าอายุ 18 ปีขึ้นไปก่อนใช้งาน');
    Alert.alert('คำเตือน', 'กรุณายืนยันว่าคุณอายุ 18 ปีขึ้นไปเพื่อใช้งานแอปนี้');
    return false;
  };

  const handleGuestLogin = async () => {
    if (!guard18()) return;
    try {
      setNotice('');
      setLoading(true);
      const response = await authApi.loginGuest();
      if (response.data.success) {
        dispatch({ type: 'SET_USER', payload: response.data });
        navigation.reset({ index: 0, routes: [{ name: 'OnboardingProfile' }] });
      }
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const upsertProfile = async (userId) => {
    const baseName = trimmedEmail.split('@')[0] || 'MatchaUser';
    const displayName = baseName.slice(0, 24);
    await supabase.from('users').upsert({ id: userId, display_name: displayName, avatar_emoji: '🍵' });
  };

  const handleEmailSignIn = async () => {
    if (!guard18()) return;
    if (!ensureSupabase()) return;
    if (!trimmedEmail || !trimmedPassword) {
      setNotice('กรุณากรอกอีเมลและรหัสผ่าน');
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    try {
      setNotice('');
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error || !data?.user?.id) {
        const msg =
          error?.code === 'invalid_credentials'
            ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือยังไม่ได้ยืนยันอีเมล (ถ้าเปิด Email confirmation ไว้)'
            : (error?.message || 'กรุณาตรวจสอบอีเมล/รหัสผ่าน');
        setNotice(msg);
        Alert.alert('ล็อกอินไม่สำเร็จ', msg);
        return;
      }

      await upsertProfile(data.user.id);
      dispatch({
        type: 'SET_USER',
        payload: {
          success: true,
          userId: data.user.id,
          guestId: null,
          displayName: trimmedEmail.split('@')[0] || 'Matcha User',
          avatar: '🍵',
          interests: [],
        },
      });
      navigation.reset({ index: 0, routes: [{ name: 'OnboardingProfile' }] });
    } catch (e) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถล็อกอินได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!ensureSupabase()) return;
    if (!trimmedEmail) {
      setNotice('กรุณากรอกอีเมลก่อน');
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกอีเมลก่อน');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({ type: 'signup', email: trimmedEmail });
      if (error) {
        setNotice(error.message || 'ส่งอีเมลไม่สำเร็จ');
        Alert.alert('ส่งอีเมลไม่สำเร็จ', error.message);
        return;
      }
      setNotice('ส่งอีเมลยืนยันอีกครั้งแล้ว กรุณาเช็คกล่องข้อความ');
      Alert.alert('ส่งแล้ว', 'ส่งอีเมลยืนยันอีกครั้งแล้ว กรุณาเช็คกล่องข้อความ');
    } catch (e) {
      setNotice('ส่งอีเมลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      Alert.alert('ข้อผิดพลาด', 'ส่งอีเมลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>🍵</Text>
          </View>
          <Text style={styles.title}>Matcha</Text>
          <Text style={styles.subtitle}>เข้าสู่ระบบเพื่อเริ่มหาเพื่อนใหม่</Text>
        </View>

        {!!notice && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        )}

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
              onPress={handleEmailSignIn}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>เข้าสู่ระบบ</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, loading && styles.disabled]}
              onPress={() => navigation.navigate('Signup')}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.secondaryText}>สมัครสมาชิก</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.linkButton, loading && styles.disabled]}
              onPress={handleResend}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.linkText}>ส่งอีเมลยืนยันอีกครั้ง</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>หรือ</Text>
          <View style={styles.orLine} />
        </View>

        <TouchableOpacity
          style={[styles.guestButton, loading && styles.disabled]}
          onPress={handleGuestLogin}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Text style={styles.guestText}>เข้าใช้แบบ Guest</Text>
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
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.12)',
  },
  icon: {
    fontSize: 56,
  },
  title: {
    marginTop: SPACING.md,
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: SPACING.xs,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
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
  notice: {
    width: '100%',
    backgroundColor: 'rgba(231, 76, 60, 0.08)',
    borderRadius: ROUNDED.lg,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.18)',
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  noticeText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
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
  linkButton: {
    marginTop: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
  disabled: {
    opacity: 0.6,
  },
  orRow: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(123, 201, 164, 0.2)',
  },
  orText: {
    marginHorizontal: SPACING.md,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  guestButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: ROUNDED.full,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.22)',
  },
  guestText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.text,
  },
});

export default LoginScreen;
