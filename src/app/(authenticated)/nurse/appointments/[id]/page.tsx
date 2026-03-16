'use client';

import React, { useState, useEffect, useCallback } from 'react'; // Explicit React hooks imports
import { Box, Typography, Paper, TextField, Button, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointment } from '@/services/appointmentService';
import { Appointment } from '@/types/appointment';
import dayjs from 'dayjs';

import withAuth from '@/components/auth/withAuth'; // Added this import

// Import newly defined types
import { CreateVitalSignPayload, VitalSign } from '@/types/vitals';
import { CreateMedicationAdministrationPayload, MedicationAdministration } from '@/types/medication';

// Import actual service functions
import * as vitalSignsService from '@/services/vitalSignsService';
import { medicationAdministrationService } from '@/services/medicationAdministrationService';


function NurseAppointmentDetailsPage() {
  const { id } = useParams();
  const appointmentId = parseInt(id as string, 10);
  const { user } = useAuth();
  const router = useRouter();

  const [appointment, setAppointment] = React.useState<Appointment | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Vital Signs State
  const [bpSystolic, setBpSystolic] = React.useState<number | ''>('');
  const [bpDiastolic, setBpDiastolic] = React.useState<number | ''>('');
  const [temperature, setTemperature] = React.useState<number | ''>('');
  const [pulseRate, setPulseRate] = React.useState<number | ''>('');
  const [respirationRate, setRespirationRate] = React.useState<number | ''>('');
  const [weight, setWeight] = React.useState<number | ''>('');
  const [height, setHeight] = React.useState<number | ''>('');
  const [spo2, setSpo2] = React.useState<number | ''>('');
  const [currentVitals, setCurrentVitals] = React.useState<VitalSign[]>([]);
  const [loadingVitals, setLoadingVitals] = React.useState(false);

  // Medication Administration State
  const [drugName, setDrugName] = React.useState('');
  const [dosage, setDosage] = React.useState('');
  const [route, setRoute] = React.useState('');
  const [medNotes, setMedNotes] = React.useState('');
  const [currentMedAdministrations, setCurrentMedAdministrations] = React.useState<MedicationAdministration[]>([]);
  const [loadingMedAdmin, setLoadingMedAdmin] = React.useState(false);


  React.useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (isNaN(appointmentId)) {
        setError('Invalid Appointment ID.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const fetchedAppointment = await getAppointment(appointmentId);
        setAppointment(fetchedAppointment);
      } catch (err) {
        console.error('Error fetching appointment details:', err);
        setError('Failed to fetch appointment details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedData = async () => {
      if (isNaN(appointmentId)) return;
      setLoadingVitals(true);
      setLoadingMedAdmin(true);
      try {
        const vitals = await vitalSignsService.getVitalSignsByAppointmentId(appointmentId);
        setCurrentVitals(vitals);
        const medAdminsResponse = await medicationAdministrationService.getMedicationAdministrations({
          page: 1,
          limit: 1000, // page, limit - assuming we want all for this appointment
          patientId: undefined,    // patientId
          status: undefined,    // status
          searchTerm: undefined,    // searchTerm
          nurseUserId: user!.userId, // nurseUserId from authenticated user
          appointmentId: appointmentId, // appointmentId filter
        });
        setCurrentMedAdministrations(medAdminsResponse);
      } catch (err) {
        console.error('Error fetching related data:', err);
      } finally {
        setLoadingVitals(false);
        setLoadingMedAdmin(false);
      }
    };

    fetchAppointmentDetails();
    fetchRelatedData();
  }, [appointmentId]);


  const handleSaveVitals = async () => {
    if (!user || !user.userId || !appointment?.patientId) {
      alert('Authentication error or Patient ID missing.');
      return;
    }
    if (!bpSystolic || !bpDiastolic || !temperature || !pulseRate || !respirationRate) {
      alert('Please fill in all required vital signs.');
      return;
    }

    const payload: CreateVitalSignPayload = {
      patientId: appointment.patientId,
      appointmentId: appointmentId,
      nurseUserId: user.userId,
      bloodPressureSystolic: bpSystolic as number,
      bloodPressureDiastolic: bpDiastolic as number,
      temperature: temperature as number,
      pulseRate: pulseRate as number,
      respirationRate: respirationRate as number,
      weight: weight === '' ? undefined : (weight as number),
      height: height === '' ? undefined : (height as number),
      spo2: spo2 === '' ? undefined : (spo2 as number),
      creatingUserId: user.userId,
    };

    try {
      setLoadingVitals(true);
      const newVital = await vitalSignsService.createVitalSign(payload);
      setCurrentVitals((prev) => [newVital, ...prev]);
      alert('Vital signs saved successfully!');
      // Clear form
      setBpSystolic(''); setBpDiastolic(''); setTemperature(''); setPulseRate(''); setRespirationRate('');
      setWeight(''); setHeight(''); setSpo2('');
    } catch (err) {
      console.error('Error saving vital signs:', err);
      alert('Failed to save vital signs.');
    } finally {
      setLoadingVitals(false);
    }
  };

  const handleSaveMedicationAdministration = async () => {
    if (!user || !user.userId || !appointment?.patientId) {
      alert('Authentication error or Patient ID missing.');
      return;
    }
    if (!drugName || !dosage || !route) {
      alert('Please fill in all required medication administration fields.');
      return;
    }

    const payload: CreateMedicationAdministrationPayload = {
      patientId: String(appointment.patientId),
      administeringNurseId: user.userId!,

      dosageGiven: dosage,
      route: route,
      notes: medNotes || undefined,
    };

    try {
      setLoadingMedAdmin(true);
      const newMedAdmin = await medicationAdministrationService.createMedicationAdministration(payload);
      setCurrentMedAdministrations((prev) => [newMedAdmin, ...prev]);
      alert('Medication administration saved successfully!');
      // Clear form
      setDrugName(''); setDosage(''); setRoute(''); setMedNotes('');
    } catch (err) {
      console.error('Error saving medication administration:', err);
      alert('Failed to save medication administration.');
    } finally {
      setLoadingMedAdmin(false);
    }
  };


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

  if (!appointment) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="info">Appointment not found.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Appointment Details
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Appointment Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1"><strong>Appointment ID:</strong> {appointment.id}</Typography>
            <Typography variant="body1"><strong>Patient ID:</strong> {appointment.patientId}</Typography>
            <Typography variant="body1"><strong>Patient Name:</strong> {appointment.patientFirstName} {appointment.patientLastName}</Typography>
            <Typography variant="body1"><strong>Service Type:</strong> {appointment.serviceType}</Typography>
            <Typography variant="body1"><strong>Date & Time:</strong> {dayjs(appointment.dateTime).format('YYYY-MM-DD HH:mm')}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1"><strong>Status:</strong> {appointment.status}</Typography>
            <Typography variant="body1"><strong>Reason:</strong> {appointment.reason}</Typography>
            {appointment.department && <Typography variant="body1"><strong>Department:</strong> {appointment.department}</Typography>}
            {/* Add Patient Name/Doctor Name here once available from getAppointmentById */}
          </Grid>
        </Grid>
      </Paper>

      {/* Capture Vitals Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Capture Vitals
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="BP Systolic" type="number" fullWidth margin="normal" value={bpSystolic} onChange={(e) => setBpSystolic(parseInt(e.target.value) || '')} />
            <TextField label="BP Diastolic" type="number" fullWidth margin="normal" value={bpDiastolic} onChange={(e) => setBpDiastolic(parseInt(e.target.value) || '')} />
            <TextField label="Temperature (°C)" type="number" fullWidth margin="normal" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value) || '')} />
            <TextField label="Pulse Rate (bpm)" type="number" fullWidth margin="normal" value={pulseRate} onChange={(e) => setPulseRate(parseInt(e.target.value) || '')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Respiration Rate (breaths/min)" type="number" fullWidth margin="normal" value={respirationRate} onChange={(e) => setRespirationRate(parseInt(e.target.value) || '')} />
            <TextField label="Weight (kg)" type="number" fullWidth margin="normal" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value) || '')} />
            <TextField label="Height (cm)" type="number" fullWidth margin="normal" value={height} onChange={(e) => setHeight(parseFloat(e.target.value) || '')} />
            <TextField label="SpO2 (%)" type="number" fullWidth margin="normal" value={spo2} onChange={(e) => setSpo2(parseInt(e.target.value) || '')} />
          </Grid>
        </Grid>
        <Button variant="contained" sx={{ mt: 2 }} onClick={handleSaveVitals} disabled={loadingVitals}>
          {loadingVitals ? <CircularProgress size={24} /> : 'Save Vitals'}
        </Button>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Previous Vitals</Typography>
          {currentVitals.length === 0 ? (
            <Typography variant="body2">No previous vitals recorded for this appointment.</Typography>
          ) : (
            <List>
              {currentVitals.map((vital) => (
                <ListItem key={vital.vitalId}>
                  <ListItemText
                    primary={`BP: ${vital.bloodPressureSystolic}/${vital.bloodPressureDiastolic}, Temp: ${vital.temperature}, Pulse: ${vital.pulseRate}, Spo2: ${vital.spo2 || 'N/A'}`}
                    secondary={`Recorded: ${dayjs(vital.recordedAt).format('YYYY-MM-DD HH:mm')}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Paper>

      {/* Administer Medications Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Administer Medications
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Drug Name" fullWidth margin="normal" value={drugName} onChange={(e) => setDrugName(e.target.value)} />
            <TextField label="Dosage" fullWidth margin="normal" value={dosage} onChange={(e) => setDosage(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="route-select-label">Route</InputLabel>
              <Select
                labelId="route-select-label"
                value={route}
                label="Route"
                onChange={(e) => setRoute(e.target.value)}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                <MenuItem value="Oral">Oral</MenuItem>
                <MenuItem value="IV">IV (Intravenous)</MenuItem>
                <MenuItem value="IM">IM (Intramuscular)</MenuItem>
                <MenuItem value="SC">SC (Subcutaneous)</MenuItem>
                <MenuItem value="Topical">Topical</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Notes (Medication)" multiline rows={2} fullWidth margin="normal" value={medNotes} onChange={(e) => setMedNotes(e.target.value)} />
          </Grid>
        </Grid>
        <Button variant="contained" sx={{ mt: 2 }} onClick={handleSaveMedicationAdministration} disabled={loadingMedAdmin}>
          {loadingMedAdmin ? <CircularProgress size={24} /> : 'Save Administration'}
        </Button>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Previous Administrations</Typography>
          {currentMedAdministrations.length === 0 ? (
            <Typography variant="body2">No previous administrations recorded for this appointment.</Typography>
          ) : (
            <List>
              {currentMedAdministrations.map((admin) => (
                <ListItem key={admin.administrationId}>
                  <ListItemText
                    primary={`${admin.medicationName} - ${admin.dosageGiven} (${admin.route})`}
                    secondary={`Administered: ${dayjs(admin.administrationTime).format('YYYY-MM-DD HH:mm')}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Paper>

      {/* Placeholder for Consultation Notes and Nurse Notes */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Consultation Notes (Doctor)
        </Typography>
        <Typography variant="body2">
          {/* Display doctor's notes here */}
          No consultation notes available.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Nurse's Own Notes
        </Typography>
        <TextField
          label="Add Nurse's Notes"
          multiline
          rows={4}
          fullWidth
          margin="normal"
          // value={nurseOwnNotes} // Add state for this
          // onChange={(e) => setNurseOwnNotes(e.target.value)} // Add handler
        />
        <Button variant="contained" sx={{ mt: 2 }} disabled> {/* Implement save functionality */}
          Save Nurse Notes
        </Button>
      </Paper>

    </Box>
  );
}
export default withAuth(NurseAppointmentDetailsPage, ['Nurse']);
