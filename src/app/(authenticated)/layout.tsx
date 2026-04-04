"use client";

import '@/app/globals.css';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { Box, Toolbar } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';

const drawerWidth = 180;

function AuthenticatedLayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { open } = useSidebar();
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 1,
        }}
      >
        <Toolbar />
        {children}
      </Box>
      <ChatbotWidget />
    </Box>
  );
}

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, accessToken, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return null; // Or a loading spinner
  }

  return (
    <NotificationProvider>
      <SidebarProvider>
        <AuthenticatedLayoutContent>{children}</AuthenticatedLayoutContent>
      </SidebarProvider>
    </NotificationProvider>
  );
}
