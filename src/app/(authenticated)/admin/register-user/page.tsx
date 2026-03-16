'use client';
import {
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Box,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  OutlinedInput,
  SelectChangeEvent,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import withAuth from '@/components/auth/withAuth';
import { useState, useEffect } from 'react';
import { createUser, getAllRoles } from '@/services/userAdminService';
import { Role } from '@/types/admin';
import { useRouter } from 'next/navigation';

function RegisterUserPage() {
  const router = useRouter();
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    middleName: '',
    lastName: '',
    nisNumber: '',
    phone: '',
    roles: [] as string[],
  });
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const paginatedRoles = await getAllRoles(1, 100); // Fetch all roles
        setAvailableRoles(paginatedRoles.roles);
      } catch (err) {
        console.error('Failed to fetch roles:', err);
        setError('Failed to load available roles.');
      }
    };
    fetchRoles();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    setNewUser((prev) => ({
      ...prev,
      roles: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleRegisterUser = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await createUser(newUser);
      setSuccess('User registered successfully!');
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        middleName: '',
        lastName: '',
        nisNumber: '',
        phone: '',
        roles: [],
      });
      setTimeout(() => router.push('/admin/dashboard'), 2000); // Redirect after a delay
    } catch (err: any) {
      setError(`Failed to register user: ${err.response?.data?.message || err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4, p: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h4" component="h1" sx={{ textAlign: 'center', mb: 4 }}>
        Register New User
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="First Name"
            name="firstName"
            value={newUser.firstName}
            onChange={handleInputChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Last Name"
            name="lastName"
            value={newUser.lastName}
            onChange={handleInputChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Middle Name"
            name="middleName"
            value={newUser.middleName || ''}
            onChange={handleInputChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Email"
            name="email"
            type="email"
            value={newUser.email}
            onChange={handleInputChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Password"
            name="password"
            type="password"
            value={newUser.password}
            onChange={handleInputChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="NIS Number"
            name="nisNumber"
            value={newUser.nisNumber}
            onChange={handleInputChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Phone"
            name="phone"
            value={newUser.phone}
            onChange={handleInputChange}
            fullWidth
            required
          />
        </Grid>
      </Grid>

      <FormControl fullWidth sx={{ mt: 3 }}>
        <InputLabel id="roles-select-label">Assign Roles</InputLabel>
        <Select
          labelId="roles-select-label"
          multiple
          value={newUser.roles}
          onChange={handleRoleChange}
          input={<OutlinedInput label="Assign Roles" />}
          renderValue={(selected) => selected.join(', ')}
        >
          {availableRoles.map((role) => (
            <MenuItem key={role.roleId} value={role.roleName}>
              <Checkbox checked={newUser.roles.includes(role.roleName)} />
              <Typography>{role.roleName}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

      <Button
        variant="contained"
        color="primary"
        onClick={handleRegisterUser}
        disabled={loading}
        fullWidth
        sx={{ mt: 3, py: 1.5 }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Register User'}
      </Button>
    </Box>
  );
}

export default withAuth(RegisterUserPage, ['Admin']);

