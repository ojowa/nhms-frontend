'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
} from '@mui/material';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { getReviewableLabResults } from '@/services/labService';
import { LabResult } from '@/types/labResult';
import { useSnackbar } from '@/contexts/SnackbarContext';
import LabResultReviewForm from '@/components/lab/LabResultReviewForm';

function LabResultReviewPage() {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewableResults, setReviewableResults] = useState<LabResult[]>([]);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [selectedResultForReview, setSelectedResultForReview] = useState<LabResult | null>(null);

  const fetchReviewableResults = useCallback(async () => {
    if (!user || !user.userId) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getReviewableLabResults(); // Backend needs to filter by user roles for reviewable results
      setReviewableResults(data);
    } catch (err: any) {
      console.error('Error fetching reviewable lab results:', err);
      setError(err.response?.data?.message || 'Failed to fetch reviewable lab results.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReviewableResults();
  }, [fetchReviewableResults]);

  const handleOpenReviewForm = (result: LabResult) => {
    setSelectedResultForReview(result);
    setIsReviewFormOpen(true);
  };

  const handleCloseReviewForm = () => {
    setIsReviewFormOpen(false);
    setSelectedResultForReview(null);
  };

  const handleReviewSuccess = () => {
    handleCloseReviewForm();
    fetchReviewableResults(); // Refresh list after review
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lab Result Review & Approval
      </Typography>
      <Paper elevation={3} sx={{ p: 2 }}>
        {reviewableResults.length === 0 ? (
          <Typography>No lab results currently awaiting review.</Typography>
        ) : (
          <List>
            {reviewableResults.map((result) => (
              <ListItem
                key={result.labResultId}
                divider
                secondaryAction={
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenReviewForm(result)}
                    size="small"
                  >
                    Review
                  </Button>
                }
              >
                <ListItemText
                  primary={`Test: ${result.testName} - Patient ID: ${result.patientId}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        Result Value: {result.resultValue} {result.unit ? `(${result.unit})` : ''}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2" color="text.secondary">
                        Status: <Chip label={result.status} size="small" color={
                          result.status === 'FINAL' || result.status === 'APPROVED' ? 'success' :
                          result.status === 'PRELIMINARY' || result.status === 'PENDING_APPROVAL' ? 'warning' : 'info'
                        } />
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2" color="text.secondary">
                        Requested: {new Date(result.createdAt).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {selectedResultForReview && (
        <LabResultReviewForm
          open={isReviewFormOpen}
          onClose={handleCloseReviewForm}
          labResult={selectedResultForReview}
          onSuccess={handleReviewSuccess}
        />
      )}
    </Box>
  );
}

export default withAuth(LabResultReviewPage, ['LabStaff', 'Doctor', 'Admin']);