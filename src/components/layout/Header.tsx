'use client';
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { useRouter } from 'next/navigation';
import { Button, Box } from '@mui/material';
import Image from 'next/image';

const drawerWidth = 200;

export default function Header() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const { user, logout } = useAuth();
  const { open, toggleSidebar } = useSidebar();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (id: number) => {
    markAsRead(id);
    handleClose();
    // Optionally navigate to a notification details page
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ pr: 3, pl: 2, minHeight: 64 }}>
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          edge="start"
          sx={{ mr: 3 }}
          onClick={toggleSidebar}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
         <Typography variant="h6" noWrap component="div">
            NIS Healthcare Management System
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {user && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mr: 2 }}>
            <Typography variant="body1" sx={{ color: 'white' }}>
              {user.firstName} {user.middleName} {user.lastName}
            </Typography>
            <Typography variant="body2" sx={{ color: 'white' }}>
              {user.roles.join(', ')}
            </Typography>
          </Box>
        )}
        <div>
          <IconButton
            size="large"
            aria-label="show new notifications"
            color="inherit"
            onClick={handleMenu}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={openMenu}
            onClose={handleClose}
          >
            {notifications.length === 0 ? (
              <MenuItem onClick={handleClose}>No new notifications</MenuItem>
            ) : (
              [
                <MenuItem
                  key="mark-all"
                  onClick={() => {
                    markAllAsRead();
                    handleClose();
                  }}
                >
                  <Typography textAlign="center">Mark all as read</Typography>
                </MenuItem>,
                ...notifications.map((notif) => (
                  <MenuItem key={notif.notificationId} onClick={() => handleNotificationClick(notif.notificationId)}>
                    <Typography style={{ fontWeight: notif.isRead ? 'normal' : 'bold' }}>
                      {notif.message}
                      <br />
                      <small>
                        {notif.createdAt ? `${new Date(notif.createdAt).toLocaleDateString()} ${new Date(notif.createdAt).toLocaleTimeString()}` : 'N/A'}
                      </small>
                    </Typography>
                  </MenuItem>
                )),
              ]
            )}
          </Menu>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </div>
        </Box>
      </Toolbar>
    </AppBar>
  );
}