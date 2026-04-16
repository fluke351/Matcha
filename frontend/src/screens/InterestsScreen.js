import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { userApi } from '../services/api';
import { COLORS, ROUNDED, SPACING } from '../theme';

const INTERESTS = [
  { id: 'gaming', emoji: '🎮', label: 'เล่นเกม' },
  { id: 'music', emoji: '🎵', label: 'ฟังเพลง' },
  { id: 'dev', emoji: '💻', label: 'เขียนโปรแกรม' },
  { id: 'reading', emoji: '📚', label: 'อ่านหนังสือ' },
  { id: 'cooking', emoji: '🍳', label: 'ทำอาหาร' },
  { id: 'fitness', emoji: '🏃', label: 'ออกกำลังกาย' },
  { id: 'movies', emoji: '🎬', label: 'ดูหนัง' },
  { id: 'travel', emoji: '✈️', label: 'ท่องเที่ยว' },
  { id: 'pets', emoji: '🐱', label: 'รักสัตว์' },
  { id: 'art', emoji: '🎨', label: 'ศิลปะ' }
];

const InterestsScreen = ({ navigation }) => {
  const { state, dispatch } = useApp();
  const [selected, setSelected] = useState(state.interests || []);
  const [loading, setLoading] = useState(false);

  const toggleInterest = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleNext = async () => {
    if (selected.length < 3) {
      Alert.alert('เลือกความสนใจ', 'กรุณาเลือกอย่างน้อย 3 อย่างเพื่อให้แมตช์ได้แม่นยำขึ้น 🍵');
      return;
    }

    try {
      setLoading(true);
      const response = await userApi.updateInterests(state.user.userId, selected);
      if (response.data.success) {
        dispatch({ type: 'SET_INTERESTS', payload: selected });
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Update interests failed:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const isSelected = selected.includes(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.chip,
          isSelected && styles.chipSelected
        ]}
        onPress={() => toggleInterest(item.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.chipEmoji}>{item.emoji}</Text>
        <Text style={[
          styles.chipLabel,
          isSelected && styles.chipLabelSelected
        ]}>
          {item.label}
        </Text>
        {isSelected && <Text style={{ color: '#FFFFFF', marginLeft: 4 }}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <Text style={styles.title}>คุณสนใจอะไรบ้าง? 🍵</Text>
          <Text style={styles.subtitle}>เลือกอย่างน้อย 3 อย่าง เพื่อหาเพื่อนที่คอเดียวกัน</Text>
        </View>

        <FlatList
          data={INTERESTS}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, selected.length < 3 && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={loading || selected.length < 3}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.buttonInner}>
                <Text style={styles.buttonText}>
                  ไปกันเลย ({selected.length}/3)
                </Text>
                <Text style={{ color: '#FFFFFF', fontSize: 20 }}>></Text>
              </View>
            )}
          </TouchableOpacity>
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
    padding: SPACING.lg,
  },
  header: {
    marginTop: 60,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.secondary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 22,
  },
  list: {
    paddingBottom: SPACING.xl,
  },
  row: {
    justifyContent: 'space-between',
  },
  chip: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: ROUNDED.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.1)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    position: 'relative',
  },
  chipSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  chipEmoji: {
    fontSize: 22,
    marginRight: SPACING.sm,
  },
  chipLabel: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '600',
  },
  chipLabelSelected: {
    color: '#FFFFFF',
  },
  footer: {
    paddingVertical: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.secondary,
    borderRadius: ROUNDED.full,
    elevation: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  buttonDisabled: {
    backgroundColor: '#B2D8C1',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
});

export default InterestsScreen;
