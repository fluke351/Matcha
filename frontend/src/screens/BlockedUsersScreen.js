import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { safetyApi } from '../services/api';
import { COLORS, ROUNDED, SPACING } from '../theme';

const BlockedUsersScreen = ({ navigation }) => {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!state.user?.userId) return;
      try {
        setLoading(true);
        const res = await safetyApi.getBlocked(state.user.userId);
        if (res.data?.success) {
          setBlocked(res.data.blocked || []);
          dispatch({ type: 'SET_BLOCKED', payload: res.data.blocked || [] });
        }
      } catch (e) {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดรายชื่อผู้ใช้ที่บล็อคได้');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [state.user?.userId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton} activeOpacity={0.8}>
          <Text style={styles.headerIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ผู้ใช้ที่บล็อค</Text>
        <View style={styles.headerButton} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.secondary} />
          <Text style={styles.centerText}>กำลังโหลด...</Text>
        </View>
      ) : blocked.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyTitle}>ยังไม่มีผู้ใช้ที่บล็อค</Text>
          <Text style={styles.emptySubtitle}>คุณสามารถบล็อคได้จากหน้าแชทเมื่อเจอพฤติกรรมไม่เหมาะสม</Text>
        </View>
      ) : (
        <FlatList
          data={blocked}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatar}>{item.avatar || '🍵'}</Text>
              </View>
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>{item.displayName || 'Unknown'}</Text>
                <Text style={styles.itemSubtitle}>ถูกบล็อคแล้ว</Text>
              </View>
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
  center: {
    flex: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    marginTop: SPACING.sm,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
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
  avatarWrap: {
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
  avatar: {
    fontSize: 22,
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
  },
  separator: {
    height: SPACING.md,
  },
});

export default BlockedUsersScreen;
