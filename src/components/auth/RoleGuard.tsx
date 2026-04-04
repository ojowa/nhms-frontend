'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/auth';
import { getDashboardPath } from '@/utils/getDashboardPath';

// A simple loading component. In a real app, this would be a more advanced spinner.
const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-600 font-medium">Verifying access permissions...</p>
  </div>
);

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[]; // e.g., ['Admin', 'Doctor']
}

const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const router = useRouter();
  // Start with 'checking' state to handle async verification and prevent content flicker
  const [authStatus, setAuthStatus] = useState<'checking' | 'authorized' | 'unauthorized'>('checking');

  useEffect(() => {
    const checkAuthorization = () => {
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        // Not logged in, redirect to the login page
        router.replace('/login');
        return;
      }

      try {
        const user: User = JSON.parse(userStr);

        // Normalize roles to array (aligns with backend roleAuthMiddleware)
        const userRoles = Array.isArray(user.roles) ? user.roles : (user.roles ? [user.roles as any] : []);

        // Validate user structure to prevent runtime errors
        if (!user || userRoles.length === 0) {
          console.warn('RoleGuard: Invalid user data found in storage.');
          localStorage.removeItem('user');
          router.replace('/login');
          return;
        }

        // Make the role check case-insensitive for robustness (e.g., 'Nurse' vs 'nurse')
        const lowercasedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
        const hasPermission = userRoles.some((userRole) => 
          lowercasedAllowedRoles.includes(userRole.toLowerCase())
        );

        if (hasPermission) {
          // User has the required role, authorize access
          setAuthStatus('authorized');
        } else {
          // User is logged in but lacks permission. Redirect to their own dashboard.
          setAuthStatus('unauthorized');
          const correctDashboard = getDashboardPath(user);
          router.replace(correctDashboard);
        }
      } catch (error) {
        console.error('RoleGuard: Failed to parse user data from localStorage.', error);
        // Corrupted data in storage, treat as not logged in
        localStorage.removeItem('user');
        router.replace('/login');
      }
    };

    checkAuthorization();
  }, [allowedRoles, router]);

  if (authStatus === 'checking') {
    // While checking, show a loading screen
    return <LoadingScreen />;
  }

  if (authStatus === 'authorized') {
    // If authorized, render the protected page content
    return <>{children}</>;
  }

  // For 'unauthorized' state, render nothing as a redirect is already in progress.
  // This prevents the original page from flashing before the redirect completes.
  return null;
};

export default RoleGuard;