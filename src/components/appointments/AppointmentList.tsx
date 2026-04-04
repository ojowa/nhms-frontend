'use client';

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import { getAppointmentsByStatus } from '@/services/appointmentService';
import { Appointment } from '@/types/appointment';
import AssignDoctorModal from '@/components/modals/AssignDoctorModal';
import { AppointmentStatus } from '@/types/appointment';

const SCHEDULED_STATUS: AppointmentStatus = 'SCHEDULED';

const AppointmentList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await getAppointmentsByStatus('SCHEDULED');
        setAppointments(data.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch appointments.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleOpenModal = (appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedAppointmentId(null);
    setIsModalOpen(false);
  };

  const handleAssignmentSuccess = () => {
    // Re-fetch appointments to update the list
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await getAppointmentsByStatus('SCHEDULED');
        setAppointments(data.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch appointments.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
    handleCloseModal();
  };


  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Appointments Ready for Doctor Assignment
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient Name</TableCell>
              <TableCell>Appointment Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{`${appointment.patientFirstName} ${appointment.patientLastName}`}</TableCell>
                <TableCell>{appointment.dateTime ? new Date(appointment.dateTime).toLocaleString() : 'N/A'}</TableCell>
                <TableCell>{appointment.status}</TableCell>
                                <TableCell>{appointment.status === SCHEDULED_STATUS && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenModal(Number(appointment.id))}
                    >
                      Assign Doctor
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {selectedAppointmentId && (
        <AssignDoctorModal
          open={isModalOpen}
          onClose={handleCloseModal}
          appointmentId={selectedAppointmentId}
          onAssignmentSuccess={handleAssignmentSuccess}
        />
      )}
    </Box>
  );
};

export default AppointmentList;
