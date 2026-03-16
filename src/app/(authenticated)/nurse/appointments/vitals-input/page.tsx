'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Typography, Box, CircularProgress, Alert, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import { getAppointment } from '@/services/appointmentService';
import { getVitalSignsByAppointmentId } from '@/services/vitalSignsService';
import { Appointment } from '@/types/appointment';
import { VitalSign } from '@/types/vitals';
import NurseVitalsForm from '@/components/nurse/NurseVitalsForm';
import { useRouter } from 'next/navigation';

function VitalsDisplay({ vitals }: { vitals: VitalSign }) {
  return (
    <Paper elevation={1}>
        <List>
            <ListItem>
                <ListItemText primary="Temperature" secondary={`${vitals.temperature} °C`} />
            </ListItem>
            <Divider />
            <ListItem>
                <ListItemText primary="Blood Pressure" secondary={`${vitals.bloodPressureSystolic} / ${vitals.bloodPressureDiastolic} mmHg`} />
            </ListItem>
            <Divider />
            <ListItem>
                <ListItemText primary="Pulse Rate" secondary={`${vitals.pulseRate} bpm`} />
            </ListItem>
            <Divider />
            <ListItem>
                <ListItemText primary="Respiration Rate" secondary={`${vitals.respirationRate} breaths/min`} />
            </ListItem>
            <Divider />
            <ListItem>
                <ListItemText primary="SpO2" secondary={`${vitals.spo2} %`} />
            </ListItem>
            <Divider />
             <ListItem>
                <ListItemText primary="Weight" secondary={vitals.weight ? `${vitals.weight} kg` : 'N/A'} />
            </ListItem>
            <Divider />
            <ListItem>
                <ListItemText primary="Height" secondary={vitals.height ? `${vitals.height} cm` : 'N/A'} />
            </ListItem>
        </List>
    </Paper>
  );
}

const VitalInputPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [vitals, setVitals] = useState<VitalSign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVitalsData = async () => {
      if (!appointmentId) {
        setError('No appointment ID provided.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const app = await getAppointment(Number(appointmentId));
        setAppointment(app);

        const existingVitals = await getVitalSignsByAppointmentId(Number(appointmentId));
        if (existingVitals.length > 0) {
          setVitals(existingVitals[0]);
        }
      } catch (err) {
        console.error('Error fetching vitals data:', err);
        setError('Failed to fetch appointment or vitals data.');
      } finally {
        setLoading(false);
      }
    };

    fetchVitalsData();
  }, [appointmentId]);

  const handleVitalsSubmitted = async () => {
    if (!appointmentId) return;
    try {
        setLoading(true);
        const existingVitals = await getVitalSignsByAppointmentId(Number(appointmentId));
        if (existingVitals.length > 0) {
          setVitals(existingVitals[0]);
        }
    } catch(err) {
        setError('Failed to refresh vitals data.');
    } finally {
        setLoading(false);
    }
  };
  
  const handleCancel = () => {
    router.back();
  }

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!appointment) {
    return <Alert severity="info">No appointment found.</Alert>;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Vitals for Appointment
      </Typography>
      <Typography gutterBottom>
        {appointment.patientFirstName} {appointment.patientLastName} on {appointment.dateTime ? new Date(appointment.dateTime).toLocaleDateString() : 'N/A'}
      </Typography>

      {vitals ? (
        <Box>
            <Typography variant='h5' gutterBottom>Vitals Recorded</Typography>
            <VitalsDisplay vitals={vitals} />
        </Box>
      ) : (
        <NurseVitalsForm 
            appointment={appointment}
            onVitalsSubmitted={handleVitalsSubmitted}
            onCancel={handleCancel}
        />
      )}
    </Box>
  );
};

const VitalInputPage = () => (
    <Suspense fallback={<CircularProgress />}>
        <VitalInputPageContent />
    </Suspense>
);

export default VitalInputPage;
