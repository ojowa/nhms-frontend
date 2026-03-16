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
  Typography,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { updateLabResultStatusAndReviewers } from '@/services/labService';
import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { LabResult } from '@/types/labResult';

interface LabResultReviewFormProps {
  open: boolean;
  onClose: () => void;
  labResult: LabResult;
  onSuccess: () => void;
}

const LabResultReviewForm: React.FC<LabResultReviewFormProps> = ({ open, onClose, labResult, onSuccess }) => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [status, setStatus] = useState<LabResult['status']>(labResult.status);
  const [statusNotes, setStatusNotes] = useState<string>(labResult.notes || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const availableStatuses: LabResult['status'][] = ['PRELIMINARY', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'FINAL'];

  const handleSubmit = async () => {
    if (!user || !user.userId) {
      setError('User not authenticated.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateLabResultStatusAndReviewers(
        String(labResult.labResultId),
        status,
        statusNotes,
        // Depending on role and status, these might be set
        String(user.roles.includes('LabStaff') && status === 'PENDING_APPROVAL' ? user.userId : labResult.reviewed_by_user_id || ''),
        String((user.roles.includes('Doctor') || user.roles.includes('Admin')) && status === 'APPROVED' ? user.userId : labResult.approved_by_user_id || ''),
        String(user.userId)
      );
      showSnackbar('Lab result reviewed and status updated successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to update lab result status:', err);
      setError(err.response?.data?.message || 'Failed to update lab result status.');
      showSnackbar('Failed to update lab result status.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Review Lab Result: {labResult.testName}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body1">
              Patient ID: {labResult.patientId}
            </Typography>
            <Typography variant="body1">
              Result Value: {labResult.resultValue} {labResult.unit}
            </Typography>
            <Typography variant="body1">
              Reference Range: {labResult.referenceRange}
            </Typography>
            {labResult.fileAttachmentUrl && (
              <Typography variant="body1">
                Attachment: <a href={labResult.fileAttachmentUrl} target="_blank" rel="noopener noreferrer">View File</a>
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="dense">
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                value={status}
                label="Status"
                onChange={(e) => setStatus(e.target.value as LabResult['status'])}
              >
                {availableStatuses.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="dense"
              label="Status Notes"
              type="text"
              fullWidth
              multiline
              rows={3}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Update Status'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LabResultReviewForm;
