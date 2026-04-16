import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS, ROUNDED, SPACING } from '../theme';

const MatchesScreen = ({ navigation }) => {
  const { state, dispatch } = useApp();

  const items = useMemo(() => state.matches || [], [state.matches]);

  const openChat = (match) => {
    dispatch({ type: 'SET_MATCH', payload: match });
    navigation.navigate('Chat');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton} activeOpacity={0.8}>
          <Text style={styles.headerIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ประวัติการจับคู่</Text>
        <View style={styles.headerButton} />
      </View>

      {items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🤝</Text>
          <Text style={styles.emptyTitle}>ยังไม่มีประวัติการจับคู่</Text>
          <Text style={styles.emptySubtitle}>เริ่มจากกดปุ่มหาเพื่อนใหม่ในหน้า Home</Text>
          <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('Home')} activeOpacity={0.85}>
            <Text style={styles.ctaText}>กลับไปหน้า Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => openChat(item)} activeOpacity={0.85}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatar}>{item.partner?.avatar || '🍵'}</Text>
              </View>
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>{item.partner?.displayName || 'Unknown'}</Text>
                <Text style={styles.itemSubtitle}>แตะเพื่อเริ่มแชท</Text>
              </View>
              <Text style={styles.chevron}>{'>'}</Text>
            </TouchableOpacity>
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
  chevron: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginLeft: SPACING.md,
    fontWeight: '800',
  },
  separator: {
    height: SPACING.md,
  },
});

export default MatchesScreen;
