// Matching the backend type definition for consistency
export interface ChatMessage {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'user' | 'bot';
}
