'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Paper,
  Pagination,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { getSubmittedLabResultsByLabStaff } from '@/services/labResultService';
import { LabResult } from '@/types/labResult';

function MySubmittedResultsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<LabResult[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Items per page
  const [totalResults, setTotalResults] = useState(0);

  const fetchSubmittedResults = useCallback(async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getSubmittedLabResultsByLabStaff(user.userId, page, limit);
      setResults(response.data);
      setTotalResults(response.total);
    } catch (err: any) {
      console.error('Error fetching submitted lab results:', err);
      setError(err.response?.data?.message || 'Failed to fetch submitted lab results.');
    } finally {
      setLoading(false);
    }
  }, [user, page, limit]);

  useEffect(() => {
    fetchSubmittedResults();
  }, [fetchSubmittedResults]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
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
        My Submitted Results
      </Typography>

      <Paper elevation={2} sx={{ p: 2 }}>
        {results.length === 0 ? (
          <Typography>No lab results submitted by you yet.</Typography>
        ) : (
          <>
            <List>
              {results.map((result) => (
                <ListItem key={result.labResultId} divider>
                  <ListItemText
                    primary={`${result.testName}: ${result.resultValue} ${result.unit || ''}`}
                    secondary={
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6}>
                          <Typography component="span" variant="body2" color="text.primary" display="block">
                            Patient: {result.patientFirstName} {result.patientLastName}
                          </Typography>
                          <Typography component="span" variant="body2" color="text.secondary" display="block">
                            Status: {result.status}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography component="span" variant="body2" color="text.secondary" display="block">
                            Submitted: {new Date(result.createdAt).toLocaleString()}
                          </Typography>
                          {result.reviewed_by_user_id && (
                            <Typography component="span" variant="body2" color="text.secondary" display="block">
                              Reviewed by: {result.reviewed_by_user_id}
                            </Typography>
                          )}
                          {result.approved_by_user_id && (
                            <Typography component="span" variant="body2" color="text.secondary" display="block">
                              Approved by: {result.approved_by_user_id}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    }
                    secondaryTypographyProps={{ component: 'div' }} // <--- ADDED THIS LINE
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(totalResults / limit)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}

export default withAuth(MySubmittedResultsPage, ['LabStaff', 'Admin']);

