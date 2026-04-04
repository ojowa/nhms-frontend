'use client';
import {
  Typography,
  Alert,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Box,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from '@mui/x-data-grid';
import Link from 'next/link';
import withAuth from '@/components/auth/withAuth';
import { UserRole } from '@/types/auth';
import { useState } from 'react';
import { useUsers, useLoggedInUsers, useDeleteUser, useAdminResetPassword } from '@/hooks/useApi';
import { ContentSkeleton } from '@/components/ui/skeletons';
import {
  People as PeopleIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
} from '@mui/icons-material';

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

function AdminDashboardPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // React Query hooks
  const { data: usersData, isLoading: usersLoading, error: usersError } = useUsers({ page, limit });
  const { data: loggedInData } = useLoggedInUsers();
  const deleteUserMutation = useDeleteUser();
  const resetPasswordMutation = useAdminResetPassword();
  
  const users = usersData?.users || [];
  const totalUsers = usersData?.total || 0;
  const loggedInUsersCount = loggedInData?.total || 0;

  if (usersLoading) {
    return <ContentSkeleton title stats={2} listItems={10} />;
  }

  if (usersError) {
    return <Alert severity="error">{usersError.message}</Alert>;
  }

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'firstName', headerName: 'First Name', width: 130 },
    { field: 'lastName', headerName: 'Last Name', width: 130 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'roles', headerName: 'Roles', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          color="error"
          onClick={() => deleteUserMutation.mutateAsync(params.row.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#1a237e' }}>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        This is the main administrative dashboard.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Current Session Count
          </Typography>
          <Typography variant="h4">
            {loggedInUsersCount}
          </Typography>
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total Users</Typography>
                <PeopleIcon color="primary" />
              </Box>
              <Typography variant="h4">{totalUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Users Data Grid */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users.map((user: any) => ({ ...user, id: user.id }))}
          columns={columns}
          pagination
          paginationMode="server"
          rowCount={totalUsers}
          paginationModel={{ page: page - 1, pageSize: limit }}
          onPaginationModelChange={(model) => {
            setPage(model.page + 1);
            setLimit(model.pageSize);
          }}
          slots={{
            toolbar: CustomToolbar,
          }}
          loading={usersLoading}
        />
      </Paper>
    </Box>
  );
}

export default withAuth(AdminDashboardPage, [UserRole.Admin]);
