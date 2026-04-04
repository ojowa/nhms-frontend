'use client';

import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import { resetPassword } from '@/services/authService';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const token = params.token as string; // Get token from URL params

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await resetPassword({ token, newPassword: password });
      setMessage('Your password has been reset successfully. You can now log in.');
      setPassword('');
      setConfirmPassword('');
      // Optionally redirect to login page after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f0f2f5',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <Alert severity="error">Invalid or missing reset token.</Alert>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => router.push('/forgot-password')}
            sx={{ mt: 2 }}
          >
            Request a New Reset Link
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
      }}
    >
      <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Reset Password
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Enter your new password.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
          {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => router.push('/login')}
            disabled={loading}
          >
            Back to Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
