/**
 * Reusable Loading Skeleton Components
 * For consistent loading states across the application
 */

import { Box, Skeleton, Stack, Grid } from '@mui/material';

// ============ Card Skeletons ============

export const CardSkeleton = ({ width = '100%', height = 140 }: { width?: string; height?: number }) => (
  <Box sx={{ width, mb: 2 }}>
    <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 1 }} />
  </Box>
);

export const AppointmentCardSkeleton = () => (
  <CardSkeleton height={120} />
);

export const PatientCardSkeleton = () => (
  <CardSkeleton height={100} />
);

export const MedicationCardSkeleton = () => (
  <CardSkeleton height={80} />
);

// ============ List Skeletons ============

export const ListSkeleton = ({ count = 5 }: { count?: number }) => (
  <Stack spacing={2}>
    {Array.from({ length: count }).map((_, index) => (
      <Skeleton key={index} variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
    ))}
  </Stack>
);

export const AppointmentListSkeleton = () => <ListSkeleton count={5} />;

export const PatientListSkeleton = () => <ListSkeleton count={8} />;

// ============ Table Skeletons ============

export const TableSkeleton = ({ rows = 10, columns = 5 }: { rows?: number; columns?: number }) => (
  <Box sx={{ width: '100%' }}>
    <Skeleton variant="rectangular" height={40} sx={{ mb: 1, borderRadius: 1 }} />
    <Stack spacing={1}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} variant="rectangular" height={50} sx={{ borderRadius: 1 }} />
      ))}
    </Stack>
  </Box>
);

export const UserTableSkeleton = () => <TableSkeleton rows={10} columns={6} />;

export const DepartmentTableSkeleton = () => <TableSkeleton rows={8} columns={4} />;

// ============ Form Skeletons ============

export const FormSkeleton = ({ fields = 5 }: { fields?: number }) => (
  <Stack spacing={3}>
    {Array.from({ length: fields }).map((_, index) => (
      <Skeleton key={index} variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
    ))}
    <Skeleton variant="rectangular" height={40} width={120} sx={{ borderRadius: 1 }} />
  </Stack>
);

export const LoginFormSkeleton = () => <FormSkeleton fields={2} />;

export const RegisterFormSkeleton = () => <FormSkeleton fields={7} />;

export const BookingFormSkeleton = () => <FormSkeleton fields={6} />;

// ============ Dashboard Skeletons ============

export const StatCardSkeleton = () => (
  <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 1 }}>
    <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
    <Skeleton variant="text" width="40%" />
  </Box>
);

export const DashboardStatsSkeleton = () => (
  <Grid container spacing={2}>
    {Array.from({ length: 4 }).map((_, index) => (
      <Grid key={index} sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
        <StatCardSkeleton />
      </Grid>
    ))}
  </Grid>
);

// ============ Profile Skeletons ============

export const ProfileSkeleton = () => (
  <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
    <Skeleton variant="circular" width={80} height={80} />
    <Stack spacing={1} sx={{ flex: 1 }}>
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="50%" />
    </Stack>
  </Box>
);

// ============ Dialog Skeletons ============

export const DialogSkeleton = () => (
  <Box sx={{ p: 2 }}>
    <Skeleton variant="text" width="80%" sx={{ mb: 3 }} />
    <FormSkeleton fields={4} />
  </Box>
);

// ============ Chart Skeletons ============

export const ChartSkeleton = ({ height = 300 }: { height?: number }) => (
  <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 1 }} />
);

// ============ Page Skeletons ============

export const PageSkeleton = () => (
  <Box sx={{ p: 3 }}>
    <Skeleton variant="text" width="40%" height={60} sx={{ mb: 3 }} />
    <DashboardStatsSkeleton />
    <Box sx={{ mt: 4 }}>
      <TableSkeleton />
    </Box>
  </Box>
);

// ============ Generic Content Skeleton ============

interface ContentSkeletonProps {
  title?: boolean;
  stats?: number;
  listItems?: number;
  form?: boolean;
}

export const ContentSkeleton = ({
  title = true,
  stats = 0,
  listItems = 0,
  form = false,
}: ContentSkeletonProps) => (
  <Box sx={{ p: 3 }}>
    {title && <Skeleton variant="text" width="40%" height={60} sx={{ mb: 3 }} />}
    
    {stats > 0 && (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Array.from({ length: stats }).map((_, index) => (
          <Grid key={index} sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
            <StatCardSkeleton />
          </Grid>
        ))}
      </Grid>
    )}

    {listItems > 0 && (
      <Box sx={{ mb: 3 }}>
        <ListSkeleton count={listItems} />
      </Box>
    )}

    {form && (
      <Box>
        <FormSkeleton />
      </Box>
    )}
  </Box>
);

// ============ Loading Overlay ============

export const LoadingOverlay = ({ fullScreen = true }: { fullScreen?: boolean }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: fullScreen ? '100vh' : '200px',
      width: '100%',
    }}
  >
    <Skeleton variant="circular" width={60} height={60} />
  </Box>
);

// ============ Usage Examples ============

/*
// In a component:
import { AppointmentListSkeleton } from '@/components/ui/skeletons';

function AppointmentsPage() {
  const { data, isLoading } = useAppointments('SCHEDULED');
  
  if (isLoading) {
    return <AppointmentListSkeleton />;
  }
  
  return (
    <div>
      {data.data.map(apt => <AppointmentCard key={apt.id} {...apt} />)}
    </div>
  );
}

// Or use ContentSkeleton for complex pages:
function DashboardPage() {
  const { isLoading } = useDashboardData();
  
  if (isLoading) {
    return <ContentSkeleton title stats={4} listItems={10} />;
  }
  
  return <DashboardContent />;
}
*/
