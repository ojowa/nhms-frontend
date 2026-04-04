'use client';

import React, { useEffect, useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import { getDoctors } from '@/services/userProfileService';
import { assignDoctorToAppointment } from '@/services/appointmentService';
import { Doctor } from '@/types/userProfile';

interface AssignDoctorModalProps {
  open: boolean;
  onClose: () => void;
  appointmentId: number;
  onAssignmentSuccess: () => void;
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
} as const;

const AssignDoctorModal: React.FC<AssignDoctorModalProps> = ({
  open,
  onClose,
  appointmentId,
  onAssignmentSuccess,
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const fetchDoctors = async () => {
        try {
          setLoading(true);
          const data = await getDoctors();
          setDoctors(data);
        } catch (err) {
          setError('Failed to fetch doctors.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchDoctors();
    }
  }, [open]);

  const handleAssign = async () => {
    if (!selectedDoctor) {
      setError('Please select a doctor.');
      return;
    }
    try {
      setLoading(true);
      await assignDoctorToAppointment(appointmentId, { doctorId: Number(selectedDoctor) });
      onAssignmentSuccess();
    } catch (err) {
      setError('Failed to assign doctor.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          Assign Doctor
        </Typography>
        {loading && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="doctor-select-label">Doctor</InputLabel>
          <Select
            labelId="doctor-select-label"
            value={selectedDoctor}
            label="Doctor"
            onChange={(e) => setSelectedDoctor(e.target.value as string)}
          >
            {doctors.map((doctor) => (
              <MenuItem key={doctor.userId} value={doctor.userId}>
                {[doctor.firstName, doctor.middleName, doctor.lastName].filter(Boolean).join(' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAssign} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Assign'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AssignDoctorModal;
