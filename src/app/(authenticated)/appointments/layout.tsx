'use client';

import { useAuth } from '@/contexts/AuthContext';
import withAuth from '@/components/auth/withAuth';
import React from 'react';

function AppointmentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default withAuth(AppointmentsLayout, ['Patient', 'Officer']);