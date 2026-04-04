'use client';

import { useEffect, useState } from 'react';
import withAuth from '@/components/auth/withAuth';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import PendingAdmissionsList from '@/components/nurse/PendingAdmissionsList';
import BedMap from '@/components/nurse/BedMap';
import { useSnackbar } from '@/contexts/SnackbarContext';
import {
  dischargePatientFromBed,
  getWardOccupancy,
  getWards,
  updateBedStatus,
} from '@/services/bedManagementService';
import { BedStatus, Ward, WardOccupancyBed } from '@/types/bedManagement';

function NurseBedManagementPage() {
  const { showSnackbar } = useSnackbar();
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<number | ''>('');
  const [occupancy, setOccupancy] = useState<WardOccupancyBed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStatusByBed, setActiveStatusByBed] = useState<Record<number, BedStatus>>({});

  const fetchWardsAndOccupancy = async () => {
    try {
      setLoading(true);
      setError(null);
      const wardData = await getWards();
      setWards(wardData);
      const wardId = selectedWardId || wardData[0]?.wardId;
      if (wardId) {
        setSelectedWardId(wardId);
        const data = await getWardOccupancy(Number(wardId));
        setOccupancy(data);
      } else {
        setOccupancy([]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load bed management data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOccupancy = async (wardId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWardOccupancy(wardId);
      setOccupancy(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load ward occupancy.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWardsAndOccupancy();
  }, []);

  const handleWardChange = async (wardId: number) => {
    setSelectedWardId(wardId);
    await fetchOccupancy(wardId);
  };

  const handleUpdateStatus = async (bedId: number) => {
    const status = activeStatusByBed[bedId];
    if (!status) return;
    try {
      await updateBedStatus(bedId, status);
      showSnackbar('Bed status updated.', 'success');
      if (selectedWardId) {
        await fetchOccupancy(Number(selectedWardId));
      }
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || 'Failed to update bed status.', 'error');
    }
  };

  const handleDischarge = async (admissionId: number) => {
    try {
      await dischargePatientFromBed(admissionId);
      showSnackbar('Patient discharged successfully.', 'success');
      if (selectedWardId) {
        await fetchOccupancy(Number(selectedWardId));
      }
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || 'Failed to discharge patient.', 'error');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Nurse Bed Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Assign admitted patients to beds, monitor occupancy, and manage bed lifecycle.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <PendingAdmissionsList canManageBeds onAssigned={fetchWardsAndOccupancy} />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
              spacing={1.5}
              sx={{ mb: 2 }}
            >
              <Typography variant="h6">Ward Bed Map</Typography>
              <Stack direction="row" spacing={1}>
                <FormControl size="small" sx={{ minWidth: 220 }}>
                  <InputLabel>Ward</InputLabel>
                  <Select
                    label="Ward"
                    value={selectedWardId}
                    onChange={(e) => handleWardChange(Number(e.target.value))}
                  >
                    {wards.map((ward) => (
                      <MenuItem key={ward.wardId} value={ward.wardId}>
                        {ward.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="outlined" onClick={fetchWardsAndOccupancy}>
                  Refresh
                </Button>
              </Stack>
            </Stack>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <BedMap beds={occupancy} />
            )}
          </Paper>
        </Grid>
      </Grid>

      {occupancy.some((b) => b.status === 'Occupied') && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Occupied Beds Actions
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Bed</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Set Bed Status</TableCell>
                <TableCell>Discharge</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {occupancy
                .filter((b) => b.status === 'Occupied')
                .map((bed) => (
                  <TableRow key={bed.bedId}>
                    <TableCell>{bed.bedNumber}</TableCell>
                    <TableCell>{bed.patientFirstName} {bed.patientLastName}</TableCell>
                    <TableCell>
                      <Chip label={bed.status} color="error" size="small" />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                          <InputLabel>Status</InputLabel>
                          <Select
                            label="Status"
                            value={activeStatusByBed[bed.bedId] || ''}
                            onChange={(e) =>
                              setActiveStatusByBed((prev) => ({
                                ...prev,
                                [bed.bedId]: e.target.value as BedStatus,
                              }))
                            }
                          >
                            <MenuItem value="Available">Available</MenuItem>
                            <MenuItem value="Cleaning">Cleaning</MenuItem>
                            <MenuItem value="Maintenance">Maintenance</MenuItem>
                            <MenuItem value="Occupied">Occupied</MenuItem>
                          </Select>
                        </FormControl>
                        <Button
                          variant="outlined"
                          onClick={() => handleUpdateStatus(bed.bedId)}
                          disabled={!activeStatusByBed[bed.bedId]}
                        >
                          Update
                        </Button>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Button
                        color="error"
                        variant="contained"
                        disabled={!bed.admissionId}
                        onClick={() => bed.admissionId && handleDischarge(bed.admissionId)}
                      >
                        Discharge
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {occupancy.some((b) => b.status === 'Cleaning' || b.status === 'Maintenance') && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Cleaning & Maintenance Beds
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Bed</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Set Bed Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {occupancy
                .filter((b) => b.status === 'Cleaning' || b.status === 'Maintenance')
                .map((bed) => (
                  <TableRow key={bed.bedId}>
                    <TableCell>{bed.bedNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={bed.status}
                        color={bed.status === 'Cleaning' ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                          <InputLabel>Status</InputLabel>
                          <Select
                            label="Status"
                            value={activeStatusByBed[bed.bedId] || ''}
                            onChange={(e) =>
                              setActiveStatusByBed((prev) => ({
                                ...prev,
                                [bed.bedId]: e.target.value as BedStatus,
                              }))
                            }
                          >
                            <MenuItem value="Available">Available</MenuItem>
                            <MenuItem value="Cleaning">Cleaning</MenuItem>
                            <MenuItem value="Maintenance">Maintenance</MenuItem>
                          </Select>
                        </FormControl>
                        <Button
                          variant="outlined"
                          onClick={() => handleUpdateStatus(bed.bedId)}
                          disabled={!activeStatusByBed[bed.bedId]}
                        >
                          Update
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}

export default withAuth(NurseBedManagementPage, ['Nurse']);
