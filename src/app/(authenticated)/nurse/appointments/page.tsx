'use client';

import * as React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, CircularProgress, Alert, Button } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { getAllAppointmentsForRecordStaff } from '@/services/appointmentService';
import { getLabAppointments } from '@/services/labAppointmentService';
import { Appointment } from '@/types/appointment';
import { LabAppointment } from '@/types/labAppointment';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/auth/withAuth'; // Added this import

function NurseAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = React.useState<(Appointment | LabAppointment)[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  const fetchAppointments = React.useCallback(async () => {
    if (!user) {
      setError('User not logged in.');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      const [consultationResponse, labAppointments] = await Promise.all([
        getAllAppointmentsForRecordStaff(),
        getLabAppointments(),
      ]);

      const allAppointments = [...consultationResponse.data, ...labAppointments];
      allAppointments.sort((a, b) => dayjs(b.dateTime).diff(dayjs(a.dateTime)));

      setAppointments(allAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to fetch appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Nurse Appointments
      </Typography>
      {appointments.length === 0 ? (
        <Typography>No appointments found.</Typography>
      ) : (
        <Paper elevation={1}>
          <List>
            {appointments.map((appointment) => (
              <React.Fragment key={appointment.id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => router.push(`/nurse/appointments/vitals-input?appointmentId=${appointment.id}`)}
                        sx={{ mr: 1 }}
                      >
                        {('vitalsSaved' in appointment && appointment.vitalsSaved) ? 'View Vitals' : 'Enter Vitals'}
                      </Button>
                      {'vitalsSaved' in appointment && (
                        <Button variant="contained" size="small" disabled>
                          Assignment by RecordStaff/Admin
                        </Button>
                      )}
                    </Box>
                  }
                >
                  <ListItemText
                    primary={`${appointment.serviceType} on ${dayjs(appointment.dateTime).format('YYYY-MM-DD HH:mm')}`}
                    secondary={`Patient: ${'patientFirstName' in appointment ? `${appointment.patientFirstName} ${appointment.patientLastName}` : `ID: ${appointment.patientId}`} - Status: ${appointment.status}${(appointment.serviceType !== 'Lab Test Appointment' && appointment.department) ? ` - Dept: ${appointment.department}` : ''}`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}

export default withAuth(NurseAppointmentsPage, ['Nurse']);
