'use client';
import {
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  TextField,
  Grid,
  Card,
  CardContent,
  Box,
  IconButton,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridApi,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from '@mui/x-data-grid';
import Link from 'next/link';
import withAuth from '@/components/auth/withAuth';
import { useEffect, useState, useCallback } from 'react';
import { User, Role, PaginatedUsers, PaginatedRoles } from '@/types/admin';
import { getLoggedInUsers } from '@/services/userAdminService';
import {
  getAllUsers,
  deleteUser,
  getAllRoles,
  assignRoleToUser,
  removeRoleFromUser,
  resetPassword,
  deleteRole,
} from '@/services/userAdminService';
import DeleteRoleModal from '@/components/modals/DeleteRoleModal';
import {
  PersonAdd as PersonAddIcon,
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon,
  LockReset as LockResetIcon,
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
  const [totalUsers, setTotalUsers] = useState(0);
  const [loggedInUsersCount, setLoggedInUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        setLoading(true);
        const [usersResponse, loggedInUsersResponse] = await Promise.all([
          getAllUsers(1, 1),
          getLoggedInUsers(),
        ]);
        setTotalUsers(usersResponse.total);
        setLoggedInUsersCount(loggedInUsersResponse.total || 0);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard counts.');
      } finally {
        setLoading(false);
      }
    };
    fetchTotalUsers();
  }, []);

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
      {/* Add more dashboard specific content here */}
    </Box>
  );
}

export default withAuth(AdminDashboardPage, ['Admin']);
