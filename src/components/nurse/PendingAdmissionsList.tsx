'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { getPendingAdmissions } from '@/services/bedManagementService';
import { PendingAdmission } from '@/types/bedManagement';
import { useSnackbar } from '@/contexts/SnackbarContext';
import AssignBedModal from './AssignBedModal';

interface PendingAdmissionsListProps {
  canManageBeds: boolean;
  onAssigned: () => void;
}

const PendingAdmissionsList: React.FC<PendingAdmissionsListProps> = ({
  canManageBeds,
  onAssigned,
}) => {
  const { showSnackbar } = useSnackbar();
  const [items, setItems] = useState<PendingAdmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<number | null>(null);

  const loadPending = async () => {
    try {
      setLoading(true);
      const data = await getPendingAdmissions();
      setItems(data);
    } catch (error: any) {
      if (error?.response?.status === 403) {
        showSnackbar('You do not have permission to view pending admissions.', 'error');
      } else {
        showSnackbar(error?.message || 'Failed to load pending admissions.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManageBeds) {
      loadPending();
    }
  }, [canManageBeds]);

  const handleAssigned = async () => {
    await loadPending();
    onAssigned();
  };

  if (!canManageBeds) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Bed assignment requires role: Nurse, Doctor, RecordStaff, or Admin.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1.5 }}
      >
        <Typography variant="h6">Pending Admissions</Typography>
        <Button size="small" onClick={loadPending}>
          Refresh
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No pending admissions for bed assignment.
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.admissionId}>
                <TableCell>{item.patientFirstName} {item.patientLastName}</TableCell>
                <TableCell>{item.departmentName || 'N/A'}</TableCell>
                <TableCell>{new Date(item.admissionDate).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setSelectedAdmissionId(item.admissionId)}
                  >
                    Assign Bed
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {selectedAdmissionId && (
        <AssignBedModal
          open={Boolean(selectedAdmissionId)}
          admissionId={selectedAdmissionId}
          onClose={() => setSelectedAdmissionId(null)}
          onAssigned={handleAssigned}
        />
      )}
    </Paper>
  );
};

export default PendingAdmissionsList;
