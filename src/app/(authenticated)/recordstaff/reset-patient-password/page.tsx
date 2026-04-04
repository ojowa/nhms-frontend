'use client';
import { Box, Typography, Paper } from '@mui/material';

export default function ResetPatientPasswordPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Reset Patient Password</Typography>
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1">This page will allow Record Staff to reset passwords for patient accounts.</Typography>
        <Typography variant="body2">Functionality to select a patient and reset their password will be implemented here.</Typography>
      </Paper>
    </Box>
  );
}
