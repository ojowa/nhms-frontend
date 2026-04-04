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
} from '@mui/material';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { getPendingLabRequestsForDoctor } from '@/services/labService';
import { LabRequest } from '@/types/labRequest';

function PendingLabRequestsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<LabRequest[]>([]);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!user || !user.userId) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getPendingLabRequestsForDoctor(user.userId);
        setPendingRequests(data);
      } catch (err: any) {
        console.error('Error fetching pending lab requests:', err);
        setError(err.response?.data?.message || 'Failed to fetch pending lab requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
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
        Pending Lab Requests
      </Typography>
      <Paper elevation={3} sx={{ p: 2 }}>
        {pendingRequests.length === 0 ? (
          <Typography>No pending lab requests found.</Typography>
        ) : (
          <List>
            {pendingRequests.map((request) => (
              <ListItem key={request.lab_request_id} divider>
                <ListItemText
                  primary={`Test Type: ${request.test_type} for Patient ID: ${request.patient_id}`}
                  secondary={`Reason: ${request.reason} | Status: ${request.status} | Requested: ${new Date(request.created_at).toLocaleString()}`}
                />
                {/* Add actions here like "View Details" or "Mark as Reviewed" if applicable */}
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}

export default withAuth(PendingLabRequestsPage, ['Doctor']);