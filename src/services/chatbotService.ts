import { io, Socket } from 'socket.io-client';
import { ChatMessage } from '@/types/chatbot'; // I'll need to create this type file
import { socketOrigin } from '@/utils/runtimeConfig';

const SOCKET_URL = socketOrigin;

class ChatbotSocketService {
  private socket: Socket | null = null;

  connect(sessionId: string, onMessageReceived: (message: ChatMessage) => void) {
    if (this.socket) return; // Already connected
    if (!SOCKET_URL) {
      console.warn('Chatbot socket disabled because NEXT_PUBLIC_SOCKET_URL is not configured.');
      return;
    }

    this.socket = io(`${SOCKET_URL}/chatbot`, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to chatbot socket server.');
      this.socket?.emit('joinBotChat', sessionId);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from chatbot socket server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Chatbot connection error:', error);
    });

    this.socket.on('botMessage', (message: ChatMessage) => {
      onMessageReceived(message);
    });
  }

  sendMessage(sessionId: string, messageText: string) {
    if (!this.socket) {
      console.error('Socket not initialized. Cannot send message.');
      return;
    }
    this.socket.emit('sendBotMessage', sessionId, messageText);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Disconnected from chatbot socket server.');
    }
  }
}

export const chatbotSocketService = new ChatbotSocketService();
