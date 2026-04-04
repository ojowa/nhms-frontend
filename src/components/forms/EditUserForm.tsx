'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Role } from '@/types/admin';
import { updateUser, resetPassword } from '@/services/userAdminService';

const editUserSchema = z.object({
  firstName: z.string().min(1, { message: 'First Name is required' }),
  middleName: z.string().optional().or(z.literal('')),
  lastName: z.string().min(1, { message: 'Last Name is required' }),
  gender: z.enum(['Male', 'Female', 'Other']).optional().or(z.literal('')),
  email: z.string().email({ message: 'Invalid email address' }),
  nisNumber: z.string().optional().or(z.literal('')),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits' }),
  roles: z.array(z.string()).optional(), // Made roles optional for partial updates
  password: z.string().min(8, 'Password must be at least 8 characters long').optional().or(z.literal('')),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserFormProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: () => void;
  availableRoles: Role[];
}

const EditUserForm: React.FC<EditUserFormProps> = ({ open, onClose, user, onUserUpdated, availableRoles }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control, // Added control
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        middleName: user.middleName || '',
        lastName: user.lastName,
        gender: user.gender || '',
        email: user.email,
        nisNumber: user.nisNumber || '',
        phone: user.phone || '',
        roles: user.roles || [], // Ensure roles is always an array
      });
    }
  }, [user, reset]);

  const handleFormSubmit = async (data: EditUserFormData) => {
    setSubmitError(null);
    if (!user) return;

    try {
      const { password, ...userData } = data;

      // Update user details
      await updateUser(user.userId, {
        firstName: userData.firstName,
        middleName: userData.middleName,
        lastName: userData.lastName,
        gender: userData.gender || null,
        nisNumber: userData.nisNumber,
        phone: userData.phone,
        roles: userData.roles,
      });

      // If password is provided, reset it
      if (password) {
        await resetPassword(user.userId, password);
        // Clear password field after successful reset
        reset({ password: '' }, { keepValues: true });
      }
      
      onUserUpdated();
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to update user');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit User: {user?.firstName} {user?.lastName}</DialogTitle>
      <DialogContent>
        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
        <Box
          component="form"
          id="edit-user-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
          noValidate
          autoComplete="off"
        >
          {Object.keys(errors).length > 0 && <Alert severity="error">Please fix the errors below.</Alert>}
          <TextField
            {...register('firstName')}
            margin="dense"
            label="First Name"
            type="text"
            fullWidth
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
          />
          <TextField
            {...register('middleName')}
            margin="dense"
            label="Middle Name"
            type="text"
            fullWidth
            error={!!errors.middleName}
            helperText={errors.middleName?.message}
          />
          <TextField
            {...register('lastName')}
            margin="dense"
            label="Last Name"
            type="text"
            fullWidth
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
          />
          <TextField
            {...register('email')}
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            disabled // Email usually not editable
          />
          <TextField
            {...register('gender')}
            margin="dense"
            label="Gender (Optional)"
            select
            fullWidth
            error={!!errors.gender}
            helperText={errors.gender?.message}
            defaultValue=""
          >
            <MenuItem value="">Not specified</MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
          <TextField
            {...register('nisNumber')}
            margin="dense"
            label="NIS Number (Optional)"
            type="text"
            fullWidth
            error={!!errors.nisNumber}
            helperText={errors.nisNumber?.message}
          />
          <TextField
            {...register('phone')}
            margin="dense"
            label="Phone"
            type="text"
            fullWidth
            error={!!errors.phone}
            helperText={errors.phone?.message}
          />
          <TextField
            {...register('password')}
            margin="dense"
            label="Password (Optional)"
            type="password"
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Controller
            name="roles"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                label="Roles"
                select
                SelectProps={{ multiple: true, value: field.value || [] }} // Ensure value is an array
                fullWidth
                error={!!errors.roles}
                helperText={errors.roles?.message}
              >
                {availableRoles.map((role) => (
                  <MenuItem key={role.roleId} value={role.roleName}>
                    {role.roleName}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="edit-user-form" variant="contained">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserForm;
