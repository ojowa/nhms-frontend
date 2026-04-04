'use client';

import React, { useEffect, useMemo } from 'react';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FamilyMember, AddFamilyMemberPayload } from '@/types/family';



interface FamilyMemberFormProps {
  initialData?: FamilyMember | null;
  onSubmit: (data: AddFamilyMemberPayload | Partial<FamilyMember>) => void;
  onClose: () => void;
}

const relationships = ['Spouse', 'Child', 'Parent', 'Sibling', 'Other'];

const FamilyMemberForm: React.FC<FamilyMemberFormProps> = ({ initialData, onSubmit, onClose }) => {
  const familyMemberSchema = useMemo(() => z.object({
    firstName: z.string().min(1, { message: 'First name is required' }),
    middleName: z.string().optional(), // Added middleName
    lastName: z.string().min(1, { message: 'Last name is required' }),
    relationship: z.string().min(1, { message: 'Relationship is required' }),
    dateOfBirth: z.string().min(1, { message: 'Date of birth is required' }), // Use string for date input
    email: z.string().email({ message: 'Invalid email address' }).optional(),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }).optional(),
  }).superRefine((data, ctx) => {
      if (!initialData) { // Only require email and password if adding a new family member
          if (!data.email) {
              ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: 'Email is required for new family members',
                  path: ['email'],
              });
          }
          if (!data.password) {
              ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: 'Password is required for new family members',
                  path: ['password'],
              });
          }
      }
  }), [initialData]);

  type FamilyMemberFormData = z.infer<typeof familyMemberSchema>; // Define type here

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FamilyMemberFormData>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      middleName: initialData?.middleName || '', // Added middleName
      lastName: initialData?.lastName || '',
      relationship: initialData?.relationship || '',
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
      ...(initialData ? {} : { email: '', password: '' }), // Only set for new members
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        relationship: initialData.relationship,
        dateOfBirth: new Date(initialData.dateOfBirth).toISOString().split('T')[0],
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        relationship: '',
        dateOfBirth: '',
        email: '',
        password: '',
      });
    }
  }, [initialData, reset]);

  const onFormSubmit = (data: FamilyMemberFormData) => {
    if (initialData) {
        // This is an update, so send Partial<FamilyMember>
        onSubmit({
            firstName: data.firstName,
            middleName: data.middleName, // Added middleName
            lastName: data.lastName,
            relationship: data.relationship,
            dateOfBirth: new Date(data.dateOfBirth),
        } as Partial<FamilyMember>);
    } else {
        // This is an add, so send AddFamilyMemberPayload
        onSubmit({
            firstName: data.firstName,
            middleName: data.middleName, // Added middleName
            lastName: data.lastName,
            relationship: data.relationship,
            dateOfBirth: new Date(data.dateOfBirth),
            email: data.email as string, // Cast as string because it's required if !initialData
            password: data.password as string, // Cast as string because it's required if !initialData
        } as AddFamilyMemberPayload);
    }
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>{initialData ? 'Edit Family Member' : 'Add New Family Member'}</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          id="family-member-form"
          onSubmit={handleSubmit(onFormSubmit)}
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
            {...register('relationship')}
            margin="dense"
            label="Relationship"
            select
            fullWidth
            defaultValue={initialData?.relationship || ''}
            error={!!errors.relationship}
            helperText={errors.relationship?.message}
          >
            {relationships.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            {...register('dateOfBirth')}
            margin="dense"
            label="Date of Birth"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={!!errors.dateOfBirth}
            helperText={errors.dateOfBirth?.message}
          />
          {!initialData && (
            <>
              <TextField
                {...register('email')}
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              <TextField
                {...register('password')}
                margin="dense"
                label="Password"
                type="password"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="family-member-form" variant="contained">
          {initialData ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FamilyMemberForm;
