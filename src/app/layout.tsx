import type { Metadata } from "next";
import ThemeRegistry from './ThemeRegistry'; // New import
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme'; // Assuming a theme file exists or use default
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext'; // Import AuthProvider
import { SnackbarProvider } from '@/contexts/SnackbarContext';

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
        <AuthProvider> {/* Wrap the entire application with AuthProvider */}
          <ThemeRegistry> {/* Replaced AppRouterCacheProvider with ThemeRegistry */}
             {/* ThemeProvider requires a theme object, usually defined in src/theme.ts */}
             {/* For build purposes, we assume a default theme or imported one */}
             <ThemeProvider theme={theme}>
              <SnackbarProvider>
                <CssBaseline />
                {children}
              </SnackbarProvider>
            </ThemeProvider>
          </ThemeRegistry>
        </AuthProvider>
      </body>
    </html>
  );
}
