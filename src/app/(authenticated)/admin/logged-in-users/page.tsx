'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Card, CardContent } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import withAuth from '@/components/auth/withAuth';
import { LoggedInUser } from '@/types/admin';
import { getLoggedInUsers } from '@/services/userAdminService';

function AdminLoggedInUsersPage() {
  const [users, setUsers] = useState<LoggedInUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLoggedInUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getLoggedInUsers();
        setUsers(response.users || []);
        setTotal(response.total || 0);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to fetch logged-in users.');
      } finally {
        setLoading(false);
      }
    };

    fetchLoggedInUsers();
  }, []);

  const columns: GridColDef[] = [
    { field: 'userId', headerName: 'User ID', width: 100 },
    {
      field: 'fullName',
      headerName: 'Full Name',
      flex: 1.5,
      valueGetter: (_value, row) =>
        `${row.firstName} ${row.middleName ? `${row.middleName} ` : ''}${row.lastName}`.trim(),
    },
    { field: 'email', headerName: 'Email', flex: 1.8 },
    {
      field: 'roles',
      headerName: 'Roles',
      flex: 1.6,
      valueGetter: (_value, row) => (Array.isArray(row.roles) ? row.roles.join(', ') : 'N/A'),
    },
    { field: 'activeSessionCount', headerName: 'Active Sessions', width: 150 },
    {
      field: 'latestSessionExpiry',
      headerName: 'Latest Session Expiry',
      flex: 1.5,
      valueGetter: (_value, row) =>
        row.latestSessionExpiry ? new Date(row.latestSessionExpiry).toLocaleString() : 'N/A',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Logged In Users
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Total Logged In Users</Typography>
          <Typography variant="h4">{total}</Typography>
        </CardContent>
      </Card>

      <Box sx={{ height: 620, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row.userId}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
}

export default withAuth(AdminLoggedInUsersPage, ['Admin']);
