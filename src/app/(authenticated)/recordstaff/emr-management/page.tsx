'use client';
import { Box, Typography, Paper } from '@mui/material';

export default function EmrManagementPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>EMR Management</Typography>
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1">This page will allow Record Staff to manage Electronic Medical Records.</Typography>
        <Typography variant="body2">Functionality for viewing, editing, and uploading files to EMR will be implemented here.</Typography>
      </Paper>
    </Box>
  );
}
