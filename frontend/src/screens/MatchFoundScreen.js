import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { chatApi } from '../services/api';
import { COLORS, ROUNDED, SPACING } from '../theme';

const MatchFoundScreen = ({ navigation }) => {
  const { state, dispatch } = useApp();
  const match = state.currentMatch;

  const handleSkip = async () => {
    try {
      await chatApi.skipMatch(match.id, state.user.userId);
      dispatch({ type: 'SET_MATCH', payload: null });
      navigation.navigate('Home');
    } catch (error) {
      console.error('Skip match failed:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถยกเลิกการแมตช์ได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleContinue = () => {
    navigation.navigate('Chat');
  };

  if (!match) return null;

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <View style={styles.heartContainer}>
            <Text style={{ fontSize: 40 }}>❤️</Text>
          </View>
          <Text style={styles.title}>เจอคนที่ใช่แล้ว! 🍵</Text>
          <Text style={styles.subtitle}>ลองทักทายเพื่อนใหม่ของคุณดูสิ</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.avatarWrapper}>
            <Text style={styles.partnerAvatar}>{match.partner.avatar || '🍵'}</Text>
            <View style={styles.matchBadge}>
              <Text style={styles.matchBadgeText}>100% Match</Text>
            </View>
          </View>
          
          <Text style={styles.partnerName}>{match.partner.displayName}</Text>
          
          <View style={styles.interestsContainer}>
            <Text style={styles.interestsTitle}>สิ่งที่สนใจตรงกัน:</Text>
            <View style={styles.interestsRow}>
              {match.partner.interests.map(i => (
                <View key={i} style={styles.interestChip}>
                  <Text style={styles.interestText}>#{i}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.skipButton]}
            onPress={handleSkip}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 20 }}>✕</Text>
            <Text style={styles.skipButtonText}>ไว้ก่อนนะ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.continueButton]}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 20 }}>💬</Text>
            <Text style={styles.continueButtonText}>เริ่มคุยเลย</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
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
  heartContainer: {
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: SPACING.md,
    borderRadius: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: SPACING.xl,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    marginVertical: SPACING.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  partnerAvatar: {
    fontSize: 100,
    backgroundColor: '#F0F9F4',
    width: 160,
    height: 160,
    textAlign: 'center',
    lineHeight: 160,
    borderRadius: 80,
    overflow: 'hidden',
  },
  matchBadge: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: ROUNDED.full,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  matchBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  partnerName: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    letterSpacing: -0.5,
  },
  interestsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  interestsTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  interestChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: ROUNDED.md,
    backgroundColor: 'rgba(123, 201, 164, 0.1)',
    margin: 4,
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.2)',
  },
  interestText: {
    fontSize: 13,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  button: {
    flex: 0.48,
    flexDirection: 'row',
    paddingVertical: SPACING.md + 4,
    borderRadius: ROUNDED.full,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  skipButton: {
    backgroundColor: '#FFFFFF',
  },
  skipButtonText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: COLORS.secondary,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
});

export default MatchFoundScreen;
