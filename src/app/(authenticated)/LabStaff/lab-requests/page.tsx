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
  TextField,
  InputAdornment,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { Search, Clear } from '@mui/icons-material';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getAllLabRequests } from '@/services/labRequestService';
import { LabRequest } from '@/types/labRequest';

type LabRequestStatus = 'PENDING' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

function LabRequestsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<LabRequest[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Items per page
  const [totalRequests, setTotalRequests] = useState(0);
  const [statusFilter, setStatusFilter] = useState<LabRequestStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLabRequests = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getAllLabRequests(
        page,
        limit,
        statusFilter || undefined,
        undefined, // patientIdFilter - not filtering by patient ID here
        searchQuery || undefined
      );
      setRequests(response.data);
      setTotalRequests(response.total);
    } catch (err: any) {
      console.error('Error fetching lab requests:', err);
      setError(err.response?.data?.message || 'Failed to fetch lab requests.');
    } finally {
      setLoading(false);
    }
  }, [user, page, limit, statusFilter, searchQuery]);

  useEffect(() => {
    fetchLabRequests();
  }, [fetchLabRequests]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value as LabRequestStatus | '');
    setPage(1); // Reset page when filter changes
  };

  const handleSearchQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1); // Reset page when search query changes
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(1); // Reset page when search is cleared
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
        All Lab Requests
      </Typography>

      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search by Test Type"
              value={searchQuery}
              onChange={handleSearchQueryChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {searchQuery && (
                      <IconButton onClick={handleClearSearch} edge="end">
                        <Clear />
                      </IconButton>
                    )}
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="SAMPLE_COLLECTED">Sample Collected</MenuItem>
                <MenuItem value="PROCESSING">Processing</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => fetchLabRequests()} // Refetch with current filters
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ p: 2 }}>
        {requests.length === 0 ? (
          <Typography>No lab requests found matching the criteria.</Typography>
        ) : (
          <>
            <List>
              {requests.map((request) => (
                <ListItem key={request.lab_request_id} divider secondaryAction={
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => router.push(`/LabStaff/result/${request.lab_request_id}`)}
                    >
                        View / Enter Result
                    </Button>
                }>
                  <ListItemText
                    primary={`${request.test_type} (Status: ${request.status})`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          Patient: {request.patientFirstName} {request.patientLastName}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="text.secondary">
                          Doctor: {request.doctorFirstName} {request.doctorLastName} | Requested: {new Date(request.request_date).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(totalRequests / limit)}
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

export default withAuth(LabRequestsPage, ['LabStaff', 'Admin']);

