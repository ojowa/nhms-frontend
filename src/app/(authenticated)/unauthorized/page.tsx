'use client';
import { Typography, Container, Box } from '@mui/material';

export default function UnauthorizedPage() {
  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" color="error" gutterBottom>
          Unauthorized Access
        </Typography>
        <Typography variant="body1">You do not have permission to view this page.</Typography>
      </Box>
    </Container>
  );
}
