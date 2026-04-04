'use client';
import React, { useState, useCallback } from 'react';
import {
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { History, LocalHospital, Videocam, AccessTimeFilled } from '@mui/icons-material';
import LabTestOrderForm from '@/components/lab/LabTestOrderForm';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useAppointments, useUpdateAppointmentStatus } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import { Appointment, AppointmentStatus, AppointmentType } from '@/types/appointment';
import { AppointmentListSkeleton } from '@/components/ui/skeletons';
import DischargeWorkflowModal from '@/components/modals/DischargeWorkflowModal';

function DoctorDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // React Query hooks
  const { data: pendingDocData, isLoading: pendingLoading } = useAppointments('ASSIGNED', {
    serviceType: 'Doctor Consultation',
  }, {
    enabled: !!user?.userId,
  });
  
  const { data: completedDocData } = useAppointments('COMPLETED', {
    serviceType: 'Doctor Consultation',
  }, {
    enabled: !!user?.userId,
  });
  
  const { data: pendingTeleData } = useAppointments('ASSIGNED', {
    serviceType: 'Telemedicine Consultation',
  }, {
    enabled: !!user?.userId,
  });
  
  const { data: inProgressTeleData } = useAppointments('IN_CONSULTATION', {
    serviceType: 'Telemedicine Consultation',
  }, {
    enabled: !!user?.userId,
  });
  
  const updateStatusMutation = useUpdateAppointmentStatus();

  const [submitting, setSubmitting] = useState(false);
  const [isLabOrderFormOpen, setIsLabOrderFormOpen] = useState(false);
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);

  const pendingDoctorConsultations = pendingDocData?.data || [];
  const previousConsultations = completedDocData?.data || [];
  const pendingTelemedicineSessions = [
    ...(pendingTeleData?.data || []),
    ...(inProgressTeleData?.data || []),
  ];

  if (pendingLoading) {
    return <AppointmentListSkeleton />;
  }

  const handleStartConsultation = async (appointmentId: string) => {
    setSubmitting(true);
    try {
      await updateStatusMutation.mutateAsync({
        appointmentId: Number(appointmentId),
        payload: { newStatus: 'IN_CONSULTATION' },
      });
      router.push(`/doctor/consultation/${appointmentId}`);
    } catch (err: any) {
      console.error('Error starting consultation:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Doctor Dashboard
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Welcome to your Doctor Dashboard! Here you can manage patient records and consultations.
      </Typography>

      <Button
        variant="contained"
        color="secondary"
        startIcon={<LocalHospital />}
        onClick={() => setIsLabOrderFormOpen(true)}
        sx={{ mb: 4 }}
      >
        Order Lab Test
      </Button>

      <Button
        variant="contained"
        color="primary"
        startIcon={<LocalHospital />} // Reusing icon for now, consider a specific one later
        onClick={() => setIsDischargeModalOpen(true)}
        sx={{ mb: 4, ml: 2 }} // Added margin-left for spacing
      >
        Discharge Patient
      </Button>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Pending Doctor Consultations */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <AccessTimeFilled color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h6">Pending Consultations</Typography>
            <Typography variant="h3" color="primary">{pendingDoctorConsultations.length}</Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => { /* Optionally navigate to a full list view */ }}
            >
              View All
            </Button>
          </Paper>
        </Grid>

        {/* Pending Telemedicine Sessions */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <Videocam color="secondary" sx={{ fontSize: 40 }} />
            <Typography variant="h6">Pending Telemedicine</Typography>
            <Typography variant="h3" color="secondary">{pendingTelemedicineSessions.length}</Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => { /* Optionally navigate to a full list view */ }}
            >
              View All
            </Button>
          </Paper>
        </Grid>

        {/* Previous Consultations */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <History color="action" sx={{ fontSize: 40 }} />
            <Typography variant="h6">Previous Consultations</Typography>
            <Typography variant="h3" color="action">{previousConsultations.length}</Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => { /* Optionally navigate to a full list view */ }}
            >
              View All
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed list of pending doctor consultations (as before) */}
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Pending Doctor Consultations (Ready for Review)
          </Typography>
          {pendingDoctorConsultations.length === 0 && !pendingLoading && (
            <Typography>No consultations currently ready for review.</Typography>
          )}
          {pendingDoctorConsultations.length > 0 && (
            <List>
              {pendingDoctorConsultations.map((appointment) => (
                <ListItem key={appointment.id} divider>
                  <ListItemText
                    primary={`Patient ID: ${appointment.patientId} - ${appointment.patientFirstName} ${appointment.patientLastName}`}
                    secondary={`Type: ${appointment.serviceType} | Scheduled: ${appointment.dateTime ? new Date(appointment.dateTime).toLocaleString() : 'N/A'} | Reason: ${appointment.reason}${appointment.department ? ` | Dept: ${appointment.department}` : ''}`}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleStartConsultation(appointment.id)}
                    sx={{ ml: 2 }}
                    disabled={submitting}
                  >
                    Start Consultation
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Box>

      {/* Lab Test Order Form Dialog */}
      <LabTestOrderForm
        open={isLabOrderFormOpen}
        onClose={() => setIsLabOrderFormOpen(false)}
        onSuccess={() => {
          setIsLabOrderFormOpen(false);
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
        }}
        patientId={user?.patientId ? String(user.patientId) : '1'} // Use actual patientId if available
        appointmentId={pendingDoctorConsultations[0]?.id || '1'} // Use first pending appointment or placeholder
      />

      {/* Discharge Workflow Modal */}
      <DischargeWorkflowModal
        open={isDischargeModalOpen}
        onClose={() => setIsDischargeModalOpen(false)}
        onSuccess={() => {
          setIsDischargeModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
        }}
      />
    </Box>
  );
}

export default withAuth(DoctorDashboardPage, ['Doctor']);

