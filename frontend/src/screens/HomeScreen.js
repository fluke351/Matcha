import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useApp } from '../context/AppContext';
import { userApi } from '../services/api';
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

      const response = await userApi.findMatch(state.user.userId, latitude, longitude, radius);

      if (response.data.success) {
        if (response.data.match) {
          dispatch({ type: 'SET_MATCH', payload: response.data.match });
          navigation.navigate('MatchFound');
        } else {
          Alert.alert('ไม่พบเพื่อนใหม่', 'ลองเพิ่มระยะทางหรือเปลี่ยนความสนใจดูนะ 🍵');
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
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.userEmoji}>{state.user?.avatar || '🍵'}</Text>
            <View style={styles.onlineBadge} />
          </View>
          <Text style={styles.userName}>{state.user?.displayName || 'Matcha User'}</Text>
          <View style={styles.interestsRow}>
            {state.interests.slice(0, 3).map((interest, idx) => (
              <View key={idx} style={styles.interestTag}>
                <Text style={styles.interestText}>#{interest}</Text>
              </View>
            ))}
            {state.interests.length > 3 && (
              <Text style={styles.moreInterests}>+{state.interests.length - 3}</Text>
            )}
          </View>
        </View>

        <View style={styles.center}>
          <View style={styles.findButtonWrapper}>
            <TouchableOpacity
              style={[styles.findButton, isFinding && styles.findButtonDisabled]}
              onPress={handleFindMatch}
              disabled={isFinding}
              activeOpacity={0.9}
            >
              {isFinding ? (
                <ActivityIndicator color="#FFFFFF" size="large" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={{ fontSize: 48 }}>🔍</Text>
                  <Text style={styles.buttonText}>Find Someone</Text>
                  <Text style={{ fontSize: 20, position: 'absolute', top: -20, right: -20 }}>✨</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>
            {isFinding ? 'กำลังตามหาเพื่อนใหม่ใกล้ตัว...' : 'แตะเพื่อเริ่มค้นหาเพื่อนใหม่'}
          </Text>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainContent: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  avatarContainer: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
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
    color: COLORS.secondary,
    marginTop: SPACING.md,
    letterSpacing: -0.5,
  },
  interestsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  interestTag: {
    backgroundColor: 'rgba(123, 201, 164, 0.15)',
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
  moreInterests: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  findButtonWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  findButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  findButtonDisabled: {
    backgroundColor: '#B2D8C1',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonContent: {
    alignItems: 'center',
    position: 'relative',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: SPACING.sm,
    letterSpacing: 0.5,
  },
  hint: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 40,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: SPACING.lg,
    borderRadius: ROUNDED.lg,
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.1)',
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
    justifyContent: 'space-between',
  },
  distanceChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: ROUNDED.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.2)',
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
