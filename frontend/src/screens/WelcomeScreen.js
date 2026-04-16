import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { authApi } from '../services/api';
import { COLORS, ROUNDED, SPACING } from '../theme';

const WelcomeScreen = ({ navigation }) => {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [is18Plus, setIs18Plus] = useState(false);

  const handleGuestLogin = async () => {
    if (!is18Plus) {
      Alert.alert('คำเตือน', 'กรุณายืนยันว่าคุณอายุ 18 ปีขึ้นไปเพื่อใช้งานแอปนี้');
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.loginGuest();
      if (response.data.success) {
        dispatch({ type: 'SET_USER', payload: response.data });
        navigation.navigate('Interests');
      }
    } catch (error) {
      console.error('Guest login failed:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 64 }}>🍵</Text>
          </View>
        </View>
        <Text style={styles.logoText}>Matcha</Text>
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>"อุ่นใจ เหมือนจิบมัทฉะกับเพื่อนใหม่"</Text>
        </View>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleGuestLogin}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.buttonInner}>
              <Text style={styles.buttonText}>เริ่มต้นใช้งานเลย</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIs18Plus(!is18Plus)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, is18Plus && styles.checked]}>
            {is18Plus && <Text style={{ color: '#FFFFFF', fontSize: 14 }}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            ฉันยืนยันว่าอายุ <Text style={styles.boldText}>18 ปีขึ้นไป</Text> และยอมรับข้อตกลงการใช้งาน
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerBadge}>
          <Text style={{ fontSize: 14 }}>🛡️</Text>
          <Text style={styles.footerText}>ปลอดภัย ไร้กังวล ด้วยระบบคัดกรอง AI</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    marginTop: 100,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  logoText: {
    fontSize: 56,
    fontWeight: '800',
    color: COLORS.secondary,
    letterSpacing: -1,
    marginBottom: SPACING.xs,
  },
  taglineContainer: {
    paddingHorizontal: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    marginTop: SPACING.xs,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  content: {
    marginBottom: 60,
  },
  button: {
    borderRadius: ROUNDED.full,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonInner: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.md + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: SPACING.sm,
    borderRadius: ROUNDED.md,
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
  checkboxLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.text,
  },
  footer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: ROUNDED.full,
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.2)',
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default WelcomeScreen;
