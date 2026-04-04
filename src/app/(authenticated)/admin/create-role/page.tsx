'use client';
import {
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import withAuth from '@/components/auth/withAuth';
import { useState } from 'react';
import { createRole } from '@/services/userAdminService';
import { useRouter } from 'next/navigation';

function CreateRolePage() {
  const router = useRouter();
  const [roleName, setRoleName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreateRole = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await createRole(roleName);
      setSuccess('Role created successfully!');
      setRoleName('');
      setTimeout(() => router.push('/admin/dashboard'), 2000); // Redirect after 2 seconds
    } catch (err: any) {
      setError(`Failed to create role: ${err.response?.data?.message || err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4, p: 3, border: '1px solid #ccc', borderRadius: '8px' }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Create New Role
      </Typography>
      {loading && <CircularProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <TextField
        label="Role Name"
        name="roleName"
        fullWidth
        margin="normal"
        value={roleName}
        onChange={(e) => setRoleName(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateRole}
        disabled={loading || !roleName}
        sx={{ mt: 3 }}
        fullWidth
      >
        Create Role
      </Button>
    </Box>
  );
}

export default withAuth(CreateRolePage, ['Admin']);
