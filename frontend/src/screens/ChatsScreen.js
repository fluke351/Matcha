import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS, ROUNDED, SPACING } from '../theme';

const ChatsScreen = ({ navigation }) => {
  const { state, dispatch } = useApp();

  const items = useMemo(() => {
    const matches = state.matches || [];

    return matches.map(m => {
      const msgs = state.messagesByMatch?.[m.id] || [];
      const last = msgs.length > 0 ? msgs[msgs.length - 1] : null;
      return { ...m, _lastMessage: last };
    });
  }, [state.matches, state.messagesByMatch]);

  const openChat = (match) => {
    const { _lastMessage, ...clean } = match;
    dispatch({ type: 'SET_MATCH', payload: clean });
    navigation.navigate('Chat');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton} activeOpacity={0.8}>
          <Text style={styles.headerIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>แชท</Text>
        <View style={styles.headerButton} />
      </View>

      {items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>ยังไม่มีห้องแชท</Text>
          <Text style={styles.emptySubtitle}>จับคู่เพื่อนใหม่ก่อน แล้วค่อยกลับมาคุยกันตรงนี้</Text>
          <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('Home')} activeOpacity={0.85}>
            <Text style={styles.ctaText}>ไปหน้า Home</Text>
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
                <Text style={styles.itemSubtitle} numberOfLines={1}>
                  {item._lastMessage?.content || 'แตะเพื่อเริ่มแชท'}
                </Text>
              </View>
              <Text style={styles.itemTime}>
                {item._lastMessage?.createdAt
                  ? new Date(item._lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : ''}
              </Text>
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
  itemTime: {
    marginLeft: SPACING.md,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  separator: {
    height: SPACING.md,
  },
});

export default ChatsScreen;
