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
import Grid from '@mui/material/GridLegacy';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUser } from '@/services/userAdminService';
import { CreateUserPayload } from '@/types/admin';

const createAccountSchema = z.object({
  firstName: z.string().min(1, { message: 'First Name is required' }),
  middleName: z.string().optional(),
  lastName: z.string().min(1, { message: 'Last Name is required' }),
  gender: z.enum(['Male', 'Female', 'Other']).optional().or(z.literal('')),
  email: z.string().email({ message: 'Invalid email address' }),
  nisNumber: z.string().optional().or(z.literal('')),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  confirmPassword: z.string(),
  role: z.string().min(1, { message: 'Role is required' }),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords don't match",
      path: ['confirmPassword'],
    });
  }
  if (data.role === 'Officer' && (!data.nisNumber || data.nisNumber.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'NIS Number is required for Officers',
      path: ['nisNumber'],
    });
  }
});

type CreateAccountFormData = z.infer<typeof createAccountSchema>;

interface CreateAccountFormProps {
  open: boolean;
  onClose: () => void;
  onAccountCreated: () => void;
  defaultRole?: string;
  allowedRoles?: string[];
}

const CreateAccountForm: React.FC<CreateAccountFormProps> = ({
  open,
  onClose,
  onAccountCreated,
  defaultRole = '',
  allowedRoles,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      role: defaultRole,
      firstName: '',
      middleName: '',
      lastName: '',
      gender: '',
      email: '',
      nisNumber: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });
  const roleValue = watch('role');
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultRole) {
      setValue('role', defaultRole);
    }
  }, [defaultRole, setValue]);

  const handleFormSubmit = async (data: CreateAccountFormData) => {
    setSubmitError(null);
    try {
      const payload: CreateUserPayload = {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        gender: data.gender || null,
        email: data.email,
        nisNumber: data.nisNumber || '',
        phone: data.phone,
        password: data.password,
        roles: [data.role],
      };
      await createUser(payload);
      onAccountCreated();
      reset();
      onClose();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || err.message || 'Failed to create account');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create User Account</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          id="create-account-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          sx={{ mt: 1 }}
          noValidate
          autoComplete="off"
        >
          {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('firstName')}
                label="First Name"
                fullWidth
                required
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('lastName')}
                label="Last Name"
                fullWidth
                required
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                {...register('middleName')}
                label="Middle Name (Optional)"
                fullWidth
                error={!!errors.middleName}
                helperText={errors.middleName?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                {...register('gender')}
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                {...register('email')}
                label="Email"
                type="email"
                fullWidth
                required
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('nisNumber')}
                label={roleValue === 'Officer' ? 'NIS Number' : 'NIS Number (Optional)'}
                fullWidth
                required={roleValue === 'Officer'}
                error={!!errors.nisNumber}
                helperText={errors.nisNumber?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('phone')}
                label="Phone"
                fullWidth
                required
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('password')}
                label="Password"
                type="password"
                fullWidth
                required
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('confirmPassword')}
                label="Confirm Password"
                type="password"
                fullWidth
                required
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                {...register('role')}
                label="Role"
                select
                fullWidth
                required
                error={!!errors.role}
                helperText={errors.role?.message}
                disabled={allowedRoles?.length === 1 && !!defaultRole}
                defaultValue={defaultRole || ''}
              >
                {(allowedRoles && allowedRoles.length > 0
                  ? allowedRoles
                  : ['Patient', 'Doctor', 'Nurse', 'LabStaff', 'Admin', 'RecordStaff']
                ).map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="create-account-form" variant="contained">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateAccountForm;

