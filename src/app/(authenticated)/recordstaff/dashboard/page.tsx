'use client';
import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import Link from 'next/link';
import { getUsersCountByRoles } from '@/services/userAdminService';
import PeopleIcon from '@mui/icons-material/People';
import HealingIcon from '@mui/icons-material/Healing';
import ScienceIcon from '@mui/icons-material/Science';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SecurityIcon from '@mui/icons-material/Security';
import withAuth from '@/components/auth/withAuth'; // Added import

interface StatCardProps {
  title: string;
  count: number;
  icon: React.ReactElement;
}

function StatCard({ title, count, icon }: StatCardProps) {
  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
      <Box sx={{ flexShrink: 0, mr: 2 }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" component="div">
          {count}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
    </Card>
  );
}

function RecordStaffDashboardPage() {
  const [counts, setCounts] = useState<{ [role: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        const roles = ['Patient', 'Officer', 'Doctor', 'LabStaff', 'Nurse'];
        const result = await getUsersCountByRoles(roles);
        setCounts(result);
      } catch (err: any) {
        setError('Failed to fetch user counts. Please try refreshing the page.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const statCards = [
    { title: 'Total Patients', role: 'Patient', icon: <PeopleIcon fontSize="large" color="primary" /> },
    { title: 'Total Officers', role: 'Officer', icon: <SecurityIcon fontSize="large" color="secondary" /> },
    { title: 'Total Doctors', role: 'Doctor', icon: <HealingIcon fontSize="large" color="error" /> },
    { title: 'Total Lab Staff', role: 'LabStaff', icon: <ScienceIcon fontSize="large" color="warning" /> },
    { title: 'Total Nurses', role: 'Nurse', icon: <LocalHospitalIcon fontSize="large" color="success" /> },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Record Staff Dashboard</Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="body1">Welcome to the Record Staff Dashboard!</Typography>
        <Typography variant="body2">Here you can manage patient records, user accounts, and view system statistics.</Typography>
      </Paper>

      {loading && <CircularProgress sx={{ display: 'block', margin: 'auto', my: 4 }} />}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {!loading && !error && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {statCards.map(card => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={card.title}>
              <StatCard
                title={card.title}
                count={counts[card.role] || 0}
                icon={card.icon}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>EMR & Patient Records</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Manage Electronic Medical Records and patient details.
            </Typography>
            <Button variant="contained" component={Link} href="/recordstaff/emr-management" fullWidth>
              Manage EMR
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Patient User Management</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Register new patients and reset patient passwords.
            </Typography>
            <Button variant="contained" component={Link} href="/recordstaff/patient-management" sx={{ mr: 1 }}>
              Manage Patients
            </Button>
            <Button variant="outlined" component={Link} href="/recordstaff/reset-patient-password">
              Reset Password
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
export default withAuth(RecordStaffDashboardPage, ['RecordStaff']);
