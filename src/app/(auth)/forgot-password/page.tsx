'use client';

import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import { requestPasswordReset } from '@/services/authService';

export default function ForgotPasswordPage() {
  const [emailOrNisNumber, setEmailOrNisNumber] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await requestPasswordReset({ emailOrNisNumber: emailOrNisNumber });
      setMessage('If an account with that email or NIS number exists, a password reset link has been sent.');
      setEmailOrNisNumber('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          Forgot Password
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Enter your email or NIS number to receive a password reset link.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Email or NIS Number"
            type="text"
            value={emailOrNisNumber}
            onChange={(e) => setEmailOrNisNumber(e.target.value)}
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
            {loading ? 'Sending...' : 'Send Reset Link'}
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
