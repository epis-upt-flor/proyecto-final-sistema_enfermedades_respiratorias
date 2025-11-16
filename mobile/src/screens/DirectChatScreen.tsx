import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Card, TextInput, Button, Title, Paragraph, Avatar } from 'react-native-paper';
import { RootStackParamList } from '../types';
import { useAppStore } from '../store/useAppStore';
import { analyticsService } from '../services/analyticsService';

type Props = {
  route: RouteProp<RootStackParamList, 'DirectChat'>;
};

interface ChatMessage {
  id: string;
  from: 'me' | 'other';
  text: string;
  createdAt: string;
}

const DirectChatScreen: React.FC<Props> = () => {
  const { params } = useRoute<Props['route']>();
  const user = useAppStore((s) => s.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    analyticsService.logEvent('chat.direct_open', {
      patientId: params.patientId,
      role: user?.role,
    });
  }, [params.patientId, user?.role]);

  const scrollToEnd = () => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  const sendMessage = useCallback(() => {
    if (!text.trim()) return;
    const now = new Date().toISOString();
    const myMessage: ChatMessage = {
      id: `${Date.now()}_me`,
      from: 'me',
      text: text.trim(),
      createdAt: now,
    };
    setMessages((prev) => [...prev, myMessage]);
    analyticsService.logEvent('chat.direct_message', {
      toPatientId: params.patientId,
      length: text.trim().length,
    });
    setText('');
    scrollToEnd();

    // Simular respuesta automática del otro lado para UX básica
    setTimeout(() => {
      const reply: ChatMessage = {
        id: `${Date.now()}_other`,
        from: 'other',
        text: 'Mensaje recibido. Un profesional lo revisará en breve.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, reply]);
      scrollToEnd();
    }, 1500);
  }, [params.patientId, text]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isMine = item.from === 'me';
          return (
            <View
              style={[
                styles.messageRow,
                { justifyContent: isMine ? 'flex-end' : 'flex-start' },
              ]}
            >
              {!isMine && <Avatar.Text size={32} label="Dr" style={styles.avatar} />}
              <Card
                style={[
                  styles.messageCard,
                  isMine ? styles.messageMe : styles.messageOther,
                ]}
              >
                <Card.Content>
                  <Paragraph style={styles.messageText}>{item.text}</Paragraph>
                </Card.Content>
              </Card>
            </View>
          );
        }}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          mode="outlined"
          placeholder="Escribe un mensaje..."
          value={text}
          onChangeText={setText}
          multiline
        />
        <Button mode="contained" onPress={sendMessage} style={styles.sendButton}>
          Enviar
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  messageCard: {
    maxWidth: '80%',
  },
  messageMe: {
    backgroundColor: '#1976d2',
  },
  messageOther: {
    backgroundColor: '#ffffff',
  },
  messageText: {
    color: '#fff',
  },
  avatar: {
    marginRight: 8,
    backgroundColor: '#1976d2',
  },
  inputRow: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    marginRight: 8,
  },
  sendButton: {
    alignSelf: 'flex-end',
  },
});

export default DirectChatScreen;


