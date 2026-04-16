import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS, ROUNDED, SPACING } from '../theme';

const PrivacyScreen = ({ navigation }) => {
  const { state, dispatch } = useApp();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton} activeOpacity={0.8}>
          <Text style={styles.headerIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ความเป็นส่วนตัว</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>การแสดงผล</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>🟢</Text>
              <View>
                <Text style={styles.rowTitle}>แสดงสถานะออนไลน์</Text>
                <Text style={styles.rowSubtitle}>ให้คนอื่นเห็นว่าคุณออนไลน์อยู่หรือไม่</Text>
              </View>
            </View>
            <Switch
              value={!!state.privacy.showOnlineStatus}
              onValueChange={(value) => dispatch({ type: 'SET_PRIVACY', payload: { showOnlineStatus: value } })}
              trackColor={{ true: COLORS.secondary, false: '#DCE6E0' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.rowNoBorder}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>📍</Text>
              <View>
                <Text style={styles.rowTitle}>แชร์ระยะทาง</Text>
                <Text style={styles.rowSubtitle}>แสดงระยะทางโดยประมาณเวลาเจอแมตช์</Text>
              </View>
            </View>
            <Switch
              value={!!state.privacy.shareDistance}
              onValueChange={(value) => dispatch({ type: 'SET_PRIVACY', payload: { shareDistance: value } })}
              trackColor={{ true: COLORS.secondary, false: '#DCE6E0' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>คำแนะนำ</Text>
          <View style={styles.tip}>
            <Text style={styles.tipIcon}>🛡️</Text>
            <Text style={styles.tipText}>อย่าแชร์ข้อมูลส่วนตัว เช่น เบอร์โทร หรือที่อยู่ จนกว่าจะไว้ใจกัน</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipIcon}>🔎</Text>
            <Text style={styles.tipText}>หากเจอพฤติกรรมไม่เหมาะสม สามารถรายงาน/บล็อคได้ในหน้าห้องแชท</Text>
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
  rowNoBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
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
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  tipIcon: {
    fontSize: 18,
    marginRight: SPACING.md,
  },
  tipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
});

export default PrivacyScreen;
