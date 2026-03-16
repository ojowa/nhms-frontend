'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Grid,
  Modal,
  TextField,
  IconButton,
} from '@mui/material';
import { ThumbUp, ThumbDown, Close } from '@mui/icons-material';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { getLabResultsPendingApproval, updateLabResultStatusAndReviewers } from '@/services/labResultService';
import { LabResult, UpdateLabResultStatusPayload } from '@/types/labResult';

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

function LabApprovalPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingResults, setPendingResults] = useState<LabResult[]>([]);
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({});
  
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchPendingResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await getLabResultsPendingApproval();
      setPendingResults(results);
    } catch (err: any) {
      console.error('Error fetching pending results:', err);
      setError(err.response?.data?.message || 'Failed to fetch results pending approval.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPendingResults();
    }
  }, [user, fetchPendingResults]);
  
  const handleStatusUpdate = async (result: LabResult, newStatus: 'APPROVED' | 'REJECTED', notes?: string) => {
    if (!user) return;
    setSubmitting(prev => ({ ...prev, [result.labResultId]: true }));
    
    const payload: UpdateLabResultStatusPayload = {
      labResultId: result.labResultId,
      newStatus: newStatus,
      statusNotes: notes,
      approverUserId: user.userId, // The doctor is the approver
    };

    try {
      await updateLabResultStatusAndReviewers(payload);
      fetchPendingResults(); // Refresh list
    } catch (err: any) {
       setError(err.response?.data?.message || `Failed to update status.`);
    } finally {
      setSubmitting(prev => ({ ...prev, [result.labResultId]: false }));
    }
  };

  const handleOpenRejectModal = (result: LabResult) => {
    setSelectedResult(result);
    setRejectionModalOpen(true);
  };

  const handleCloseRejectModal = () => {
    setSelectedResult(null);
    setRejectionModalOpen(false);
    setRejectionReason('');
  };

  const handleConfirmRejection = () => {
    if (selectedResult) {
      handleStatusUpdate(selectedResult, 'REJECTED', rejectionReason);
    }
    handleCloseRejectModal();
  };


  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lab Results Pending Approval
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper elevation={3}>
        {pendingResults.length === 0 ? (
          <Typography sx={{ p: 3 }}>No lab results are currently pending approval.</Typography>
        ) : (
          <List>
            {pendingResults.map((result) => (
              <ListItem key={result.labResultId} divider secondaryAction={
                <Box>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ThumbUp />}
                    onClick={() => handleStatusUpdate(result, 'APPROVED')}
                    disabled={submitting[result.labResultId]}
                    sx={{ mr: 1 }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<ThumbDown />}
                    onClick={() => handleOpenRejectModal(result)}
                    disabled={submitting[result.labResultId]}
                  >
                    Reject
                  </Button>
                </Box>
              }>
                <ListItemText
                  primary={`${result.testName}: ${result.resultValue} ${result.unit || ''}`}
                  secondary={`Patient: ${result.patientFirstName} ${result.patientLastName} | Requested on: ${new Date(result.createdAt).toLocaleString()} | Preliminary notes: ${result.notes || 'N/A'}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Rejection Reason Modal */}
      <Modal
        open={rejectionModalOpen}
        onClose={handleCloseRejectModal}
        aria-labelledby="rejection-modal-title"
      >
        <Box sx={modalStyle}>
          <Typography id="rejection-modal-title" variant="h6" component="h2">
            Reason for Rejection
            <IconButton onClick={handleCloseRejectModal} sx={{ position: 'absolute', right: 8, top: 8}}>
                <Close />
            </IconButton>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Provide a reason for rejecting this result..."
            sx={{ mt: 2, mb: 2 }}
          />
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleConfirmRejection}
            disabled={!rejectionReason.trim()}
          >
            Confirm Rejection
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}

export default withAuth(LabApprovalPage, ['Doctor', 'Admin']);
