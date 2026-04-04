import { Notification, NotificationPreference } from '@/types/notification';
import { apiClient } from '@/utils/api-client';

export const getUnreadNotifications = async (): Promise<Notification[]> => {
  return apiClient.get<Notification[]>('/notifications');
};

export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  await apiClient.put<void>(`/notifications/${notificationId}/read`);
};

export const getNotificationPreferences = async (): Promise<NotificationPreference> => {
  return apiClient.get<NotificationPreference>('/notifications/preferences');
};

export const updateNotificationPreferences = async (preferences: Partial<NotificationPreference>): Promise<NotificationPreference> => {
  return apiClient.put<NotificationPreference>('/notifications/preferences', preferences);
};

export const createNotification = async (userId: number, type: string, message: string): Promise<Notification> => {
  return apiClient.post<Notification>('/notifications', { userId, type, message });
};
