'use client';

import * as React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { BookAppointmentPayload as BookConsultationPayload } from '@/types/appointment';
import { BookLabAppointmentPayload as BookLabAppointmentPayload } from '@/types/labAppointment';
import { useBookAppointment } from '@/hooks/useApi';
import { useAllDepartments } from '@/hooks/useApi';
import { AppointmentType } from '@/types/appointment';

const LAB_APPOINTMENT_TYPE = 'Lab Test Appointment';

export default function BookingForm() {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const patientId = user?.patientId;
  const isPatientOrOfficer = user?.roles?.some(
    (role) => role === 'Patient' || role === 'Officer'
  );
  
  // React Query hooks
  const bookMutation = useBookAppointment({
    onSuccess: () => {
      showSnackbar('Appointment booked successfully!', 'success');
      // Reset form or navigate
    },
    onError: (error: any) => {
      showSnackbar(error.message || 'Failed to book appointment', 'error');
    },
  });
  
  const { data: departmentsData, isLoading: loadingDepartments } = useAllDepartments();
  const departments = departmentsData || [];
  
  const [appointmentType, setAppointmentType] = React.useState<AppointmentType | typeof LAB_APPOINTMENT_TYPE>('Doctor Consultation');
  const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(dayjs());
  const [selectedTime, setSelectedTime] = React.useState<Dayjs | null>(dayjs());
  const [reason, setReason] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [labTest, setLabTest] = React.useState('');
  const [telemedicineType, setTelemedicineType] = React.useState<'VIDEO' | 'AUDIO' | 'CHAT'>('VIDEO');
  const [selectedDepartment, setSelectedDepartment] = React.useState<number | ''>('');

  const handleAppointmentTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAppointmentType(event.target.value as AppointmentType);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!patientId) {
      showSnackbar('User not logged in or patient ID not found.', 'error');
      return;
    }

    const appointmentDateTime = selectedDate?.hour(selectedTime?.hour() || 0).minute(selectedTime?.minute() || 0).toDate();

    if (!appointmentDateTime) {
      showSnackbar('Please select both date and time for the appointment.', 'error');
      return;
    }

    if (appointmentType === LAB_APPOINTMENT_TYPE) {
      const payload: BookLabAppointmentPayload = {
        patientId: patientId,
        appointmentType: 'Lab Test Appointment',
        appointmentDateTime: appointmentDateTime,
        reason: labTest,
      };
      // TODO: Add useBookLabAppointment hook
      alert('Lab appointment booking not yet implemented with React Query');
    } else {
      const payload: BookConsultationPayload = {
        patientId: patientId,
        appointmentType: appointmentType,
        appointmentDateTime: appointmentDateTime.toISOString(),
        departmentId: selectedDepartment ? Number(selectedDepartment) : undefined,
        reason: reason,
        notes: notes,
        ...(appointmentType === 'Telemedicine Consultation' && { telemedicineType: telemedicineType }),
      };
      await bookMutation.mutateAsync(payload);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <FormControl component="fieldset" margin="normal" fullWidth>
          <FormLabel component="legend">Select Appointment Type</FormLabel>
          <RadioGroup
            row
            aria-label="appointment type"
            name="appointment-type"
            value={appointmentType}
            onChange={handleAppointmentTypeChange}
          >
            <FormControlLabel
              value="Doctor Consultation"
              control={<Radio />}
              label="Doctor Consultation"
            />
            <FormControlLabel
              value="Telemedicine Consultation"
              control={<Radio />}
              label="Telemedicine Consultation"
            />
            {/* Conditionally render Lab Test Appointment for non-Patient/Officer roles */}
            {!isPatientOrOfficer && (
                <FormControlLabel
                value="Lab Test Appointment"
                control={<Radio />}
                label="Lab Test Appointment"
                />
            )}
          </RadioGroup>
        </FormControl>

        {appointmentType !== 'Lab Test Appointment' ? (
          <>
            <TextField
              select
              label="Select Department"
              fullWidth
              margin="normal"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value ? Number(e.target.value) : '')}
              required
              disabled={loadingDepartments || !departments.length}
              InputProps={{
                endAdornment: loadingDepartments ? <CircularProgress size={24} /> : null,
              }}
            >
              {loadingDepartments ? (
                <MenuItem value="" disabled>Loading...</MenuItem>
              ) : (
                departments.map((dept: any) => (
                  <MenuItem key={dept.departmentId} value={dept.departmentId}>
                    {dept.name}
                  </MenuItem>
                ))
              )}
            </TextField>
            <TextField
              label="Reason for Appointment"
              multiline
              rows={4}
              fullWidth
              margin="normal"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
            <TextField
              label="Notes (optional)"
              multiline
              rows={2}
              fullWidth
              margin="normal"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            {appointmentType === 'Telemedicine Consultation' && (
              <FormControl component="fieldset" margin="normal" fullWidth>
                <FormLabel component="legend">Telemedicine Session Type</FormLabel>
                <RadioGroup
                  row
                  aria-label="telemedicine-type"
                  name="telemedicine-type"
                  value={telemedicineType}
                  onChange={(e) => setTelemedicineType(e.target.value as 'VIDEO' | 'AUDIO' | 'CHAT')}
                >
                  <FormControlLabel value="VIDEO" control={<Radio />} label="Video" />
                  <FormControlLabel value="AUDIO" control={<Radio />} label="Audio" />
                  <FormControlLabel value="CHAT" control={<Radio />} label="Chat" />
                </RadioGroup>
              </FormControl>
            )}
          </>
        ) : (
          <TextField
            select
            label="Select Lab Test"
            fullWidth
            margin="normal"
            value={labTest}
            onChange={(e) => setLabTest(e.target.value)}
            required
          >
            {/* Replace with actual lab test data */}
            <MenuItem value="Blood Test">Blood Test</MenuItem>
            <MenuItem value="Urine Test">Urine Test</MenuItem>
          </TextField>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <DatePicker
            label="Date"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue ? dayjs(newValue) : null)}
            slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
          />
          <TimePicker
            label="Time"
            value={selectedTime}
            onChange={(newValue) => setSelectedTime(newValue ? dayjs(newValue) : null)}
            slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
          />
        </Box>

        <Button 
          type="submit" 
          variant="contained" 
          sx={{ mt: 3, mb: 2 }}
          disabled={bookMutation.isPending || loadingDepartments}
        >
          {bookMutation.isPending ? 'Booking...' : 'Book Now'}
        </Button>
      </Box>
    </LocalizationProvider>
  );
}