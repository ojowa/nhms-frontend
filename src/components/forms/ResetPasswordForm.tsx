'use client';
'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  onReset: (newPassword: string) => void;
  onClose: () => void;
  userName?: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onReset, onClose, userName = 'User' }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onFormSubmit = (data: ResetPasswordFormData) => {
    onReset(data.newPassword);
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Reset Password for {userName}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onFormSubmit)} id="reset-password-form">
          {Object.keys(errors).length > 0 && <Alert severity="error">Please fix the errors below.</Alert>}
          <TextField
            {...register('newPassword')}
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
          />
          <TextField
            {...register('confirmPassword')}
            margin="dense"
            label="Confirm New Password"
            type="password"
            fullWidth
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="reset-password-form" variant="contained">
          Reset Password
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResetPasswordForm;
