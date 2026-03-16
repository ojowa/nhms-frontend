"use client";
import React, { useState } from "react";
import { Appointment } from "@/types/appointment";
import { CreateVitalSignPayload } from "@/types/vitals";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { createVitalSign } from "@/services/vitalSignsService";
import { Box, Typography, Button, TextField } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { AxiosError } from "axios";

interface NurseVitalsFormProps {
  appointment: Appointment;
  onVitalsSubmitted: () => void;
  onCancel: () => void;
}

const NurseVitalsForm: React.FC<NurseVitalsFormProps> = ({
  appointment,
  onVitalsSubmitted,
  onCancel,
}) => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [vitals, setVitals] = useState<Partial<CreateVitalSignPayload>>({
    temperature: 36.5,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    pulseRate: 72,
    respirationRate: 16,
    weight: 70,
    height: 175,
    spo2: 98,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setVitals((prev) => ({
      ...prev,
      [name]: value ? Number(value) : undefined,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      showSnackbar("You must be logged in to submit vitals.", "error");
      return;
    }

    const payload: CreateVitalSignPayload = {
      patientId: appointment.patientId,
      appointmentId: Number(appointment.id),
      nurseUserId: user.userId,
      creatingUserId: user.userId, // Add creatingUserId
      temperature: vitals.temperature!,
      bloodPressureSystolic: vitals.bloodPressureSystolic!,
      bloodPressureDiastolic: vitals.bloodPressureDiastolic!,
      pulseRate: vitals.pulseRate!,
      respirationRate: vitals.respirationRate!,
      weight: vitals.weight,
      height: vitals.height,
      spo2: vitals.spo2,
    };

    try {
      await createVitalSign(payload);
      showSnackbar("Vitals submitted successfully.", "success");
      onVitalsSubmitted();
    } catch (err) {
      console.error("Failed to submit vitals:", err);
      let errorMessage = "Failed to submit vitals. Please try again.";
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      showSnackbar(errorMessage, "error");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography>Patient: {appointment.patientFirstName} {appointment.patientMiddleName ? appointment.patientMiddleName + ' ' : ''}{appointment.patientLastName} (ID: {appointment.patientId})</Typography>
      <Typography sx={{ mb: 2 }}>
        Appointment Time: {appointment.dateTime ? new Date(appointment.dateTime).toLocaleString() : 'N/A'}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Temperature (°C)"
            name="temperature"
            type="number"
            value={vitals.temperature || ""}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Pulse Rate (bpm)"
            name="pulseRate"
            type="number"
            value={vitals.pulseRate || ""}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Blood Pressure (Systolic)"
            name="bloodPressureSystolic"
            type="number"
            value={vitals.bloodPressureSystolic || ""}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Blood Pressure (Diastolic)"
            name="bloodPressureDiastolic"
            type="number"
            value={vitals.bloodPressureDiastolic || ""}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Respiration Rate (breaths/min)"
            name="respirationRate"
            type="number"
            value={vitals.respirationRate || ""}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="SpO2 (%)"
            name="spo2"
            type="number"
            value={vitals.spo2 || ""}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Weight (kg)"
            name="weight"
            type="number"
            value={vitals.weight || ""}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Height (cm)"
            name="height"
            type="number"
            value={vitals.height || ""}
            onChange={handleChange}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button onClick={onCancel} sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button type="submit" variant="contained">
          Save Vitals
        </Button>
      </Box>
    </Box>
  );
};

export default NurseVitalsForm;
