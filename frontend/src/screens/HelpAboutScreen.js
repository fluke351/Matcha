import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, ROUNDED, SPACING } from '../theme';

const HelpAboutScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton} activeOpacity={0.8}>
          <Text style={styles.headerIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ช่วยเหลือและเกี่ยวกับ</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>เกี่ยวกับ Matcha</Text>
          <Text style={styles.paragraph}>
            Matcha คือแอปสำหรับค้นหาเพื่อนใหม่จากความสนใจและระยะทางใกล้ตัว พร้อมระบบรายงาน/บล็อคเพื่อความปลอดภัย
          </Text>
          <View style={styles.badgesRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>🍵</Text>
              <Text style={styles.badgeText}>Social Discovery</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>🛡️</Text>
              <Text style={styles.badgeText}>Safety First</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>คำถามที่พบบ่อย</Text>
          <View style={styles.qa}>
            <Text style={styles.q}>Q: ทำไมต้องเปิด Location?</Text>
            <Text style={styles.a}>A: เพื่อค้นหาเพื่อนใหม่ในระยะที่คุณเลือกได้อย่างแม่นยำ</Text>
          </View>
          <View style={styles.qa}>
            <Text style={styles.q}>Q: ถ้าเจอคนไม่เหมาะสมทำยังไง?</Text>
            <Text style={styles.a}>A: กดรายงานหรือบล็อคในหน้าแชทได้ทันที</Text>
          </View>
          <View style={styles.qa}>
            <Text style={styles.q}>Q: แก้ไขความสนใจได้ไหม?</Text>
            <Text style={styles.a}>A: ได้ ไปที่หน้าโปรไฟล์หรือกด “แก้ไขความสนใจ” จากหน้า Home</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>ลิงก์สำคัญ</Text>
          <View style={styles.linkItem}>
            <Text style={styles.linkIcon}>📄</Text>
            <Text style={styles.linkText}>ข้อตกลงการใช้งาน (ตัวอย่าง)</Text>
          </View>
          <View style={styles.linkItem}>
            <Text style={styles.linkIcon}>🔐</Text>
            <Text style={styles.linkText}>นโยบายความเป็นส่วนตัว (ตัวอย่าง)</Text>
          </View>
          <View style={styles.linkItem}>
            <Text style={styles.linkIcon}>🧾</Text>
            <Text style={styles.linkText}>เวอร์ชันแอป: 1.0.0</Text>
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
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  paragraph: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  badge: {
    flex: 0.48,
    backgroundColor: '#FFFFFF',
    borderRadius: ROUNDED.lg,
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.12)',
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    fontSize: 22,
    marginBottom: SPACING.xs,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.text,
  },
  qa: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(123, 201, 164, 0.1)',
  },
  q: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.text,
  },
  a: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(123, 201, 164, 0.1)',
  },
  linkIcon: {
    fontSize: 18,
    marginRight: SPACING.md,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});

export default HelpAboutScreen;
