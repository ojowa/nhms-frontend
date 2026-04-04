'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { createLabRequest } from '@/services/labService';
import { LabRequestCreationPayload } from '@/types/labRequest';

export type DiagnosticOrderCategory = 'Lab' | 'Imaging' | 'Other';

interface DiagnosticOrderFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patientId: string;
  appointmentId: string;
  defaultCategory?: DiagnosticOrderCategory;
}

const LAB_TEST_OPTIONS = [
  'Blood Count',
  'Urinalysis',
  'Lipid Panel',
  'Glucose Test',
  'Liver Function Test',
  'Kidney Function Test',
  'Thyroid Panel',
];

const IMAGING_TEST_OPTIONS = [
  'X-Ray Chest',
  'X-Ray Limb',
  'Abdominal Ultrasound',
  'Pelvic Ultrasound',
  'CT Scan',
  'MRI',
  'Echocardiogram',
];

const DiagnosticOrderForm: React.FC<DiagnosticOrderFormProps> = ({
  open,
  onClose,
  onSuccess,
  patientId,
  appointmentId,
  defaultCategory = 'Lab',
}) => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [category, setCategory] = useState<DiagnosticOrderCategory>(defaultCategory);
  const [selectedTest, setSelectedTest] = useState('');
  const [customTestName, setCustomTestName] = useState('');
  const [urgency, setUrgency] = useState<'Routine' | 'Urgent' | 'STAT'>('Routine');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = useMemo(() => {
    if (category === 'Imaging') return IMAGING_TEST_OPTIONS;
    if (category === 'Lab') return LAB_TEST_OPTIONS;
    return [];
  }, [category]);

  useEffect(() => {
    if (!open) return;
    setCategory(defaultCategory);
    setSelectedTest('');
    setCustomTestName('');
    setUrgency('Routine');
    setReason('');
    setNotes('');
    setError(null);
    setSubmitting(false);
  }, [open, defaultCategory]);

  const handleSubmit = async () => {
    if (!user?.userId) {
      setError('Doctor not authenticated.');
      return;
    }
    if (!reason.trim()) {
      setError('Clinical indication is required.');
      return;
    }

    const normalizedTestName = category === 'Other' ? customTestName.trim() : selectedTest.trim();
    if (!normalizedTestName) {
      setError('Please select or enter an order item.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: LabRequestCreationPayload = {
      appointment_id: Number(appointmentId),
      patient_id: Number(patientId),
      doctor_id: user.userId,
      test_type: `${category} - ${normalizedTestName}`,
      reason: `[${urgency}] ${reason.trim()}${notes.trim() ? ` | Notes: ${notes.trim()}` : ''}`,
    };

    try {
      await createLabRequest(payload);
      showSnackbar(`${category} order created successfully.`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to create order.';
      setError(message);
      showSnackbar(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Diagnostic Order</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <FormControl fullWidth sx={{ mt: 1.5, mb: 2 }}>
          <InputLabel id="order-category-label">Category</InputLabel>
          <Select
            labelId="order-category-label"
            value={category}
            label="Category"
            onChange={(e) => {
              setCategory(e.target.value as DiagnosticOrderCategory);
              setSelectedTest('');
              setCustomTestName('');
            }}
            disabled={submitting}
          >
            <MenuItem value="Lab">Lab</MenuItem>
            <MenuItem value="Imaging">Imaging</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>

        {category === 'Other' ? (
          <TextField
            fullWidth
            label="Order Name"
            value={customTestName}
            onChange={(e) => setCustomTestName(e.target.value)}
            sx={{ mb: 2 }}
            disabled={submitting}
          />
        ) : (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="order-item-label">Order Item</InputLabel>
            <Select
              labelId="order-item-label"
              value={selectedTest}
              label="Order Item"
              onChange={(e) => setSelectedTest(String(e.target.value))}
              disabled={submitting}
            >
              {options.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="order-urgency-label">Urgency</InputLabel>
          <Select
            labelId="order-urgency-label"
            value={urgency}
            label="Urgency"
            onChange={(e) => setUrgency(e.target.value as 'Routine' | 'Urgent' | 'STAT')}
            disabled={submitting}
          >
            <MenuItem value="Routine">Routine</MenuItem>
            <MenuItem value="Urgent">Urgent</MenuItem>
            <MenuItem value="STAT">STAT</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Clinical Indication"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{ mb: 2 }}
          disabled={submitting}
        />

        <TextField
          fullWidth
          multiline
          minRows={2}
          label="Additional Notes (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={submitting}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {submitting ? <CircularProgress size={20} /> : 'Create Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiagnosticOrderForm;
