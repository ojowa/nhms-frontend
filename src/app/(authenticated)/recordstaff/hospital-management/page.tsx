'use client';

import { useEffect, useMemo, useState } from 'react';
import withAuth from '@/components/auth/withAuth';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { getHospitalOverview, HospitalOverview } from '@/services/hospitalService';
import { UserRole } from '@/types/auth';
import BedMap from '@/components/nurse/BedMap';
import PendingAdmissionsList from '@/components/nurse/PendingAdmissionsList';
import { useAuth } from '@/contexts/AuthContext';
import {
  dischargePatientFromBed,
  createWard,
  getWardOccupancy,
  getWards,
  updateWard,
  updateBedStatus,
} from '@/services/bedManagementService';
import {
  BedStatus,
  CreateWardPayload,
  Ward,
  WardOccupancyBed,
} from '@/types/bedManagement';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { fetchAllDepartments } from '@/services/departmentService';
import { Department } from '@/types/department';

function HospitalManagementPage() {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const roles = user?.roles || [];
  const canManageBeds = useMemo(
    () =>
      roles.includes(UserRole.Admin) || roles.includes(UserRole.RecordStaff),
    [roles]
  );

  const [tab, setTab] = useState(0);
  const [overview, setOverview] = useState<HospitalOverview | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<number | ''>('');
  const [occupancy, setOccupancy] = useState<WardOccupancyBed[]>([]);
  const [loadingBeds, setLoadingBeds] = useState(false);
  const [bedError, setBedError] = useState<string | null>(null);
  const [activeStatusByBed, setActiveStatusByBed] = useState<Record<number, BedStatus>>({});
  const [departments, setDepartments] = useState<Department[]>([]);
  const [savingWard, setSavingWard] = useState(false);
  const [editingWardId, setEditingWardId] = useState<number | null>(null);
  const [wardForm, setWardForm] = useState<CreateWardPayload>({
    departmentId: null,
    name: '',
    genderRestriction: 'Mixed',
    capacity: 0,
  });

  const fetchOverview = async () => {
    try {
      setLoadingOverview(true);
      setOverviewError(null);
      const data = await getHospitalOverview();
      setOverview(data);
    } catch (err: any) {
      setOverviewError(
        'Failed to fetch hospital overview: ' +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchWardsAndOccupancy = async () => {
    if (!canManageBeds) return;
    try {
      setLoadingBeds(true);
      setBedError(null);
      const wardData = await getWards();
      setWards(wardData);

      const wardId = selectedWardId || wardData[0]?.wardId;
      if (wardId) {
        setSelectedWardId(wardId);
        const occupancyData = await getWardOccupancy(Number(wardId));
        setOccupancy(occupancyData);
      } else {
        setOccupancy([]);
      }
    } catch (err: any) {
      setBedError(err.response?.data?.message || err.message || 'Failed to load bed data.');
    } finally {
      setLoadingBeds(false);
    }
  };

  const fetchDepartments = async () => {
    if (!canManageBeds) return;
    try {
      const data = await fetchAllDepartments();
      setDepartments(data);
    } catch (err: any) {
      showSnackbar(err?.message || 'Failed to load departments.', 'error');
    }
  };

  const fetchOccupancyForWard = async (wardId: number) => {
    try {
      setLoadingBeds(true);
      setBedError(null);
      const occupancyData = await getWardOccupancy(wardId);
      setOccupancy(occupancyData);
    } catch (err: any) {
      setBedError(err.response?.data?.message || err.message || 'Failed to load occupancy.');
    } finally {
      setLoadingBeds(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchWardsAndOccupancy();
  }, [canManageBeds]);

  useEffect(() => {
    fetchDepartments();
  }, [canManageBeds]);

  const handleWardChange = async (wardId: number) => {
    setSelectedWardId(wardId);
    await fetchOccupancyForWard(wardId);
  };

  const handleUpdateStatus = async (bedId: number) => {
    const status = activeStatusByBed[bedId];
    if (!status) return;
    try {
      await updateBedStatus(bedId, status);
      showSnackbar('Bed status updated.', 'success');
      if (selectedWardId) {
        await fetchOccupancyForWard(Number(selectedWardId));
      }
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Failed to update bed status.', 'error');
    }
  };

  const handleDischarge = async (admissionId: number) => {
    try {
      await dischargePatientFromBed(admissionId);
      showSnackbar('Patient discharged from bed successfully.', 'success');
      if (selectedWardId) {
        await fetchOccupancyForWard(Number(selectedWardId));
      }
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || 'Failed to discharge patient.', 'error');
    }
  };

  const resetWardForm = () => {
    setEditingWardId(null);
    setWardForm({
      departmentId: null,
      name: '',
      genderRestriction: 'Mixed',
      capacity: 0,
    });
  };

  const handleEditWard = (ward: Ward) => {
    setEditingWardId(ward.wardId);
    setWardForm({
      departmentId: ward.departmentId ?? null,
      name: ward.name,
      genderRestriction: ward.genderRestriction,
      capacity: ward.capacity,
    });
  };

  const handleSaveWard = async () => {
    if (!wardForm.name.trim()) {
      showSnackbar('Ward name is required.', 'error');
      return;
    }
    if (wardForm.capacity < 0 || Number.isNaN(wardForm.capacity)) {
      showSnackbar('Capacity must be zero or greater.', 'error');
      return;
    }

    try {
      setSavingWard(true);
      if (editingWardId) {
        await updateWard({
          wardId: editingWardId,
          ...wardForm,
        });
        showSnackbar('Ward updated successfully.', 'success');
      } else {
        await createWard(wardForm);
        showSnackbar('Ward created successfully.', 'success');
      }
      await fetchWardsAndOccupancy();
      resetWardForm();
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || 'Failed to save ward.', 'error');
    } finally {
      setSavingWard(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Hospital Management
        </Typography>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Overview" />
          <Tab label="Bed Management" />
        </Tabs>

        {tab === 0 && (
          <>
            {loadingOverview ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : overviewError ? (
              <Alert severity="error">{overviewError}</Alert>
            ) : overview ? (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6">Total Users</Typography>
                    <Typography variant="h3" color="primary">
                      {overview.totalUsers}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6">Total Patients</Typography>
                    <Typography variant="h3" color="primary">
                      {overview.totalPatients}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6">Total Doctors</Typography>
                    <Typography variant="h3" color="primary">
                      {overview.totalDoctors}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6">Total Nurses</Typography>
                    <Typography variant="h3" color="primary">
                      {overview.totalNurses}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6">Total Departments</Typography>
                    <Typography variant="h3" color="primary">
                      {overview.totalDepartments}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6">Appointments Scheduled</Typography>
                    <Typography variant="h3" color="secondary">
                      {overview.totalAppointmentsScheduled}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6">Appointments Completed</Typography>
                    <Typography variant="h3" color="success.main">
                      {overview.totalAppointmentsCompleted}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">No overview data available.</Alert>
            )}
          </>
        )}

        {tab === 1 && (
          <Stack spacing={2}>
            {!canManageBeds && (
              <Alert severity="warning">
                Bed management requires role: Nurse, Doctor, or Admin.
              </Alert>
            )}

            {canManageBeds && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <PendingAdmissionsList
                    canManageBeds={canManageBeds}
                    onAssigned={fetchWardsAndOccupancy}
                  />
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
                        <FormControl sx={{ minWidth: 220 }} size="small">
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

                    {bedError && <Alert severity="error" sx={{ mb: 2 }}>{bedError}</Alert>}
                    <BedMap beds={occupancy} loading={loadingBeds} />
                  </Paper>
                </Grid>
              </Grid>
            )}

            {canManageBeds && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1.5 }}>
                  Ward Administration
                </Typography>

                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Ward Name"
                      value={wardForm.name}
                      onChange={(e) =>
                        setWardForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Department</InputLabel>
                      <Select
                        label="Department"
                        value={wardForm.departmentId ?? ''}
                        onChange={(e) => {
                          const value = e.target.value as string | number;
                          setWardForm((prev) => ({
                            ...prev,
                            departmentId: value === '' ? null : Number(value),
                          }));
                        }}
                      >
                        <MenuItem value="">None</MenuItem>
                        {departments.map((department) => (
                          <MenuItem
                            key={department.departmentId}
                            value={department.departmentId}
                          >
                            {department.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        label="Gender"
                        value={wardForm.genderRestriction}
                        onChange={(e) =>
                          setWardForm((prev) => ({
                            ...prev,
                            genderRestriction: e.target.value as
                              | 'Male'
                              | 'Female'
                              | 'Mixed',
                          }))
                        }
                      >
                        <MenuItem value="Mixed">Mixed</MenuItem>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Capacity"
                      value={wardForm.capacity}
                      onChange={(e) =>
                        setWardForm((prev) => ({
                          ...prev,
                          capacity: Number(e.target.value),
                        }))
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <Stack direction="row" spacing={1} sx={{ height: '100%', alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        onClick={handleSaveWard}
                        disabled={savingWard}
                      >
                        {editingWardId ? 'Update' : 'Create'}
                      </Button>
                      {editingWardId && (
                        <Button variant="text" onClick={resetWardForm}>
                          Cancel
                        </Button>
                      )}
                    </Stack>
                  </Grid>
                </Grid>

                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ward</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell>Capacity</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {wards.map((ward) => (
                      <TableRow key={ward.wardId}>
                        <TableCell>{ward.name}</TableCell>
                        <TableCell>{ward.departmentName || 'N/A'}</TableCell>
                        <TableCell>{ward.genderRestriction}</TableCell>
                        <TableCell>{ward.capacity}</TableCell>
                        <TableCell align="right">
                          <Button size="small" onClick={() => handleEditWard(ward)}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}

            {canManageBeds && occupancy.some((b) => b.status === 'Occupied') && (
              <Paper sx={{ p: 2 }}>
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
                          <TableCell>
                            {bed.patientFirstName} {bed.patientLastName}
                          </TableCell>
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

            {canManageBeds && occupancy.some((b) => b.status === 'Cleaning' || b.status === 'Maintenance') && (
              <Paper sx={{ p: 2 }}>
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
          </Stack>
        )}
      </Paper>
    </Container>
  );
}

export default withAuth(HospitalManagementPage, [UserRole.RecordStaff, UserRole.Admin]);
