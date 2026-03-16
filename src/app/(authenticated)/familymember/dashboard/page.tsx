'use client';

import React from 'react';
import withAuth from '@/components/auth/withAuth';

function FamilyMemberDashboardPage() {
  return (
    <div>
      <h1>Family Member Dashboard</h1>
      <p>Welcome to the Family Member Dashboard!</p>
    </div>
  );
}

export default withAuth(FamilyMemberDashboardPage, ['FamilyMember']);
