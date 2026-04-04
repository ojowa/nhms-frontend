"use client";

import React from 'react';
import CombinedAppointmentsDataGrid from '@/components/appointments/CombinedAppointmentsDataGrid';
import withAuth from '@/components/auth/withAuth';
import { UserRole } from '@/types/auth';

const MyAppointmentsPage = () => {
  return (
    <div>
      <CombinedAppointmentsDataGrid />
    </div>
  );
};

export default withAuth(MyAppointmentsPage, [UserRole.Officer, UserRole.Patient]);
