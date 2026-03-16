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
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { createLabResult } from '@/services/labService';
import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { LabResult, LabResultCreationPayload } from '@/types/labResult';

interface LabResultEntryFormProps {
  open: boolean;
  onClose: () => void;
  labRequestId: string;
  patientId: string;
  onSuccess: () => void;
  testType: string; // To pre-fill test name
  appointmentId: string;
}

const LabResultEntryForm: React.FC<LabResultEntryFormProps> = ({
  open,
  onClose,
  labRequestId,
  patientId,
  onSuccess,
  testType,
  appointmentId,
}) => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [testName, setTestName] = useState<string>(testType);
  const [resultValue, setResultValue] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [referenceRange, setReferenceRange] = useState<string>('');
  const [fileAttachmentUrl, setFileAttachmentUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!user || !user.userId) {
      setError('User not authenticated.');
      return;
    }
    if (!testName || !resultValue) {
      setError('Test Name and Result Value are required.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload: LabResultCreationPayload = {
      lab_request_id: Number(labRequestId),
      appointmentId: Number(appointmentId),
      patientId: Number(patientId),
      testName: testName,
      resultValue: resultValue,
      unit: unit || undefined,
      referenceRange: referenceRange || undefined,
      fileAttachmentUrl: fileAttachmentUrl || undefined,
      notes: notes || undefined,
      creatingUserId: String(user.userId),
    };

    try {
      await createLabResult(payload);
      showSnackbar('Lab result entered successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to enter lab result:', err);
      setError(err.response?.data?.message || 'Failed to enter lab result.');
      showSnackbar('Failed to enter lab result.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Enter Lab Result for Request: {labRequestId}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              label="Test Name"
              type="text"
              fullWidth
              required
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              margin="dense"
              label="Result Value"
              type="text"
              fullWidth
              required
              value={resultValue}
              onChange={(e) => setResultValue(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              margin="dense"
              label="Unit (e.g., mg/dL)"
              type="text"
              fullWidth
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              label="Reference Range"
              type="text"
              fullWidth
              value={referenceRange}
              onChange={(e) => setReferenceRange(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              label="File Attachment URL (Optional)"
              type="text"
              fullWidth
              value={fileAttachmentUrl}
              onChange={(e) => setFileAttachmentUrl(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              label="Notes (Optional)"
              type="text"
              fullWidth
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Submit Result'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LabResultEntryForm;
