"use client";

import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { Appointment as AppointmentType } from '@/types/appointment';
import { getAllAppointmentsForRecordStaff } from '@/services/appointmentService';
import { Doctor } from '@/types/user';

const RecordStaffAppointmentList = () => {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
      const fetchedAppointments = await getAllAppointmentsForRecordStaff();
      setAppointments(fetchedAppointments.data);
    } catch (err) {
      setError('Failed to fetch appointments.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

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
      field: 'doctorName',
      headerName: 'Doctor',
      flex: 1.5,
      valueGetter: (_value, row) => row.doctor?.fullName || 'N/A', // Use doctor.fullName
    },
    {
      field: 'department',
      headerName: 'Department',
      flex: 1.5,
      valueGetter: (_value, row) => row.department?.name || 'N/A', // Use department.name
    },
    {
      field: 'appointmentDateTime',
      headerName: 'Date & Time',
      flex: 2,
      valueGetter: (_value, row) => (row.appointmentDateTime ? new Date(row.appointmentDateTime).toLocaleString() : 'N/A'),
    },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'assignmentStatus',
      headerName: 'Assignment Status',
      flex: 1.5,
      valueGetter: (_value, row) => row.doctor ? 'Assigned' : 'Unassigned',
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
        All Appointments
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

    </Box>
  );
};

export default RecordStaffAppointmentList;
