"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  getAppointmentsRequiringVitals,
  getAppointment,
} from "@/services/appointmentService";
import { Appointment } from "@/types/appointment";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Modal,
  Box,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  TextField,
} from "@mui/material";
import NurseVitalsForm from "./NurseVitalsForm";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const AppointmentsRequiringVitals = () => {
  const { user, loading: authLoading } = useAuth(); // Use useAuth hook
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const response = await getAppointmentsRequiringVitals();
        setAppointments(response || []);
      } catch (err) {
        setError("Failed to fetch appointments requiring vitals.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchAppointments();
    }
  }, [user, authLoading]); // Add user to dependency array

  const handleOpenModal = async (appointmentId: string) => {
    try {
      const appointment = await getAppointment(Number(appointmentId));
      setSelectedAppointment(appointment);
      setIsModalOpen(true);
    } catch (err) {
      setError("Failed to fetch appointment details.");
      console.error(err);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleVitalsSubmitted = () => {
    handleCloseModal();
    // Re-fetch appointments to update the list
    if (user) { // Ensure user is authenticated before refetching
      getAppointmentsRequiringVitals().then((response) =>
        setAppointments(response || [])
      );
    } else {
      setError("User not authenticated to refetch appointments.");
    }
  };

  const filteredAppointments = useMemo(() => {
    if (!searchTerm) {
      return appointments;
    }
    return appointments.filter(
      (appointment) =>
        appointment.patientId
          .toString()
          .includes(searchTerm.toLowerCase()) ||
        appointment.patientFirstName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        appointment.patientMiddleName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        appointment.patientLastName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        appointment.id.toString().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, appointments]);

  if (authLoading || loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          Appointments Requiring Vitals Input
        </Typography>
        <TextField
          label="Search by Patient ID, Name, or Appointment ID"
          variant="outlined"
          fullWidth
          margin="normal"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {filteredAppointments.length === 0 ? (
          <Typography sx={{ mt: 2 }}>
            No appointments match your search or are currently awaiting vitals input.
          </Typography>
        ) : (
          <List>
            {filteredAppointments.map((appointment) => (
              <ListItem
                key={appointment.id}
                secondaryAction={
                  <Button
                    variant="contained"
                    onClick={() =>
                      handleOpenModal(appointment.id)
                    }
                  >
                    Enter Vitals
                  </Button>
                }
              >
                <ListItemText
                  primary={`Appointment ID: ${appointment.id}`}
                  secondary={`Patient: ${appointment.patientFirstName} ${appointment.patientMiddleName ? appointment.patientMiddleName + ' ' : ''}${appointment.patientLastName} (ID: ${appointment.patientId}) - ${appointment.dateTime ? new Date(appointment.dateTime).toLocaleString() : 'N/A'}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="vitals-entry-modal-title"
        aria-describedby="vitals-entry-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="vitals-entry-modal-title" variant="h6" component="h2">
            Enter Vitals for Appointment #
            {selectedAppointment?.id}
          </Typography>
          {selectedAppointment && (
            <NurseVitalsForm
              appointment={selectedAppointment}
              onVitalsSubmitted={handleVitalsSubmitted}
              onCancel={handleCloseModal}
            />
          )}
        </Box>
      </Modal>
    </Card>
  );
};

export default AppointmentsRequiringVitals;
