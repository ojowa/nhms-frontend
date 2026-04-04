import type { Metadata } from "next";
import ThemeRegistry from './ThemeRegistry';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme';
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { SnackbarProvider } from '@/contexts/SnackbarContext';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';

export const metadata: Metadata = {
  title: "NHMS - Nigeria Healthcare Management System",
  description: "Healthcare management system for NIS officers and staff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ReactQueryProvider>
          <AuthProvider>
            <ThemeRegistry>
              <ThemeProvider theme={theme}>
                <SnackbarProvider>
                  <CssBaseline />
                  {children}
                </SnackbarProvider>
              </ThemeProvider>
            </ThemeRegistry>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
