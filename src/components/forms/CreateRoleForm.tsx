// nhms-frontend/src/components/forms/CreateRoleForm.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import { createRole } from '@/services/userAdminService'; // Assuming this service exists

interface CreateRoleFormProps {
  open: boolean;
  onClose: () => void;
  onRoleCreated: () => void;
}

const CreateRoleForm: React.FC<CreateRoleFormProps> = ({ open, onClose, onRoleCreated }) => {
  const [roleName, setRoleName] = useState('');
  // const [description, setDescription] = useState(''); // Removed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createRole(roleName); // Only pass roleName
      setRoleName('');
      // setDescription(''); // Removed
      onRoleCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create role.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create New Role</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Role Name"
            type="text"
            fullWidth
            variant="outlined"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          {/* Description TextField removed */}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Create Role'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateRoleForm;
