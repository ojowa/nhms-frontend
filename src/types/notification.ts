export interface Notification {
  notificationId: number;
  userId: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: Date | null; // Changed to allow null
}

export interface NotificationPreference {
  userId: number;
  inAppNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;

  newPrescriptions?: boolean;
  newLabResults?: boolean;
  newChatMessages?: boolean;
}