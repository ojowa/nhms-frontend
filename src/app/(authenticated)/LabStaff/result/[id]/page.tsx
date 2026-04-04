'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { getLabRequestById } from '@/services/labRequestService';
import { createLabResult, getLabResultsByLabRequest, updateLabResult, updateLabResultStatusAndReviewers } from '@/services/labResultService';
import { LabRequest } from '@/types/labRequest';
import { LabResult, LabResultCreationPayload, UpdateLabResultStatusPayload } from '@/types/labResult';

function LabResultEntryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const labRequestId = parseInt(params.id as string, 10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [labRequest, setLabRequest] = useState<LabRequest | null>(null);
  const [existingResults, setExistingResults] = useState<LabResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusUpdateSubmitting, setStatusUpdateSubmitting] = useState<Record<number, boolean>>({});

  // Form state for new result
  const [newResult, setNewResult] = useState({
    testName: '',
    resultValue: '',
    unit: '',
    referenceRange: '',
    notes: '',
  });

  const fetchRequestAndResults = useCallback(async () => {
    if (!labRequestId || !user) return;
    setLoading(true);
    setError(null);
    try {
      const requestData = await getLabRequestById(labRequestId);
      setLabRequest(requestData);
      
      const resultsData = await getLabResultsByLabRequest(labRequestId);
      setExistingResults(resultsData);

    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to fetch lab request and results.');
    } finally {
      setLoading(false);
    }
  }, [labRequestId, user]);

  useEffect(() => {
    fetchRequestAndResults();
  }, [fetchRequestAndResults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewResult(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labRequest || !user) return;

    setIsSubmitting(true);
    setError(null);

    const payload: LabResultCreationPayload = {
      lab_request_id: labRequest.lab_request_id, // Add lab_request_id
      appointmentId: labRequest.appointment_id,
      patientId: labRequest.patient_id,
      creatingUserId: String(user.userId),
      ...newResult,
    };

    try {
      await createLabResult(payload);
      // Clear form and refetch results
      setNewResult({ testName: '', resultValue: '', unit: '', referenceRange: '', notes: '' });
      fetchRequestAndResults();
    } catch (err: any) {
      console.error('Error creating lab result:', err);
      setError(err.response?.data?.message || 'Failed to create lab result.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (resultId: number, newStatus: UpdateLabResultStatusPayload['newStatus']) => {
    if (!user) return;

    setStatusUpdateSubmitting(prev => ({...prev, [resultId]: true}));
    setError(null);

    const payload: UpdateLabResultStatusPayload = {
      labResultId: resultId,
      newStatus: newStatus,
      reviewerUserId: user.userId,
    };

    try {
      await updateLabResultStatusAndReviewers(payload);
      fetchRequestAndResults(); // Refetch to show updated status
    } catch (err: any) {
      console.error(`Error updating status for result ${resultId}:`, err);
      setError(err.response?.data?.message || 'Failed to update result status.');
    } finally {
        setStatusUpdateSubmitting(prev => ({...prev, [resultId]: false}));
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!labRequest) {
    return <Alert severity="warning">Lab request not found.</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lab Result Entry for Request #{labRequest.lab_request_id}
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Patient Details</Typography>
            <Typography><strong>Name:</strong> {labRequest.patientFirstName} {labRequest.patientLastName}</Typography>
            <Typography><strong>Patient ID:</strong> {labRequest.patient_id}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Request Details</Typography>
            <Typography><strong>Test:</strong> {labRequest.test_type}</Typography>
            <Typography><strong>Requesting Doctor:</strong> Dr. {labRequest.doctorFirstName} {labRequest.doctorLastName}</Typography>
            <Typography><strong>Requested on:</strong> {new Date(labRequest.request_date).toLocaleString()}</Typography>
            <Typography><strong>Status:</strong> {labRequest.status}</Typography>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={4}>
        {/* Existing Results */}
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>Existing Results</Typography>
          <Paper elevation={2} sx={{ p: 2, maxHeight: 500, overflow: 'auto' }}>
            {existingResults.length === 0 ? (
              <Typography>No results entered for this request yet.</Typography>
            ) : (
              <List>
                {existingResults.map((result) => (
                  <React.Fragment key={result.labResultId}>
                    <ListItem alignItems="flex-start" secondaryAction={
                        result.status === 'PRELIMINARY' && (
                            <Button
                                size="small"
                                variant="contained"
                                color="info"
                                onClick={() => handleStatusUpdate(result.labResultId, 'PENDING_APPROVAL')}
                                disabled={statusUpdateSubmitting[result.labResultId]}
                            >
                                {statusUpdateSubmitting[result.labResultId] ? <CircularProgress size={20} /> : 'Submit for Approval'}
                            </Button>
                        )
                    }>
                      <ListItemText
                        primary={`${result.testName}: ${result.resultValue} ${result.unit || ''}`}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              Range: {result.referenceRange || 'N/A'} | Status: {result.status}
                            </Typography>
                            <br />
                            {result.notes && `Notes: ${result.notes}`}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* New Result Form */}
        <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>Add New Result</Typography>
            <Paper component="form" onSubmit={handleCreateResult} elevation={2} sx={{ p: 3 }}>
                <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                    name="testName"
                    label="Test Name"
                    value={newResult.testName}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    />
                </Grid>
                <Grid item xs={12} sm={8}>
                    <TextField
                    name="resultValue"
                    label="Result Value"
                    value={newResult.resultValue}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                    name="unit"
                    label="Unit"
                    value={newResult.unit}
                    onChange={handleInputChange}
                    fullWidth
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                    name="referenceRange"
                    label="Reference Range"
                    value={newResult.referenceRange}
                    onChange={handleInputChange}
                    fullWidth
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                    name="notes"
                    label="Notes"
                    value={newResult.notes}
                    onChange={handleInputChange}
                    fullWidth
                    multiline
                    rows={3}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    fullWidth
                    >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Add Result'}
                    </Button>
                </Grid>
                </Grid>
            </Paper>
        </Grid>
      </Grid>
       <Button
            variant="outlined"
            onClick={() => router.back()}
            sx={{ mt: 3 }}
          >
            Back to Dashboard
        </Button>
    </Box>
  );
}

export default withAuth(LabResultEntryPage, ['LabStaff', 'Admin']);

