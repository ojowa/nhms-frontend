'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  assignBed,
  getAvailableBedsInWard,
  getWards,
} from '@/services/bedManagementService';
import { Bed, Ward } from '@/types/bedManagement';
import { useSnackbar } from '@/contexts/SnackbarContext';

interface AssignBedModalProps {
  open: boolean;
  onClose: () => void;
  admissionId: number;
  onAssigned: () => void;
}

const AssignBedModal: React.FC<AssignBedModalProps> = ({
  open,
  onClose,
  admissionId,
  onAssigned,
}) => {
  const { showSnackbar } = useSnackbar();
  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<number | ''>('');
  const [selectedBedId, setSelectedBedId] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);
  const [loadingBeds, setLoadingBeds] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedWardId('');
      setSelectedBedId('');
      setBeds([]);
      return;
    }
    const loadWards = async () => {
      try {
        const data = await getWards();
        setWards(data);
      } catch (error: any) {
        showSnackbar(error?.message || 'Failed to load wards.', 'error');
      }
    };
    loadWards();
  }, [open, showSnackbar]);

  useEffect(() => {
    if (!selectedWardId) {
      setBeds([]);
      setSelectedBedId('');
      return;
    }

    const loadBeds = async () => {
      try {
        setLoadingBeds(true);
        const data = await getAvailableBedsInWard(Number(selectedWardId));
        setBeds(data);
        setSelectedBedId('');
      } catch (error: any) {
        showSnackbar(error?.message || 'Failed to load available beds.', 'error');
      } finally {
        setLoadingBeds(false);
      }
    };
    loadBeds();
  }, [selectedWardId, showSnackbar]);

  const selectedWardName = useMemo(
    () => wards.find((w) => w.wardId === selectedWardId)?.name || '',
    [wards, selectedWardId]
  );

  const handleAssign = async () => {
    if (!selectedBedId) {
      showSnackbar('Select a bed to continue.', 'error');
      return;
    }
    try {
      setSaving(true);
      await assignBed(admissionId, Number(selectedBedId));
      showSnackbar('Bed assigned successfully.', 'success');
      onAssigned();
      onClose();
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || 'Failed to assign bed.';

      if (status === 409 && selectedWardId) {
        try {
          const refreshedBeds = await getAvailableBedsInWard(Number(selectedWardId));
          setBeds(refreshedBeds);
          setSelectedBedId('');
        } catch {
          // Keep original conflict message; refresh failure should not mask it.
        }
        showSnackbar(
          `${message} Available beds were refreshed. Please select another bed.`,
          'error'
        );
        return;
      }

      showSnackbar(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleWardChange = (event: SelectChangeEvent<number | ''>) => {
    const value = event.target.value;
    setSelectedWardId(value === '' ? '' : Number(value));
  };

  const handleBedChange = (event: SelectChangeEvent<number | ''>) => {
    const value = event.target.value;
    setSelectedBedId(value === '' ? '' : Number(value));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign Patient to Bed</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Admission ID: {admissionId}
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Ward</InputLabel>
            <Select
              value={selectedWardId}
              label="Ward"
              onChange={handleWardChange}
            >
              {wards.map((ward) => (
                <MenuItem key={ward.wardId} value={ward.wardId}>
                  {ward.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={!selectedWardId || loadingBeds}>
            <InputLabel>Available Bed</InputLabel>
            <Select
              value={selectedBedId}
              label="Available Bed"
              onChange={handleBedChange}
            >
              {beds.map((bed) => (
                <MenuItem key={bed.bedId} value={bed.bedId}>
                  {bed.bedNumber}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedWardName && (
            <Typography variant="caption" color="text.secondary">
              Selected ward: {selectedWardName}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAssign} variant="contained" disabled={saving || !selectedBedId}>
          {saving ? 'Assigning...' : 'Assign Bed'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignBedModal;
