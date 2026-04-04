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
  Card,
  CardContent,
  Box,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
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
import { useEffect, useState, useCallback } from 'react';
import { User, Role, PaginatedUsers, PaginatedRoles } from '@/types/admin';
import {
  getAllUsers,
  deleteUser,
  getAllRoles,
  assignRoleToUser,
  removeRoleFromUser,
  resetPassword,
  deleteRole,
  setUserPortalAccess,
} from '@/services/userAdminService';
import DeleteRoleModal from '@/components/modals/DeleteRoleModal';
import {
  PersonAdd as PersonAddIcon,
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon,
  LockReset as LockResetIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

import CreateAccountForm from '@/components/forms/CreateAccountForm';
import ConfirmationDialog from '@/components/modals/ConfirmationDialog';
import EditUserForm from '@/components/forms/EditUserForm';

const UserManagementPage: React.FC = () => { // Renamed from AdminDashboardPage
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');

  const [openCreateUser, setOpenCreateUser] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [openEditUser, setOpenEditUser] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // States for Role Management (moving here)
  const [roles, setRoles] = useState<Role[]>([]); // Need to fetch all roles for dropdown
  const [rolesPaginationModel, setRolesPaginationModel] = useState({ page: 0, pageSize: 5 }); // Not needed here if all roles are fetched
  const [totalRoles, setTotalRoles] = useState(0); // Not needed here if all roles are fetched

  const [openDeleteRoleModal, setOpenDeleteRoleModal] = useState(false); // For managing user roles
  const [roleToDeleteId, setRoleToDeleteId] = useState<number | null>(null); // For managing user roles
  const [roleToDeleteName, setRoleToDeleteName] = useState<string>(''); // For managing user roles


  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response: PaginatedUsers = await getAllUsers(
        paginationModel.page + 1,
        paginationModel.pageSize,
        debouncedSearchTerm,
        '', // No specific role filter for general user management
        true
      );
      setUsers(response.users);
      setTotalUsers(response.total); // Use the total from the paginated response
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(`Failed to fetch users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, debouncedSearchTerm]);

  const fetchRoles = useCallback(async () => { // Need to fetch all roles for role assignment dropdown
    try {
      // Not paginated here, fetch all active roles
      const paginatedRoles: PaginatedRoles = await getAllRoles(1, 1000); // Fetch all roles
      setRoles(paginatedRoles.roles);
    } catch (err: any) {
      setError(`Failed to fetch roles: ${err.message}`);
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles(); // Fetch roles for dropdown
  }, [fetchUsers, fetchRoles]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleRefresh = () => {
    fetchUsers();
  };

  const CustomToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
      <Button startIcon={<RefreshIcon />} onClick={handleRefresh}>
        Refresh
      </Button>
    </GridToolbarContainer>
  );

  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.userId);
        fetchUsers();
        setOpenDeleteConfirm(false);
        setUserToDelete(null);
      } catch (err: any) {
        console.error('Failed to delete user:', err);
        setError(`Failed to delete user: ${err.message}`);
      }
    }
  };

  const handleResetPassword = async (userId: number) => {
    const newPassword = prompt('Enter the new password:');
    if (newPassword) {
      if (confirm('Are you sure you want to reset the password for this user?')) {
        try {
          await resetPassword(userId, newPassword);
          alert('Password reset successfully!');
        } catch (err) {
          alert('Failed to reset password.');
          console.error(err);
        }
      }
    }
  };

  const handleToggleRestrict = async (userToToggle: User) => {
    try {
      await setUserPortalAccess(userToToggle.userId, !userToToggle.isActive);
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to toggle user restriction:', err);
      setError(`Failed to toggle user restriction: ${err.message}`);
    }
  };

  const handleRoleChange = async (userId: number, currentRoles: string[], newRole: string) => { // New function
    if (!newRole) return;
    const action = currentRoles.includes(newRole) ? 'remove' : 'assign';
    const confirmAction = confirm(
      `Are you sure you want to ${action} the role "${newRole}" ${
        action === 'remove' ? 'from' : 'to'
      } this user?`
    );

    if (confirmAction) {
      try {
        if (action === 'assign') {
          await assignRoleToUser(userId, newRole);
          alert(`Role "${newRole}" assigned successfully!`);
        } else {
          await removeRoleFromUser(userId, newRole);
          alert(`Role "${newRole}" removed successfully!`);
        }
        fetchUsers();
      } catch (err) {
        alert(`Failed to ${action} role "${newRole}".`);
        console.error(err);
      }
    }
  };

  const handleConfirmDeleteRole = async () => {
    if (roleToDeleteId) {
      try {
        await deleteRole(roleToDeleteId);
        fetchRoles();
        setOpenDeleteRoleModal(false);
        setRoleToDeleteId(null);
        setRoleToDeleteName('');
      } catch (err: any) {
        console.error('Failed to delete role:', err);
        setError(`Failed to delete role: ${err.message}`);
      }
    }
  };


  const userColumns: GridColDef[] = [
    { field: 'userId', headerName: 'ID', width: 90 },
    { field: 'firstName', headerName: 'First Name', width: 150 },
    { field: 'middleName', headerName: 'Middle Name', width: 150 },
    { field: 'lastName', headerName: 'Last Name', width: 150 },
    {
      field: 'gender',
      headerName: 'Gender',
      width: 130,
      valueGetter: (_value, row) => row.gender || 'Not specified',
    },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'nisNumber', headerName: 'NIS Number', width: 150 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    {
      field: 'roles',
      headerName: 'Roles',
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {params.value.map((role: string, index: number) => (
            <Chip key={`${role}-${index}`} label={role} size="small" variant="outlined" />
          ))}
        </Box>
      ),
    },
    {
      field: 'manageRoles',
      headerName: 'Manage Roles',
      flex: 1.5,
      sortable: false,
      renderCell: (params) => (
        <FormControl fullWidth size="small">
          <InputLabel>Add/Remove Role</InputLabel>
          <Select
            value="" // This will cause the MUI error "value prop must be an array" if multiple is true
            label="Add/Remove Role"
            onChange={(e) => handleRoleChange(params.row.userId as number, params.row.roles, e.target.value as string)}
          >
            {roles.map((role) => ( // Roles come from state
              <MenuItem key={role.roleId} value={role.roleName}>
                {params.row.roles.includes(role.roleName) ? `Remove ${role.roleName}` : `Add ${role.roleName}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 420,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => {
              setUserToEdit(params.row as User);
              setOpenEditUser(true);
            }}
            color="primary"
            aria-label="edit user"
          >
            <EditIcon />
          </IconButton>
          <Button
            variant="outlined"
            size="small"
            color={params.row.isActive ? 'warning' : 'success'}
            onClick={() => handleToggleRestrict(params.row as User)}
            sx={{ ml: 1 }}
          >
            {params.row.isActive ? 'Restrict' : 'Unrestrict'}
          </Button>
          <IconButton onClick={() => handleResetPassword(params.row.userId as number)} color="warning" aria-label="reset password">
            <LockResetIcon />
          </IconButton>
          <IconButton onClick={() => { setUserToDelete(params.row as User); setOpenDeleteConfirm(true); }} color="error" aria-label="delete user">
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#1a237e' }}>
        User Management
      </Typography>

      {/* Stat Cards (only total users) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
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

      {/* Main Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenCreateUser(true)} // Opens dialog for user creation
          >
            Register New User
          </Button>
        </Box>
        <TextField
          label="Search Users by Email/Medical ID"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: '350px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Users Table */}
      <Paper sx={{ p: 2, height: 600, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={userColumns}
          getRowId={(row) => row.userId}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          rowCount={totalUsers}
          paginationMode="server"
          loading={loading}
          slots={{
            toolbar: CustomToolbar,
          }}
          disableRowSelectionOnClick
        />
      </Paper>

      <CreateAccountForm
        open={openCreateUser}
        onClose={() => setOpenCreateUser(false)}
        onAccountCreated={fetchUsers}
        allowedRoles={['Patient', 'Doctor', 'Nurse', 'LabStaff', 'Admin', 'RecordStaff']} // Admin can create users of any role
      />

      <ConfirmationDialog
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        onConfirm={handleDeleteUser}
        title="Confirm Delete"
        description={`Are you sure you want to delete user ${userToDelete?.firstName} ${userToDelete?.lastName}? This action cannot be undone.`}
      />

      <EditUserForm
        open={openEditUser}
        onClose={() => setOpenEditUser(false)}
        user={userToEdit}
        onUserUpdated={fetchUsers}
        availableRoles={roles} // Pass available roles to EditUserForm
      />

      {/* Delete Role Confirmation Modal (only needed if role management is here) */}
      <DeleteRoleModal
        open={openDeleteRoleModal}
        onClose={() => setOpenDeleteRoleModal(false)}
        onConfirm={handleConfirmDeleteRole}
        roleName={roleToDeleteName}
      />
    </Box>
  );
};

export default withAuth(UserManagementPage, ['Admin']);
