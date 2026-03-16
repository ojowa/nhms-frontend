'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText, // Import Grid for layout
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { History, LocalHospital, Videocam, AccessTimeFilled } from '@mui/icons-material'; // New icons
import LabTestOrderForm from '@/components/lab/LabTestOrderForm'; // Import the LabTestOrderForm
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getAppointmentsByStatus, updateAppointmentStatus } from '@/services/appointmentService';
import { Appointment, AppointmentStatus, AppointmentType } from '@/types/appointment';
import DischargeWorkflowModal from '@/components/modals/DischargeWorkflowModal';

function DoctorDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDoctorConsultations, setPendingDoctorConsultations] = useState<Appointment[]>([]);
  const [previousConsultations, setPreviousConsultations] = useState<Appointment[]>([]);
  const [pendingTelemedicineSessions, setPendingTelemedicineSessions] = useState<Appointment[]>([]);
  const [submitting, setSubmitting] = useState(false); // For button loading states
  const [isLabOrderFormOpen, setIsLabOrderFormOpen] = useState(false); // State for lab order form dialog
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false); // State for discharge modal

  const fetchConsultationData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Pending Doctor Consultations (Ready for Review)
      const pendingDocAppointments = await getAppointmentsByStatus(
        'ASSIGNED',
        'Doctor Consultation' // Assuming this is how it's classified
      );
      setPendingDoctorConsultations(pendingDocAppointments);

      // Fetch Previous Consultations (Completed Doctor Consultations)
      const completedDocAppointments = await getAppointmentsByStatus(
        'Completed',
        'Doctor Consultation'
      );
      setPreviousConsultations(completedDocAppointments);

      // Fetch Pending Telemedicine Sessions
      // This could be appointments with status 'ReadyForConsultation' OR 'InConsultation'
      // and serviceType 'Telemedicine Consultation'
      const pendingTelemedAppointments = await getAppointmentsByStatus(
        'ASSIGNED',
        'Telemedicine Consultation'
      );
      // Also fetch 'InConsultation' telemedicine sessions if they are considered 'pending' for doctor
      const inProgressTelemedAppointments = await getAppointmentsByStatus(
        'IN_CONSULTATION',
        'Telemedicine Consultation'
      );
      setPendingTelemedicineSessions([...pendingTelemedAppointments, ...inProgressTelemedAppointments]);

    } catch (err: any) {
      console.error('Error fetching consultation data:', err);
      setError(err.response?.data?.message || 'Failed to fetch consultation data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || !user.userId) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }
    fetchConsultationData();
  }, [user, fetchConsultationData]);

  const handleStartConsultation = async (appointmentId: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await updateAppointmentStatus(Number(appointmentId), 'in_consultation' as AppointmentStatus);
      router.push(`/doctor/consultation/${appointmentId}`);
    } catch (err: any) {
      console.error('Error starting consultation:', err);
      setError(err.response?.data?.message || 'Failed to start consultation.');
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

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
          {pendingDoctorConsultations.length === 0 && !loading && (
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
          fetchConsultationData(); // Refresh data after successful order
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
          fetchConsultationData(); // Refresh data after successful discharge
        }}
      />
    </Box>
  );
}

export default withAuth(DoctorDashboardPage, ['Doctor']);

