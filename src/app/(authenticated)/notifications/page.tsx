'use client';
import { Typography, Box, Paper, List, ListItem, ListItemText } from '@mui/material';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getUnreadNotifications } from '@/services/notificationService';
import { Notification } from '@/types/notification';

function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const data = await getUnreadNotifications();
          setNotifications(data);
        } catch (err) {
          setError('Failed to fetch notifications.');
        } finally {
          setLoading(false);
        }
      };

      fetchNotifications();
    }
  }, [user]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Notifications
      </Typography>
      <Paper>
        {loading && <Typography sx={{ p: 2 }}>Loading...</Typography>}
        {error && <Typography color="error" sx={{ p: 2 }}>{error}</Typography>}
        {!loading && !error && (
          <List>
            {notifications.map((notification) => (
              <ListItem key={notification.notificationId} divider sx={{ backgroundColor: notification.isRead ? 'transparent' : 'action.hover' }}>
                <ListItemText
                  primary={notification.message}
                  secondary={notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'N/A'}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}

export default withAuth(NotificationsPage);