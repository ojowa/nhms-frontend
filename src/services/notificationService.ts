import { Notification, NotificationPreference } from '@/types/notification';
import api from '@/utils/api';
import { parseDateString } from '@/utils/dateUtils'; // Import the utility

export const getUnreadNotifications = async (): Promise<Notification[]> => {
  const response = await api.get('/notifications');
  // Ensure createdAt is a Date object using the utility function
  return response.data.map((notification: Notification) => ({
    ...notification,
    createdAt: parseDateString(notification.createdAt), // Use utility
  }));
};

export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  await api.put(`/notifications/${notificationId}/read`);
};

export const getNotificationPreferences = async (): Promise<NotificationPreference> => {
  const response = await api.get('/notifications/preferences');
  return response.data;
};

export const updateNotificationPreferences = async (preferences: Partial<NotificationPreference>): Promise<NotificationPreference> => {
  const response = await api.put('/notifications/preferences', preferences);
  return response.data;
};

export const createNotification = async (userId: number, type: string, message: string): Promise<Notification> => {
  const response = await api.post('/notifications', { userId, type, message });
  // Ensure createdAt is a Date object using the utility function
  return {
    ...response.data,
    createdAt: parseDateString(response.data.createdAt), // Use utility
  };
};
