import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Autocomplete,
  Paper,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { Add, Remove, Close } from '@mui/icons-material';
import { Department } from '@/types/department';
import { User } from '@/types/auth'; // Corrected import
import {
  addUserToDepartment,
  removeUserFromDepartment,
  getDepartmentStaff,
  updateDepartment, // Use updateDepartment for HOD
  getDepartmentById,
} from '@/services/departmentService';
import { getAllUsers } from '@/services/userAdminService';
import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from '@/contexts/SnackbarContext';

interface ManageDepartmentStaffDialogProps {
  open: boolean;
  onClose: () => void;
  department: Department | null;
  onStaffUpdated: () => void;
}

const ManageDepartmentStaffDialog: React.FC<ManageDepartmentStaffDialogProps> = ({
  open,
  onClose,
  department,
  onStaffUpdated,
}) => {
  const { user: authUser } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [currentStaff, setCurrentStaff] = useState<User[]>([]);
  const [currentHeadOfDepartment, setCurrentHeadOfDepartment] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaffData = useCallback(async () => {
    if (!department?.departmentId) return;

    setLoading(true);
    setError(null);
    try {
      const [deptDetailsResponse, staffResponse, allUsersResponse] = await Promise.all([
        getDepartmentById(department.departmentId),
        getDepartmentStaff(department.departmentId),
        getAllUsers(1, 1000, ''),
      ]);

      const deptDetails = deptDetailsResponse;
      setAllUsers(allUsersResponse.users as User[]);

      let hodUser: User | null = null;
      if (deptDetails?.headUserId) {
        // Find the HOD from the fetched staff or all users if not in staff
        hodUser = (staffResponse as User[]).find(s => s.userId === deptDetails.headUserId) ||
                  (allUsersResponse.users as User[]).find(u => u.userId === deptDetails.headUserId) ||
                  null;
      }
      setCurrentHeadOfDepartment(hodUser as User | null);
      setCurrentStaff(staffResponse as User[]);

      const staffUserIds = new Set(staffResponse.map((s) => s.userId));
      if (hodUser?.userId) {
        staffUserIds.add(hodUser.userId);
      }

      const filteredAvailableUsers = (allUsersResponse.users as User[]).filter(
        (u) => !staffUserIds.has(u.userId)
      );
      setAvailableUsers(filteredAvailableUsers);
    } catch (err: any) {
      console.error('Error fetching staff data:', err);
      setError(err.response?.data?.message || 'Failed to fetch staff data.');
    } finally {
      setLoading(false);
    }
  }, [department]);

  useEffect(() => {
    if (open && department) {
      fetchStaffData();
    }
  }, [open, department, fetchStaffData]);

  const handleAddStaff = async (staffUser: User) => {
    if (!department?.departmentId || department.departmentId <= 0 || !staffUser?.userId || staffUser.userId <= 0) {
      setError('Invalid department or user ID.');
      showSnackbar('Invalid department or user ID.', 'error');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await addUserToDepartment(department.departmentId, staffUser.userId);
      showSnackbar(`${staffUser.firstName} ${staffUser.lastName} added to ${department.name}.`, 'success');
      onStaffUpdated();
      fetchStaffData();
    } catch (err: any) {
      console.error('Error adding staff:', err);
      setError(err.response?.data?.message || 'Failed to add staff.');
      showSnackbar('Failed to add staff.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStaff = async (staffUser: User) => {
    if (!department || !staffUser) {
      console.error('Department or staffUser is null/undefined');
      setError('Department or user data is missing.');
      showSnackbar('Department or user data is missing.', 'error');
      return;
    }
    if (
      !department.departmentId ||
      isNaN(department.departmentId) ||
      department.departmentId <= 0 ||
      !staffUser.userId ||
      isNaN(staffUser.userId) ||
      staffUser.userId <= 0
    ) {
      console.error('Invalid IDs for staff removal:', { departmentId: department.departmentId, userId: staffUser.userId });
      setError('Invalid department or user ID.');
      showSnackbar('Invalid department or user ID.', 'error');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await removeUserFromDepartment(department.departmentId, staffUser.userId);
      showSnackbar(`${staffUser.firstName} ${staffUser.lastName} removed from ${department.name}.`, 'success');
      onStaffUpdated();
      fetchStaffData();
    } catch (err: any) {
      console.error('Error removing staff:', err);
      setError(err.response?.data?.message || 'Failed to remove staff.');
      showSnackbar('Failed to remove staff.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignHOD = async (headUser: User) => {
    if (!department?.departmentId) return;

    setSubmitting(true);
    setError(null);
    try {
      await updateDepartment(department.departmentId, { headUserId: headUser.userId });
      showSnackbar(`${headUser.firstName} ${headUser.lastName} assigned as HOD for ${department.name}.`, 'success');
      onStaffUpdated();
      fetchStaffData();
    } catch (err: any) {
      console.error('Error assigning HOD:', err);
      setError(err.response?.data?.message || 'Failed to assign HOD.');
      showSnackbar('Failed to assign HOD.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveHOD = async () => {
    if (!department?.departmentId || !currentHeadOfDepartment) return;

    setSubmitting(true);
    setError(null);
    try {
      await updateDepartment(department.departmentId, { headUserId: null });
      showSnackbar(`${currentHeadOfDepartment.firstName} ${currentHeadOfDepartment.lastName} removed as HOD.`, 'success');
      onStaffUpdated();
      fetchStaffData();
    } catch (err: any) {
      console.error('Error removing HOD:', err);
      setError(err.response?.data?.message || 'Failed to remove HOD.');
      showSnackbar('Failed to remove HOD.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Manage Staff for {department?.name || ''}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Manage Staff for {department?.name || 'Department'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid item xs={12} sx={{ mb: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Head of Department
            </Typography>
            {currentHeadOfDepartment ? (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1">
                  {currentHeadOfDepartment.firstName} {currentHeadOfDepartment.lastName}
                  {currentHeadOfDepartment.email && ` (${currentHeadOfDepartment.email})`}
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={handleRemoveHOD}
                  disabled={submitting}
                >
                  Remove HOD
                </Button>
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                No Head of Department assigned.
              </Typography>
            )}

            <Autocomplete
              options={availableUsers}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.email})`}
              getOptionKey={(option) => option.userId}
              filterOptions={(options, state) => {
                if (!state.inputValue) return options;
                return options.filter(option =>
                  option.firstName.toLowerCase().includes(state.inputValue.toLowerCase()) ||
                  option.lastName.toLowerCase().includes(state.inputValue.toLowerCase()) ||
                  (option.email && option.email.toLowerCase().includes(state.inputValue.toLowerCase()))
                );
              }}
              onChange={(event, newValue) => {
                if (newValue) {
                  handleAssignHOD(newValue);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assign Head of Department"
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 1 }}
                />
              )}
            />
          </Paper>
        </Grid>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, minHeight: 200 }}>
              <Typography variant="h6" gutterBottom>
                Current Staff
              </Typography>
              {currentStaff.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No staff assigned to this department.
                </Typography>
              ) : (
                <List dense>
                  {currentStaff.map((staffUser) => (
                    <ListItem
                      key={staffUser.userId || `staff-${staffUser.email}`}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="remove"
                          onClick={() => handleRemoveStaff(staffUser)}
                          disabled={submitting}
                          color="error"
                        >
                          <Remove />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={`${staffUser.firstName} ${staffUser.lastName}`}
                        secondary={staffUser.email}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, minHeight: 200 }}>
              <Typography variant="h6" gutterBottom>
                Add Staff
              </Typography>
              <Autocomplete
                options={availableUsers}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.email})`}
                getOptionKey={(option) => option.userId}
                filterOptions={(options, state) => {
                  if (!state.inputValue) return options;
                  const searchValue = state.inputValue.toLowerCase();
                  return options.filter(option =>
                    (option.firstName && option.firstName.toLowerCase().includes(searchValue)) ||
                    (option.lastName && option.lastName.toLowerCase().includes(searchValue)) ||
                    (option.email && option.email.toLowerCase().includes(searchValue)) ||
                    (option.nisNumber && option.nisNumber.toLowerCase().includes(searchValue))
                  );
                }}
                onChange={(event, newValue) => {
                  if (newValue) {
                    handleAddStaff(newValue);
                    setSearchTerm('');
                  }
                }}
                inputValue={searchTerm}
                onInputChange={(event, newInputValue) => {
                  setSearchTerm(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search users to add (by name, email, or NIS number)"
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              <List dense sx={{ mt: 2 }}>
                {availableUsers.length === 0 && searchTerm && (
                  <ListItem key="no-matching-users">
                    <ListItemText primary="No matching users found." />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageDepartmentStaffDialog;
