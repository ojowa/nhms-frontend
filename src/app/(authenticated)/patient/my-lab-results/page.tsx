'use client';
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { getLabResultsByPatientId } from '@/services/labService';
import { LabResult } from '@/types/labResult';

function MyLabResultsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [labResults, setLabResults] = useState<LabResult[]>([]);

  useEffect(() => {
    const fetchMyLabResults = async () => {
      if (!user || !user.patientId || !user.userId) { // Ensure patientId is available
        setError("User not authenticated or patient ID not found.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getLabResultsByPatientId(user.patientId, user.userId);
        setLabResults(data);
      } catch (err: any) {
        console.error('Error fetching my lab results:', err);
        setError(err.response?.data?.message || 'Failed to fetch your lab results.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyLabResults();
  }, [user]);

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
        My Lab Results
      </Typography>
      <Paper elevation={3} sx={{ p: 2 }}>
        {labResults.length === 0 ? (
          <Typography>No lab results found.</Typography>
        ) : (
          <List>
            {labResults.map((result) => (
              <ListItem key={result.labResultId} divider>
                <ListItemText
                  primary={`Test: ${result.testName} - Result: ${result.resultValue} ${result.unit ? `(${result.unit})` : ''}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        Reference Range: {result.referenceRange}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2" color="text.secondary">
                        Notes: {result.notes || 'N/A'}
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
                        Date: {new Date(result.createdAt).toLocaleString()}
                      </Typography>
                      {result.fileAttachmentUrl && (
                        <Typography component="span" variant="body2" color="text.secondary">
                          <br />
                          Attachment: <a href={result.fileAttachmentUrl} target="_blank" rel="noopener noreferrer">View File</a>
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}

export default withAuth(MyLabResultsPage, ['Patient', 'Officer', 'FamilyMember']); // Adjust roles as per your RBAC