'use client';
import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#006400', // Immigration green
    },
    secondary: {
      main: '#f5f5f5', // Light gray
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: '#006400',
    },
    h2: {
      fontWeight: 600,
      color: '#006400',
    },
  },
});

export default theme;
