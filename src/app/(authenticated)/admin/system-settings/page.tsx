'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControlLabel,
  Paper,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import { AddCircle as AddCircleIcon, Delete as DeleteIcon } from '@mui/icons-material';
import withAuth from '@/components/auth/withAuth';
import { getSystemSettings, updateSystemSettings, SystemSettings } from '@/services/systemSettingsService';
import { deleteRole, getAllRoles } from '@/services/userAdminService';
import { PaginatedRoles, Role } from '@/types/admin';
import DeleteRoleModal from '@/components/modals/DeleteRoleModal';
import CreateRoleForm from '@/components/forms/CreateRoleForm';
import { useSnackbar } from '@/contexts/SnackbarContext';

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

function SystemSettingsPage() {
  const { showSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);

  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesPaginationModel, setRolesPaginationModel] = useState({ page: 0, pageSize: 5 });
  const [totalRoles, setTotalRoles] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [openCreateRoleDialog, setOpenCreateRoleDialog] = useState(false);
  const [openDeleteRoleModal, setOpenDeleteRoleModal] = useState(false);
  const [roleToDeleteId, setRoleToDeleteId] = useState<number | null>(null);
  const [roleToDeleteName, setRoleToDeleteName] = useState<string>('');

  const fetchSettings = useCallback(async () => {
    const data = await getSystemSettings();
    setSettings(data);
  }, []);

  const fetchRoles = useCallback(async () => {
    const paginatedRoles: PaginatedRoles = await getAllRoles(
      rolesPaginationModel.page + 1,
      rolesPaginationModel.pageSize
    );
    setRoles(paginatedRoles.roles);
    setTotalRoles(paginatedRoles.total);
  }, [rolesPaginationModel.page, rolesPaginationModel.pageSize]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([fetchSettings(), fetchRoles()]);
      } catch (err: any) {
        setError(err?.message || 'Failed to load system settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [fetchSettings, fetchRoles]);

  const handleSettingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    const { name, value, type, checked } = event.target;
    const numericFields = new Set([
      'sessionTimeout',
      'maxAppointmentDays',
      'bedStatusSlaHours',
      'vitalAlertSystolicHighThreshold',
      'vitalAlertTemperatureHighThreshold',
      'vitalAlertSpo2LowThreshold',
    ]);
    setSettings({
      ...settings,
      [name]:
        type === 'checkbox'
          ? checked
          : numericFields.has(name)
            ? parseInt(value, 10)
            : value,
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const response = await updateSystemSettings(settings);
      if (response.success) {
        setSuccess(response.message);
        showSnackbar(response.message, 'success');
      } else {
        setError('Failed to save settings.');
        showSnackbar('Failed to save settings.', 'error');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save settings.');
      showSnackbar(err?.message || 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDeleteRoleModal = (roleId: number, roleName: string) => {
    setRoleToDeleteId(roleId);
    setRoleToDeleteName(roleName);
    setOpenDeleteRoleModal(true);
  };

  const handleConfirmDeleteRole = async () => {
    if (!roleToDeleteId) return;
    try {
      await deleteRole(roleToDeleteId);
      showSnackbar(`Role "${roleToDeleteName}" deleted successfully.`, 'success');
      setOpenDeleteRoleModal(false);
      setRoleToDeleteId(null);
      setRoleToDeleteName('');
      await fetchRoles();
    } catch (err: any) {
      showSnackbar(`Failed to delete role "${roleToDeleteName}".`, 'error');
      setError(err?.message || 'Failed to delete role.');
    }
  };

  const roleColumns: GridColDef[] = [
    { field: 'roleName', headerName: 'Role Name', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => {
        const coreRoles = ['Admin'];
        const isCoreRole = coreRoles.includes(params.row.roleName);
        return (
          <Button
            variant="text"
            color="error"
            startIcon={<DeleteIcon />}
            disabled={isCoreRole}
            onClick={() => handleOpenDeleteRoleModal(params.row.roleId, params.row.roleName)}
          >
            Delete
          </Button>
        );
      },
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" gutterBottom>
          System Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Settings are organized by module. Tabs marked as not implemented are proposal items not yet built in this codebase.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Tabs value={activeTab} onChange={(_, tab) => setActiveTab(tab)} sx={{ mb: 3 }} variant="scrollable" scrollButtons="auto">
          <Tab label="Core Settings" />
          <Tab label="Role Management" />
          <Tab label="Security & Access" />
          <Tab label="Clinical Workflow" />
          <Tab label="Lab & Pharmacy" />
        </Tabs>

        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {settings ? (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Active System Controls</Typography>
                  <TextField
                    fullWidth
                    type="number"
                    label="Session Timeout (minutes)"
                    name="sessionTimeout"
                    value={settings.sessionTimeout}
                    onChange={handleSettingChange}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Max Appointment Days (ahead)"
                    name="maxAppointmentDays"
                    value={settings.maxAppointmentDays}
                    onChange={handleSettingChange}
                    sx={{ mb: 2 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enableNewRegistrations}
                        onChange={handleSettingChange}
                        name="enableNewRegistrations"
                      />
                    }
                    label="Enable New User Registrations"
                  />
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                      {saving ? <CircularProgress size={20} /> : 'Save Core Settings'}
                    </Button>
                  </Box>
                </Paper>
              ) : (
                <Alert severity="warning">System settings payload is not available.</Alert>
              )}
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Project Scope Note</Typography>
                <Typography variant="body2" color="text.secondary">
                  These are the currently implemented admin settings endpoints:
                  <br />
                  <code>/api/admin/settings</code>
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Role Management</Typography>
              <Button
                variant="contained"
                startIcon={<AddCircleIcon />}
                onClick={() => setOpenCreateRoleDialog(true)}
              >
                Create Role
              </Button>
            </Box>
            <Box sx={{ height: 430 }}>
              <DataGrid
                rows={roles}
                columns={roleColumns}
                getRowId={(row) => row.roleId}
                pagination
                paginationMode="server"
                rowCount={totalRoles}
                pageSizeOptions={[5, 10]}
                paginationModel={rolesPaginationModel}
                onPaginationModelChange={setRolesPaginationModel}
                slots={{ toolbar: CustomToolbar }}
                disableRowSelectionOnClick
              />
            </Box>
          </Paper>
        )}

        {activeTab === 2 && (
          <Paper sx={{ p: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Not fully implemented in this project yet.
            </Alert>
            <Typography variant="h6" gutterBottom>Security & Access Settings</Typography>
            <Typography variant="body2" color="text.secondary">
              Planned from the proposal but currently not exposed as admin settings controls in UI/API:
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>- 2FA policy controls</Typography>
            <Typography variant="body2">- Break-the-Glass policy thresholds and approvals</Typography>
            <Typography variant="body2">- Biometric verification policy toggles</Typography>
            <Typography variant="body2">- Audit retention and governance rules panel</Typography>
          </Paper>
        )}

        {activeTab === 3 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Clinical Workflow Settings</Typography>
            {settings ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  These settings are now configurable and saved via <code>/api/admin/settings</code>.
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enforceConsultationTransitions}
                      onChange={handleSettingChange}
                      name="enforceConsultationTransitions"
                    />
                  }
                  label="Enforce Consultation State Transitions"
                  sx={{ mb: 1 }}
                />

                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Allowed Consultation Transitions (CSV)"
                  name="consultationAllowedTransitionsCsv"
                  value={settings.consultationAllowedTransitionsCsv}
                  onChange={handleSettingChange}
                  helperText="Example: SCHEDULED>ASSIGNED,ASSIGNED>IN_CONSULTATION,IN_CONSULTATION>COMPLETED"
                  sx={{ mb: 2 }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enforceDischargeSummaryBeforeDischarge}
                      onChange={handleSettingChange}
                      name="enforceDischargeSummaryBeforeDischarge"
                    />
                  }
                  label="Require Discharge Summary Before Discharge"
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Inpatient Bed Status SLA (hours)"
                  name="bedStatusSlaHours"
                  value={settings.bedStatusSlaHours}
                  onChange={handleSettingChange}
                  sx={{ mb: 2 }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableVitalTrendAlerts}
                      onChange={handleSettingChange}
                      name="enableVitalTrendAlerts"
                    />
                  }
                  label="Enable Vital Trends Alerts"
                  sx={{ mb: 2 }}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Systolic High Threshold"
                      name="vitalAlertSystolicHighThreshold"
                      value={settings.vitalAlertSystolicHighThreshold}
                      onChange={handleSettingChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Temperature High Threshold (°C)"
                      name="vitalAlertTemperatureHighThreshold"
                      value={settings.vitalAlertTemperatureHighThreshold}
                      onChange={handleSettingChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="SpO2 Low Threshold (%)"
                      name="vitalAlertSpo2LowThreshold"
                      value={settings.vitalAlertSpo2LowThreshold}
                      onChange={handleSettingChange}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" onClick={handleSave} disabled={saving}>
                    {saving ? <CircularProgress size={20} /> : 'Save Clinical Workflow Settings'}
                  </Button>
                </Box>
              </>
            ) : (
              <Alert severity="warning">System settings payload is not available.</Alert>
            )}
          </Paper>
        )}

        {activeTab === 4 && (
          <Paper sx={{ p: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Not fully implemented in this project yet.
            </Alert>
            <Typography variant="h6" gutterBottom>Lab & Pharmacy Settings</Typography>
            <Typography variant="body2" color="text.secondary">
              The proposal defines these, but admin configuration endpoints are not yet available:
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>- Lab analytics/reporting configuration</Typography>
            <Typography variant="body2">- Critical lab value escalation matrix settings</Typography>
            <Typography variant="body2">- Pharmacy inventory reorder policy settings</Typography>
            <Typography variant="body2">- Medication administration compliance rules</Typography>
          </Paper>
        )}
      </Paper>

      <CreateRoleForm
        open={openCreateRoleDialog}
        onClose={() => setOpenCreateRoleDialog(false)}
        onRoleCreated={fetchRoles}
      />

      <DeleteRoleModal
        open={openDeleteRoleModal}
        onClose={() => setOpenDeleteRoleModal(false)}
        onConfirm={handleConfirmDeleteRole}
        roleName={roleToDeleteName}
      />
    </Container>
  );
}

export default withAuth(SystemSettingsPage, ['Admin']);
