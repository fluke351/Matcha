import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { socket, userApi } from '../services/api';
import { COLORS, ROUNDED, SPACING } from '../theme';

const DISTANCES = [
  { label: '1 km', value: 1 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: 'ไม่จำกัด', value: 1000 },
];

const HomeScreen = ({ navigation }) => {
  const { state, dispatch } = useApp();
  const [radius, setRadius] = useState(10);
  const [isFinding, setIsFinding] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (!isWaiting || !state.user?.userId) return;

    const handleMatchFound = (match) => {
      if (!match) return;
      dispatch({ type: 'SET_MATCH', payload: match });
      dispatch({ type: 'ADD_MATCH', payload: match });
      setIsWaiting(false);
      navigation.navigate('MatchFound');
    };

    socket.connect();
    socket.emit('register', state.user.userId);
    socket.on('match_found', handleMatchFound);

    return () => {
      socket.off('match_found', handleMatchFound);
    };
  }, [isWaiting, state.user?.userId]);

  const handleCancelWait = async () => {
    try {
      if (!state.user?.userId) return;
      await userApi.findMatch(state.user.userId, 0, 0, radius, { cancel: 1 });
    } catch (e) {
    } finally {
      setIsWaiting(false);
    }
  };

  const handleFindMatch = async () => {
    try {
      setIsFinding(true);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('คำเตือน', 'กรุณาอนุญาตให้เข้าถึงตำแหน่งที่ตั้งเพื่อหาเพื่อนใกล้ตัว 🍵');
        setIsFinding(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      await userApi.updateLocation(state.user.userId, latitude, longitude);

      const response = await userApi.findMatch(state.user.userId, latitude, longitude, radius, {
        testMode: state.settings?.testMode ? 1 : 0,
        forceBot: state.settings?.testMode ? 1 : 0,
      });

      if (response.data.success) {
        if (response.data.match) {
          dispatch({ type: 'SET_MATCH', payload: response.data.match });
          dispatch({ type: 'ADD_MATCH', payload: response.data.match });
          navigation.navigate('MatchFound');
        } else {
          setIsWaiting(true);
        }
      }
    } catch (error) {
      console.error('Find match failed:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsFinding(false);
    }
  };

  return (
    <LinearGradient
      colors={['#F8FBF9', '#EEF9F3', '#F8FBF9']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.mainContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.topActions}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Notifications')}
                activeOpacity={0.8}
                style={styles.topAction}
              >
                <Text style={styles.topActionIcon}>🔔</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Chats')}
                activeOpacity={0.8}
                style={styles.topAction}
              >
                <Text style={styles.topActionIcon}>💬</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Matches')}
                activeOpacity={0.8}
                style={styles.topAction}
              >
                <Text style={styles.topActionIcon}>🤝</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                activeOpacity={0.8}
                style={styles.topAction}
              >
                <Text style={styles.topActionIcon}>⚙️</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.profileCard}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={() => navigation.navigate('Profile')}
                activeOpacity={0.85}
              >
                <Text style={styles.userEmoji}>{state.user?.avatar || '🍵'}</Text>
                <View style={styles.onlineBadge} />
              </TouchableOpacity>
              <Text style={styles.userName}>{state.user?.displayName || 'Matcha User'}</Text>
              <View style={styles.interestsRow}>
                {state.interests.length === 0 ? (
                  <View style={styles.interestTagMuted}>
                    <Text style={styles.interestTextMuted}>ยังไม่ได้เลือกความสนใจ</Text>
                  </View>
                ) : (
                  <>
                    {state.interests.slice(0, 3).map((interest, idx) => (
                      <View key={idx} style={styles.interestTag}>
                        <Text style={styles.interestText}>#{interest}</Text>
                      </View>
                    ))}
                    {state.interests.length > 3 && (
                      <Text style={styles.moreInterests}>+{state.interests.length - 3}</Text>
                    )}
                  </>
                )}
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Interests')}
                activeOpacity={0.8}
                style={styles.editInterestsButton}
              >
                <Text style={styles.editInterestsText}>
                  {state.interests.length === 0 ? 'เลือกความสนใจ' : 'แก้ไขความสนใจ'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.center}>
            <View style={styles.actionCard}>
              <Text style={styles.actionTitle}>พร้อมหาเพื่อนใหม่แล้วไหม</Text>
              <Text style={styles.actionSubtitle}>
                {isWaiting ? 'กำลังรอเพื่อนใหม่กดหาอยู่...' : isFinding ? 'กำลังค้นหาเพื่อนใหม่ใกล้ตัว...' : 'แตะปุ่มด้านล่างเพื่อเริ่มค้นหา'}
              </Text>

              <View style={styles.findButtonWrapper}>
                <LinearGradient
                  colors={[COLORS.secondary, COLORS.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.findButtonOuter}
                >
                  <TouchableOpacity
                    style={[styles.findButton, (isFinding || isWaiting) && styles.findButtonDisabled]}
                    onPress={handleFindMatch}
                    disabled={isFinding || isWaiting}
                    activeOpacity={0.9}
                  >
                    {isFinding || isWaiting ? (
                      <ActivityIndicator color="#FFFFFF" size="large" />
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.buttonIcon}>🔍</Text>
                        <Text style={styles.buttonText}>หาเพื่อนใหม่</Text>
                        <Text style={styles.buttonSparkle}>✨</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </LinearGradient>
              </View>
              <Text style={styles.actionHint}>กำลังค้นหาในระยะ {radius >= 1000 ? 'ไม่จำกัด' : `${radius} km`}</Text>
              {isWaiting && (
                <TouchableOpacity style={styles.cancelWaitButton} onPress={handleCancelWait} activeOpacity={0.85}>
                  <Text style={styles.cancelWaitText}>ยกเลิกการรอ</Text>
                </TouchableOpacity>
              )}
              {state.interests.length === 0 && (
                <Text style={styles.actionWarn}>แนะนำให้เลือกความสนใจก่อน เพื่อจับคู่ได้ตรงใจขึ้น</Text>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.distanceHeader}>
              <Text style={{ fontSize: 16 }}>📍</Text>
              <Text style={styles.distanceLabel}>เลือกระยะทางค้นหา</Text>
            </View>
            <View style={styles.distanceRow}>
              {DISTANCES.map(d => (
                <TouchableOpacity
                  key={d.value}
                  style={[
                    styles.distanceChip,
                    radius === d.value && styles.distanceChipSelected
                  ]}
                  onPress={() => setRadius(d.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.distanceText,
                    radius === d.value && styles.distanceTextSelected
                  ]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  mainContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  topActions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: SPACING.md,
  },
  topAction: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  topActionIcon: {
    fontSize: 16,
  },
  profileCard: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: ROUNDED.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: ROUNDED.full,
    borderWidth: 3,
    borderColor: 'rgba(123, 201, 164, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  userEmoji: {
    fontSize: 50,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CD964',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: SPACING.md,
    letterSpacing: -0.5,
  },
  interestsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  interestTag: {
    backgroundColor: 'rgba(123, 201, 164, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: ROUNDED.sm,
    marginHorizontal: 3,
  },
  interestTagMuted: {
    backgroundColor: 'rgba(99, 110, 114, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: ROUNDED.sm,
    marginHorizontal: 3,
  },
  interestText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  interestTextMuted: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  moreInterests: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  editInterestsButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: ROUNDED.md,
    backgroundColor: 'rgba(123, 201, 164, 0.14)',
  },
  editInterestsText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
  actionCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: ROUNDED.lg,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  actionSubtitle: {
    marginTop: SPACING.xs,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  findButtonWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  findButtonOuter: {
    width: 224,
    height: 224,
    borderRadius: 112,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 22,
    elevation: 12,
  },
  findButton: {
    width: 208,
    height: 208,
    borderRadius: 104,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  findButtonDisabled: {
    backgroundColor: '#B2D8C1',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonContent: {
    alignItems: 'center',
    position: 'relative',
  },
  buttonIcon: {
    fontSize: 52,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: SPACING.sm,
    letterSpacing: 0.5,
  },
  buttonSparkle: {
    fontSize: 18,
    position: 'absolute',
    top: -18,
    right: -18,
  },
  actionHint: {
    marginTop: SPACING.lg,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  actionWarn: {
    marginTop: SPACING.xs,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accent,
    textAlign: 'center',
  },
  cancelWaitButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    borderRadius: ROUNDED.full,
    backgroundColor: 'rgba(231, 76, 60, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.25)',
  },
  cancelWaitText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.danger,
  },
  footer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: SPACING.lg,
    borderRadius: ROUNDED.lg,
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  distanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  distanceLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '700',
    marginLeft: 6,
  },
  distanceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  distanceChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: ROUNDED.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.2)',
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    minWidth: 74,
    alignItems: 'center',
  },
  distanceChipSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  distanceText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  distanceTextSelected: {
    color: '#FFFFFF',
  },
});

export default HomeScreen;
