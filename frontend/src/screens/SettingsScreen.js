import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS, ROUNDED, SPACING } from '../theme';

const SettingsScreen = ({ navigation }) => {
  const { state, dispatch } = useApp();

  const handleLogout = () => {
    Alert.alert('ออกจากระบบ', 'ต้องการออกจากระบบหรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ออกจากระบบ',
        style: 'destructive',
        onPress: () => {
          dispatch({ type: 'LOGOUT' });
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton} activeOpacity={0.8}>
          <Text style={styles.headerIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ตั้งค่า</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>ทั่วไป</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>🔔</Text>
              <View>
                <Text style={styles.rowTitle}>การแจ้งเตือน</Text>
                <Text style={styles.rowSubtitle}>เปิด/ปิดการแจ้งเตือนในแอป</Text>
              </View>
            </View>
            <Switch
              value={!!state.settings.notificationsEnabled}
              onValueChange={(value) => dispatch({ type: 'SET_SETTINGS', payload: { notificationsEnabled: value } })}
              trackColor={{ true: COLORS.secondary, false: '#DCE6E0' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>🧪</Text>
              <View>
                <Text style={styles.rowTitle}>โหมดทดสอบ</Text>
                <Text style={styles.rowSubtitle}>จับคู่กับบอทอัตโนมัติ เพื่อเทสหน้าจอ/แชท</Text>
              </View>
            </View>
            <Switch
              value={!!state.settings.testMode}
              onValueChange={(value) => dispatch({ type: 'SET_SETTINGS', payload: { testMode: value } })}
              trackColor={{ true: COLORS.secondary, false: '#DCE6E0' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity style={styles.navRow} onPress={() => navigation.navigate('Notifications')} activeOpacity={0.85}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>📣</Text>
              <View>
                <Text style={styles.rowTitle}>ศูนย์การแจ้งเตือน</Text>
                <Text style={styles.rowSubtitle}>ดูรายการแจ้งเตือนล่าสุด</Text>
              </View>
            </View>
            <Text style={styles.chevron}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>บัญชี</Text>
          <TouchableOpacity style={styles.navRow} onPress={() => navigation.navigate('Profile')} activeOpacity={0.85}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>🙂</Text>
              <View>
                <Text style={styles.rowTitle}>โปรไฟล์</Text>
                <Text style={styles.rowSubtitle}>{state.user?.displayName || 'Matcha User'}</Text>
              </View>
            </View>
            <Text style={styles.chevron}>{'>'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navRow} onPress={() => navigation.navigate('Privacy')} activeOpacity={0.85}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>🔒</Text>
              <View>
                <Text style={styles.rowTitle}>ความเป็นส่วนตัว</Text>
                <Text style={styles.rowSubtitle}>ควบคุมการแสดงสถานะและระยะทาง</Text>
              </View>
            </View>
            <Text style={styles.chevron}>{'>'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navRow} onPress={() => navigation.navigate('BlockedUsers')} activeOpacity={0.85}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>🚫</Text>
              <View>
                <Text style={styles.rowTitle}>ผู้ใช้ที่บล็อค</Text>
                <Text style={styles.rowSubtitle}>ดูรายชื่อผู้ใช้ที่คุณบล็อค</Text>
              </View>
            </View>
            <Text style={styles.chevron}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>ข้อมูล</Text>
          <TouchableOpacity style={styles.navRow} onPress={() => navigation.navigate('HelpAbout')} activeOpacity={0.85}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>❓</Text>
              <View>
                <Text style={styles.rowTitle}>ช่วยเหลือและเกี่ยวกับ</Text>
                <Text style={styles.rowSubtitle}>FAQ / เงื่อนไข / เวอร์ชัน</Text>
              </View>
            </View>
            <Text style={styles.chevron}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
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
  content: {
    padding: SPACING.xl,
    paddingTop: SPACING.md,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: ROUNDED.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
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
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(123, 201, 164, 0.1)',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(123, 201, 164, 0.1)',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    fontSize: 18,
    marginRight: SPACING.md,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  rowSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chevron: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginLeft: SPACING.md,
    fontWeight: '800',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: ROUNDED.full,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.25)',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.danger,
  },
});

export default SettingsScreen;
