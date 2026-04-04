'use client';
import { Box, Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom>
          404 - Page Not Found
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          The page you are looking for does not exist in the NIS Healthcare Management System.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={handleGoHome}
          sx={{ mt: 4 }}
        >
          Go to Home
        </Button>
      </Box>
    </Container>
  );
}
