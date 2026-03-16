'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext'; // Assuming AuthContext is in the same directory
import { parseDateString } from '@/utils/dateUtils'; // Import the utility
import { Notification } from '@/types/notification'; // Ensure Notification interface is imported from its source
import { socketOrigin } from '@/utils/runtimeConfig';

interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user, accessToken } = useAuth(); // Get token from AuthContext
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/rules-of-hooks
  useEffect(() => {
    if (accessToken && user && socketOrigin) {
      const socketUrl = `${socketOrigin}/notifications`;
      console.log(`[Frontend] Initializing socket connection to: ${socketUrl} for user: ${user.userId}`);
      const newSocket = io(socketUrl, {
        query: { userId: user.userId },
        extraHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      newSocket.on('connect', () => {
        console.log('[Frontend] Socket connected successfully:', newSocket.id);
      });

      newSocket.on('connect_error', (error) => {
        console.error('[Frontend] Socket connection error:', error);
      });

      newSocket.on('newNotification', (newNotification: Notification) => {
        console.log('[Frontend] Received new notification:', newNotification);
        // Ensure createdAt is a Date object, as it might come as a string from the backend
        const processedNotification = {
          ...newNotification,
          createdAt: parseDateString(newNotification.createdAt), // Use utility
        };
        setNotifications((prev) => [processedNotification, ...prev]);
      });

       
       
      setSocket(newSocket);

      return () => {
        console.log('[Frontend] Disconnecting socket.');
        newSocket.disconnect();
      };
    }

    if (accessToken && user && !socketOrigin) {
      console.warn('[Frontend] Notification socket disabled because NEXT_PUBLIC_SOCKET_URL is not configured.');
    }
  }, [accessToken, user]);

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.notificationId === id ? { ...notif, isRead: true } : notif))
    );
    // Optionally, send update to backend
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
    // Optionally, send update to backend
  };

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
