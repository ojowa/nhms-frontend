'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Department } from '@/types/department';
import { Doctor } from '@/types/user';

export interface ReferralWorkflowPayload {
  targetDepartmentId?: number | null;
  targetDoctorId?: number | null;
  reason: string;
  urgency: 'Routine' | 'Urgent' | 'STAT';
}

interface ReferralWorkflowDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: ReferralWorkflowPayload) => Promise<void>;
  loading?: boolean;
  departments: Department[];
  doctors: Doctor[];
  title?: string;
}

const ReferralWorkflowDialog: React.FC<ReferralWorkflowDialogProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
  departments,
  doctors,
  title = 'Referral Workflow',
}) => {
  const [targetDepartmentId, setTargetDepartmentId] = useState<number | ''>('');
  const [targetDoctorId, setTargetDoctorId] = useState<number | ''>('');
  const [urgency, setUrgency] = useState<'Routine' | 'Urgent' | 'STAT'>('Routine');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTargetDepartmentId('');
    setTargetDoctorId('');
    setUrgency('Routine');
    setReason('');
    setError(null);
  }, [open]);

  const handleSubmit = async () => {
    if (targetDepartmentId === '' && targetDoctorId === '') {
      setError('Select target department or target doctor.');
      return;
    }
    if (!reason.trim()) {
      setError('Referral note/reason is required.');
      return;
    }

    setError(null);
    await onSubmit({
      targetDepartmentId: targetDepartmentId === '' ? null : Number(targetDepartmentId),
      targetDoctorId: targetDoctorId === '' ? null : Number(targetDoctorId),
      reason: reason.trim(),
      urgency,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Typography variant="body2" color="text.secondary">
            Select referral target and include a clear clinical note.
          </Typography>
          <Select
            displayEmpty
            value={targetDepartmentId}
            onChange={(e) => {
              const value = e.target.value as string | number;
              setTargetDepartmentId(value === '' ? '' : Number(value));
            }}
            disabled={loading}
          >
            <MenuItem value="">Select Target Department</MenuItem>
            {departments.map((department) => (
              <MenuItem key={department.departmentId} value={department.departmentId}>
                {department.name}
              </MenuItem>
            ))}
          </Select>
          <Select
            displayEmpty
            value={targetDoctorId}
            onChange={(e) => {
              const value = e.target.value as string | number;
              setTargetDoctorId(value === '' ? '' : Number(value));
            }}
            disabled={loading}
          >
            <MenuItem value="">Select Target Doctor (Optional)</MenuItem>
            {doctors.map((doctor) => (
              <MenuItem key={doctor.user_id} value={doctor.user_id}>
                {doctor.fullName || `${doctor.first_name} ${doctor.last_name}`}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as 'Routine' | 'Urgent' | 'STAT')}
            disabled={loading}
          >
            <MenuItem value="Routine">Routine</MenuItem>
            <MenuItem value="Urgent">Urgent</MenuItem>
            <MenuItem value="STAT">STAT</MenuItem>
          </Select>
          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Referral Note / Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Referral'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReferralWorkflowDialog;
