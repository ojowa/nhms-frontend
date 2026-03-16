'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRoles: string[] = []
) => {
  const Wrapper = (props: P) => {
    const { user, accessToken, loading } = useAuth(); // Add loading
    const router = useRouter();

    useEffect(() => {
      // Don't do anything while loading
      if (loading) {
        return;
      }

      if (!accessToken || !user) {
        router.replace('/login');
      } else if (requiredRoles.length > 0) {
        // Make role check case-insensitive to align with RoleGuard.tsx and backend middleware
        const lowercasedRequired = requiredRoles.map(r => r.toLowerCase());
        const hasPermission = user.roles.some(userRole => lowercasedRequired.includes(userRole.toLowerCase()));
        if (!hasPermission) {
          router.replace('/unauthorized'); // Redirect to an unauthorized page
        }
      }
    }, [user, accessToken, router, requiredRoles, loading]); // Add loading to dependency array

    // While loading, or if checks fail, return null or a loader
    if (loading || !accessToken || !user) {
      return null; // Or a loading spinner
    }

    if (requiredRoles.length > 0) {
      const lowercasedRequired = requiredRoles.map(r => r.toLowerCase());
      const hasPermission = user.roles.some(userRole => lowercasedRequired.includes(userRole.toLowerCase()));
      if (!hasPermission) {
        // Render nothing, the useEffect is handling the redirect
        return null;
      }
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;
