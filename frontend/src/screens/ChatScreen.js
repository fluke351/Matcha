import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { chatApi, socket, safetyApi } from '../services/api';
import { COLORS, ROUNDED, SPACING } from '../theme';

const ChatScreen = ({ navigation }) => {
  const { state, dispatch } = useApp();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);
  const match = state.currentMatch;
  const messages = match ? (state.messagesByMatch[match.id] || []) : [];

  useEffect(() => {
    if (!match) {
      navigation.navigate('Home');
      return;
    }

    socket.connect();
    socket.emit('join_match', match.id, state.user.userId);

    const handleNewMessage = (message) => {
      dispatch({ type: 'ADD_MESSAGE', payload: message });
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', ({ userId, isTyping }) => {
      if (userId !== state.user.userId) setIsTyping(isTyping);
    });

    (async () => {
      try {
        const res = await chatApi.getMessages(match.id, state.user.userId);
        if (res.data?.success) {
          dispatch({ type: 'SET_MESSAGES', payload: { matchId: match.id, messages: res.data.messages || [] } });
        }
      } catch (e) {}
    })();

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing');
      socket.disconnect();
    };
  }, [match, state.user?.userId]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      const messageContent = inputText.trim();
      setInputText('');
      socket.emit('typing', { matchId: match.id, userId: state.user.userId, isTyping: false });
      await chatApi.sendMessage(match.id, state.user.userId, messageContent);
    } catch (error) {
      console.error('Send message failed:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'ข้ามการสนทนา',
      'คุณแน่ใจหรือไม่ว่าต้องการข้ามการสนทนานี้?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ข้าม 🍵', 
          style: 'destructive',
          onPress: async () => {
            try {
              await chatApi.skipMatch(match.id, state.user.userId);
              dispatch({ type: 'SET_MATCH', payload: null });
              dispatch({ type: 'SET_MESSAGES', payload: { matchId: match.id, messages: [] } });
              navigation.navigate('Home');
            } catch (error) {
              console.error('Skip failed:', error);
            }
          }
        }
      ]
    );
  };

  const handleReport = () => {
    Alert.alert(
      'รายงานผู้ใช้',
      'กรุณาเลือกเหตุผลในการรายงาน',
      [
        { text: 'สแปม / โฆษณา', onPress: () => submitReport('spam') },
        { text: 'คำพูดไม่เหมาะสม', onPress: () => submitReport('harassment') },
        { text: 'เนื้อหา 18+', onPress: () => submitReport('inappropriate') },
        { text: 'ยกเลิก', style: 'cancel' }
      ]
    );
  };

  const submitReport = async (reason) => {
    try {
      await safetyApi.report(state.user.userId, match.partner.id, reason, '');
      Alert.alert('ขอบคุณ', 'เราได้รับรายงานของคุณแล้ว และจะดำเนินการตรวจสอบโดยเร็วที่สุด 🍵');
      handleSkip();
    } catch (error) {
      console.error('Report failed:', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isSelf = item.senderId === state.user.userId;
    return (
      <View style={[styles.messageContainer, isSelf ? styles.messageSelf : styles.messageOther]}>
        <View style={[styles.bubble, isSelf ? styles.bubbleSelf : styles.bubbleOther]}>
          <Text style={[styles.messageText, isSelf ? styles.messageTextSelf : styles.messageTextOther]}>
            {item.content}
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  if (!match) return null;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
            <Text style={{ fontSize: 24 }}>{"<"}</Text>
          </TouchableOpacity>
          <View style={styles.avatarWrapper}>
            <Text style={styles.partnerAvatar}>{match.partner.avatar}</Text>
            <View style={styles.onlineBadge} />
          </View>
          <View>
            <Text style={styles.partnerName}>{match.partner.displayName}</Text>
            {isTyping ? (
              <Text style={styles.typingText}>กำลังพิมพ์...</Text>
            ) : (
              <Text style={styles.onlineText}>ออนไลน์</Text>
            )}
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleReport} style={styles.headerIcon}>
            <Text style={{ fontSize: 20 }}>🛡️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSkip} style={[styles.headerIcon, styles.skipIcon]}>
            <Text style={{ fontSize: 20 }}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.inputArea}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="พิมพ์ข้อความ... 🍵"
            placeholderTextColor={COLORS.textSecondary + '88'}
            value={inputText}
            onChangeText={(text) => {
              setInputText(text);
              socket.emit('typing', { matchId: match.id, userId: state.user.userId, isTyping: text.length > 0 });
            }}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 14 }}>ส่ง</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9F4',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(123, 201, 164, 0.1)',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 4,
    padding: 4,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: SPACING.sm,
  },
  partnerAvatar: {
    fontSize: 32,
    backgroundColor: '#F0F9F4',
    width: 44,
    height: 44,
    borderRadius: 22,
    textAlign: 'center',
    lineHeight: 44,
    overflow: 'hidden',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CD964',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  typingText: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  onlineText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerIcon: {
    padding: 8,
    marginLeft: 4,
  },
  messageList: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  messageContainer: {
    marginBottom: SPACING.md,
    maxWidth: '80%',
  },
  messageSelf: {
    alignSelf: 'flex-end',
  },
  messageOther: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bubbleSelf: {
    backgroundColor: COLORS.secondary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextSelf: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  messageTextOther: {
    color: COLORS.text,
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputArea: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.md,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(123, 201, 164, 0.1)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8FBF9',
    borderRadius: 24,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(123, 201, 164, 0.2)',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: COLORS.text,
  },
  sendButton: {
    backgroundColor: COLORS.secondary,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#B2D8C1',
  },
});

export default ChatScreen;
