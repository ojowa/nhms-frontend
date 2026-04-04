'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
  },
  palette: {
    primary: {
      main: '#008751', // Nigeria Green
    },
  },
});

export default theme;
