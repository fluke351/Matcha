import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS, ROUNDED, SPACING } from '../theme';

const NotificationsScreen = ({ navigation }) => {
  const { state } = useApp();

  const items = useMemo(
    () => [
      { id: 'n1', icon: '🍵', title: 'ยินดีต้อนรับสู่ Matcha', subtitle: 'เริ่มจากการเลือกความสนใจของคุณ', time: 'เมื่อสักครู่' },
      { id: 'n2', icon: '🛡️', title: 'ทิปความปลอดภัย', subtitle: 'อย่าแชร์ข้อมูลส่วนตัวจนกว่าจะไว้ใจกัน', time: 'วันนี้' },
      { id: 'n3', icon: '✨', title: 'พร้อมหาเพื่อนใหม่', subtitle: 'กดปุ่ม “หาเพื่อนใหม่” เพื่อเริ่มจับคู่', time: 'เมื่อวาน' },
    ],
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton} activeOpacity={0.8}>
          <Text style={styles.headerIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>การแจ้งเตือน</Text>
        <View style={styles.headerButton} />
      </View>

      {!state.settings.notificationsEnabled ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>🔕</Text>
          <Text style={styles.emptyTitle}>ปิดการแจ้งเตือนอยู่</Text>
          <Text style={styles.emptySubtitle}>เปิดได้ที่หน้า ตั้งค่า เพื่อรับข่าวสารและอัปเดต</Text>
          <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('Settings')} activeOpacity={0.85}>
            <Text style={styles.ctaText}>ไปที่ตั้งค่า</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemIconWrap}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
              </View>
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.itemTime}>{item.time}</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  list: {
    padding: SPACING.xl,
    paddingTop: SPACING.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: ROUNDED.lg,
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.12)',
    padding: SPACING.lg,
  },
  itemIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.14)',
    marginRight: SPACING.md,
  },
  itemIcon: {
    fontSize: 20,
  },
  itemBody: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.text,
  },
  itemSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  itemTime: {
    marginLeft: SPACING.md,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  separator: {
    height: SPACING.md,
  },
  emptyWrap: {
    flex: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },
  emptySubtitle: {
    marginTop: SPACING.sm,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  cta: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.secondary,
    borderRadius: ROUNDED.full,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default NotificationsScreen;
