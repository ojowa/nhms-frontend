'use client';
import React, { useState, useEffect, useCallback, SyntheticEvent } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import { DataGrid, GridColDef, GridToolbarContainer, GridToolbarFilterButton, GridToolbarDensitySelector, GridToolbarExport } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import { User, PaginatedUsers, Role, PaginatedRoles } from '@/types/admin';
import { getAllUsers, getAllRoles, setUserPortalAccess } from '@/services/userAdminService';
import withAuth from '@/components/auth/withAuth';
import CreateAccountForm from '@/components/forms/CreateAccountForm';
import EditUserForm from '@/components/forms/EditUserForm';

const UnifiedManagementPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('patient'); // 'patient' or 'officer'
  const [users, setUsers] = useState<User[]>([]
);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');

  const [openCreateUser, setOpenCreateUser] = useState(false);
  const [openEditUser, setOpenEditUser] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);

  const roleFilter = currentTab === 'patient' ? 'Patient' : 'Officer';
  const pageTitle = currentTab === 'patient' ? 'Patient Management' : 'Officer Management';
  const searchPlaceholder = currentTab === 'patient' ? 'Search patients...' : 'Search officers...';
  const registerButtonText = currentTab === 'patient' ? 'Register New Patient' : 'Register New Officer';
  const createFormDefaultRole = currentTab === 'patient' ? 'Patient' : 'Officer';
  const createFormAllowedRoles = currentTab === 'patient' ? ['Patient', 'Officer'] : ['Officer'];


  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response: PaginatedUsers = await getAllUsers(
        paginationModel.page + 1,
        paginationModel.pageSize,
        debouncedSearchTerm,
        roleFilter, // Pass the dynamically determined role to the service
        true
      );
      setUsers(response.users);
      setTotalUsers(response.total);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(`Failed to fetch users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, debouncedSearchTerm, roleFilter]);

  const fetchRoles = useCallback(async () => {
    try {
      const paginatedRoles: PaginatedRoles = await getAllRoles(1, 1000);
      setRoles(paginatedRoles.roles);
    } catch (err: any) {
      setError(`Failed to fetch roles: ${err.message}`);
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

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

  const handleToggleRestrict = async (userToToggle: User) => {
    setLoading(true);
    setError(null);
    try {
      await setUserPortalAccess(userToToggle.userId, !userToToggle.isActive);
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to toggle user restriction:', err);
      setError(`Failed to toggle user restriction: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    setSearchTerm(''); // Clear search term when switching tabs
    setDebouncedSearchTerm('');
    setPaginationModel({ page: 0, pageSize: 10 }); // Reset pagination
  };

  const columns: GridColDef[] = [
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
      field: 'actions',
      headerName: 'Actions',
      width: 280,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => {
              setUserToEdit(params.row as User);
              setOpenEditUser(true);
            }}
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
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        RecordStaff {pageTitle}
      </Typography>

      <Tabs value={currentTab} onChange={handleTabChange} aria-label="management tabs" sx={{ mb: 3 }}>
        <Tab label="Patients" value="patient" />
        <Tab label="Officers" value="officer" />
      </Tabs>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: '300px' }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateUser(true)}
        >
          {registerButtonText}
        </Button>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
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
        defaultRole={createFormDefaultRole}
        allowedRoles={createFormAllowedRoles}
      />

      <EditUserForm
        open={openEditUser}
        onClose={() => setOpenEditUser(false)}
        user={userToEdit}
        onUserUpdated={fetchUsers}
        availableRoles={roles}
      />
    </Box>
  );
};

export default withAuth(UnifiedManagementPage, ['RecordStaff', 'Admin']);
