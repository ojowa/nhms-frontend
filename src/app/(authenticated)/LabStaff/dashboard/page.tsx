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
  Menu,
  MenuItem,
} from '@mui/material';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { getLabRequestsForLabStaff, updateLabRequestStatus } from '@/services/labService';
import { LabRequest } from '@/types/labRequest';
import { useSnackbar } from '@/contexts/SnackbarContext';
import LabResultEntryForm from '@/components/lab/LabResultEntryForm'; // Import LabResultEntryForm

function LabStaffDashboardPage() {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRequest, setSelectedRequest] = useState<LabRequest | null>(null);
  const [isResultEntryFormOpen, setIsResultEntryFormOpen] = useState(false);
  const [selectedRequestForEntry, setSelectedRequestForEntry] = useState<LabRequest | null>(null);

  const fetchLabRequests = useCallback(async () => {
    if (!user || !user.userId) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Assuming a service call to get all lab requests for lab staff
      // This will need to be implemented in labService.ts to fetch requests relevant to lab staff
      // For now, let's assume it fetches all requests (admin-like view)
      // In a real scenario, this would filter by lab_request status, assigned lab, etc.
      const data = await getLabRequestsForLabStaff(user.userId);
      setLabRequests(data);
    } catch (err: any) {
      console.error('Error fetching lab requests:', err);
      setError(err.response?.data?.message || 'Failed to fetch lab requests.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLabRequests();
  }, [fetchLabRequests]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, request: LabRequest) => {
    setAnchorEl(event.currentTarget);
    setSelectedRequest(request);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRequest(null);
  };

  const handleUpdateStatus = async (newStatus: LabRequest['status']) => {
    if (!selectedRequest || !user || !user.userId) return;

    handleMenuClose();
    setLoading(true);
    try {
      await updateLabRequestStatus(selectedRequest.lab_request_id, newStatus, user.userId);
      showSnackbar(`Lab request ${selectedRequest.lab_request_id} status updated to ${newStatus}`, 'success');
      fetchLabRequests(); // Refresh the list
    } catch (err: any) {
      console.error('Error updating lab request status:', err);
      showSnackbar(err.response?.data?.message || 'Failed to update lab request status.', 'error');
    } finally {
      setLoading(false);
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lab Staff Dashboard
      </Typography>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Pending & In-Progress Lab Requests
        </Typography>
        {labRequests.length === 0 ? (
          <Typography>No lab requests currently awaiting action.</Typography>
        ) : (
          <List>
            {labRequests.map((request) => (
              <ListItem
                key={request.lab_request_id}
                divider
                secondaryAction={
                  <>
                    <Chip label={request.status} color={
                      request.status === 'PENDING' ? 'info' :
                      request.status === 'SAMPLE_COLLECTED' ? 'warning' :
                      request.status === 'PROCESSING' ? 'primary' : 'default'
                    } sx={{ mr: 1 }} />
                    <Button
                      aria-controls={`status-menu-${request.lab_request_id}`}
                      aria-haspopup="true"
                      onClick={(e) => handleMenuOpen(e, request)}
                      variant="outlined"
                      size="small"
                    >
                      Update Status
                    </Button>
                  </>
                }
              >
                <ListItemText
                  primary={`Test Type: ${request.test_type} for Patient ID: ${request.patient_id}`}
                  secondary={`Reason: ${request.reason} | Requested by Doctor ID: ${request.doctor_id} | Created: ${new Date(request.created_at).toLocaleString()}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Menu
        id="status-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleUpdateStatus('SAMPLE_COLLECTED')}>Sample Collected</MenuItem>
        <MenuItem onClick={() => handleUpdateStatus('PROCESSING')}>Processing</MenuItem>
        <MenuItem onClick={() => handleUpdateStatus('COMPLETED')}>Completed</MenuItem>
        <MenuItem onClick={() => handleUpdateStatus('CANCELLED')}>Cancelled</MenuItem>
        {selectedRequest && (selectedRequest.status === 'SAMPLE_COLLECTED' || selectedRequest.status === 'PROCESSING') && (
          <MenuItem onClick={() => {
            handleMenuClose();
            setSelectedRequestForEntry(selectedRequest);
            setIsResultEntryFormOpen(true);
          }}>
            Enter Results
          </MenuItem>
        )}
      </Menu>

      {selectedRequestForEntry && (
        <LabResultEntryForm
          open={isResultEntryFormOpen}
          onClose={() => setIsResultEntryFormOpen(false)}
          onSuccess={() => {
            setIsResultEntryFormOpen(false);
            fetchLabRequests(); // Refresh the list after successful entry
          }}
          labRequestId={String(selectedRequestForEntry.lab_request_id)}
          patientId={String(selectedRequestForEntry.patient_id)}
          testType={selectedRequestForEntry.test_type}
          appointmentId={String(selectedRequestForEntry.appointment_id)}
        />
      )}
    </Box>
  );
}

export default withAuth(LabStaffDashboardPage, ['LabStaff', 'Admin']);