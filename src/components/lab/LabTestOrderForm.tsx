'use client';
import React, { useState } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { LabRequestCreationPayload } from '@/types/labRequest';
import { createLabRequest } from '@/services/labService';
import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from '@/contexts/SnackbarContext';

interface LabTestOrderFormProps {
  open: boolean;
  onClose: () => void;
  patientId: string; // The patient for whom the lab test is being ordered
  appointmentId: string; // The current appointment context
  onSuccess: () => void;
}

const LabTestOrderForm: React.FC<LabTestOrderFormProps> = ({ open, onClose, patientId, appointmentId, onSuccess }) => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [testType, setTestType] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Hardcoded test types for now, can be fetched from an API in a real app
  const availableTestTypes = [
    'Blood Count',
    'Urinalysis',
    'Lipid Panel',
    'Glucose Test',
    'Liver Function Test',
    'Kidney Function Test',
    'Thyroid Panel',
    'X-Ray',
    'MRI',
    'CT Scan',
  ];

  const handleSubmit = async () => {
    if (!user || !user.userId) {
      setError('Doctor not authenticated.');
      return;
    }
    if (!testType || !reason) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload: LabRequestCreationPayload = {
      appointment_id: Number(appointmentId),
      patient_id: Number(patientId),
      doctor_id: user.userId, // Doctor ordering the test
      test_type: testType,
      reason: reason,
    };

    try {
      await createLabRequest(payload);
      showSnackbar('Lab test ordered successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to order lab test:', err);
      setError(err.response?.data?.message || 'Failed to order lab test.');
      showSnackbar('Failed to order lab test.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Order Lab Test</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="test-type-label">Test Type</InputLabel>
          <Select
            labelId="test-type-label"
            value={testType}
            label="Test Type"
            onChange={(e) => setTestType(e.target.value as string)}
          >
            {availableTestTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          label="Reason for Test"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{ mb: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Order Test'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LabTestOrderForm;