"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Snackbar,
  Autocomplete,
  TextField,
} from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { useAuth } from '@/contexts/AuthContext';
import { Appointment as AppointmentType } from '@/types/appointment';
import { getUnassignedAppointmentsForRecordStaff, assignDoctorToAppointment } from '@/services/appointmentService';
import { searchDoctors } from '@/services/userService';
import { Doctor } from '@/types/user';
import { debounce } from 'lodash';

interface MinimalDoctor {
  user_id: number;
  fullName?: string;
}

const AlertSnackbar = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const RecordStaffUnassignedAppointmentList = () => {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<{ [key: string]: MinimalDoctor | null }>({}); // Map appointmentId to MinimalDoctor object
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [doctorSearchResults, setDoctorSearchResults] = useState<Doctor[]>([]);
  const [doctorSearchLoading, setDoctorSearchLoading] = useState<boolean>(false);
  const { user } = useAuth();

  const fetchAppointments = async () => {
    if (!user) {
      setError('User not found.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedAppointments = await getUnassignedAppointmentsForRecordStaff();
      setAppointments(fetchedAppointments);
      // Initialize selectedDoctor for appointments that already have a doctor
      const initialSelectedDoctors: { [key: string]: MinimalDoctor | null } = {};
      fetchedAppointments.forEach(app => {
        if (app.assignedDoctorId && (app.assignedDoctorFirstName || app.assignedDoctorLastName)) {
          initialSelectedDoctors[app.id] = {
            user_id: app.assignedDoctorId,
            fullName: `${app.assignedDoctorFirstName || ''} ${app.assignedDoctorLastName || ''}`.trim(),
          };
        }
      });
      setSelectedDoctor(initialSelectedDoctors);
    } catch (err) {
      setError('Failed to fetch unassigned appointments.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const debouncedSearchDoctors = useCallback(
    debounce(async (searchTerm: string) => {
      if (!searchTerm) {
        setDoctorSearchResults([]);
        return;
      }
      setDoctorSearchLoading(true);
      try {
        const results = await searchDoctors(searchTerm);
        setDoctorSearchResults(results);
      } catch (err) {
        console.error('Error searching doctors:', err);
        setDoctorSearchResults([]);
      } finally {
        setDoctorSearchLoading(false);
      }
    }, 500),
    []
  );

  const handleDoctorChange = (appointmentId: string, doctor: MinimalDoctor | null) => {
    setSelectedDoctor((prev) => ({
      ...prev,
      [appointmentId]: doctor,
    }));
  };

  const handleAssignDoctor = async (appointmentId: string) => {
    const doctor = selectedDoctor[appointmentId];
    if (!doctor || !doctor.user_id) { // Check for user_id
      setSnackbarMessage('Please select a doctor.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      await assignDoctorToAppointment(Number(appointmentId), { doctorId: Number(doctor.user_id) });
      setSnackbarMessage('Doctor assigned successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchAppointments(); // Refresh the list
    } catch (err) {
      setSnackbarMessage('Failed to assign doctor.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.error(err);
    }
  };

  const columns: GridColDef<any>[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: 'patientName',
      headerName: 'Patient Name',
      flex: 1.5,
      valueGetter: (_value, row) => `${row.patientFirstName} ${row.patientLastName}`,
    },
    { field: 'serviceType', headerName: 'Appointment Type', flex: 1.5 },
    {
      field: 'department',
      headerName: 'Department',
      flex: 1.5,
      valueGetter: (_value, row) => row.department || 'N/A',
    },
    {
      field: 'appointmentDateTime',
      headerName: 'Date & Time',
      flex: 2,
      valueGetter: (_value, row) => (row.dateTime ? new Date(row.dateTime).toLocaleString() : 'N/A'),
    },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'actions',
      headerName: 'Assign Doctor',
      flex: 3,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <Autocomplete<MinimalDoctor>
            options={doctorSearchResults}
            getOptionLabel={(option) => option.fullName || ''}
            isOptionEqualToValue={(option, value) => option.user_id === value.user_id}
            loading={doctorSearchLoading}
            value={selectedDoctor[params.row.id] || null}
            onChange={(event, newValue) => handleDoctorChange(params.row.id, newValue as MinimalDoctor | null)}
            onInputChange={(event, newInputValue) => {
              debouncedSearchDoctors(newInputValue);
            }}
            sx={{ flexGrow: 1, minWidth: 200 }}
            renderInput={(parameters) => (
              <TextField
                {...parameters}
                label="Search Doctor"
                variant="outlined"
                size="small"
                InputProps={{
                  ...parameters.InputProps,
                  endAdornment: (
                    <>
                      {doctorSearchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {parameters.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleAssignDoctor(params.row.id)}
            disabled={!selectedDoctor[params.row.id]}
            sx={{ flexShrink: 0 }}
          >
            Assign
          </Button>
        </Box>
      ),
    },
  ];

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Unassigned Appointments
      </Typography>
      <DataGrid
        rows={appointments}
        columns={columns}
        getRowId={(row) => row.id}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
      />
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <AlertSnackbar onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </AlertSnackbar>
      </Snackbar>
    </Box>
  );
};

export default RecordStaffUnassignedAppointmentList;
