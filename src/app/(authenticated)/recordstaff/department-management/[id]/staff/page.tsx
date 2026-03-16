'use client';

import * as React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Alert,
  Divider,
  TextField
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { useParams } from 'next/navigation';
import { getDepartmentById, getDepartmentStaff, addUserToDepartment, removeUserFromDepartment } from '@/services/departmentService';
import { getAllUsers } from '@/services/userAdminService';
import { User } from '@/types/admin';
import { Department } from '@/types/department';

export default function ManageDepartmentStaffPage() {
  const { id } = useParams();
  const departmentId = parseInt(id as string, 10);

  const [department, setDepartment] = React.useState<Department | null>(null);
  const [departmentStaff, setDepartmentStaff] = React.useState<User[]>([]);
  const [allStaff, setAllStaff] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const fetchData = React.useCallback(async (currentSearchTerm: string) => {
    if (isNaN(departmentId)) {
      setError('Invalid Department ID.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const [dept, deptStaff, allUsers] = await Promise.all([
        getDepartmentById(departmentId),
        getDepartmentStaff(departmentId),
        getAllUsers(1, 1000, currentSearchTerm, undefined) // Fetch all users; pagination might be needed for large sets
      ]);

      setDepartment(dept);
      setDepartmentStaff(deptStaff);

      const staffIdsInDept = new Set(deptStaff.map(u => u.userId));
      const otherStaff = allUsers.users.filter(u => !staffIdsInDept.has(u.userId));
      setAllStaff(otherStaff);

    } catch (err) {
      console.error('Error fetching department data:', err);
      setError('Failed to fetch department data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  React.useEffect(() => {
    // Debounce search term
    const handler = setTimeout(() => {
        fetchData(searchTerm);
    }, 500);

    return () => {
        clearTimeout(handler);
    };
  }, [searchTerm, fetchData]);

  const handleAddUser = async (userId: number) => {
    try {
      await addUserToDepartment(departmentId, userId);
      await fetchData(searchTerm); // Re-fetch data to update lists
    } catch (err) {
      console.error('Error adding user:', err);
      alert('Failed to add user to the department.');
    }
  };

  const handleRemoveUser = async (userId: number) => {
    try {
      await removeUserFromDepartment(departmentId, userId);
      await fetchData(searchTerm); // Re-fetch data to update lists
    } catch (err) {
      console.error('Error removing user:', err);
      alert('Failed to remove user from the department.');
    }
  };

  if (loading && !department) { // Initial load
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage Staff for: {department?.name}
      </Typography>
      <Grid container spacing={3}>
        {/* Staff in Department */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Staff in Department ({departmentStaff.length})</Typography>
            <List>
              {departmentStaff.map(user => (
                <ListItem
                  key={user.userId}
                  secondaryAction={
                    <Button variant="contained" color="secondary" onClick={() => handleRemoveUser(user.userId)}>
                      Remove
                    </Button>
                  }
                >
                  <ListItemText primary={`${user.firstName} ${user.lastName}`} secondary={user.email} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* All Other Staff */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Available Staff ({allStaff.length})</Typography>
            <TextField
              label="Search Staff"
              fullWidth
              margin="normal"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {loading && <CircularProgress size={24} />}
            <List>
              {allStaff.map(user => (
                <ListItem
                  key={user.userId}
                  secondaryAction={
                    <Button variant="contained" color="primary" onClick={() => handleAddUser(user.userId)}>
                      Add
                    </Button>
                  }
                >
                  <ListItemText primary={`${user.firstName} ${user.lastName}`} secondary={user.email} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

