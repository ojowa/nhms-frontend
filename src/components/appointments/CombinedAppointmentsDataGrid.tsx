"use client";

import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Typography, Button, Alert } from '@mui/material';
import { getAppointmentsByStatus } from '@/services/appointmentService'; // Import getAppointmentsByStatus
import { useAuth } from '@/contexts/AuthContext';
import { Appointment as AppointmentType } from '@/types/appointment';

const CombinedAppointmentsDataGrid = () => {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) {
        setError('User not found.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch only doctor consultations
        const data = await getAppointmentsByStatus('Scheduled', 'Doctor Consultation');
        // Ensure that the data structure is compatible with AppointmentType[]
        setAppointments(data);
      } catch (err) {
        setError('Failed to fetch doctor consultations.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const columns: GridColDef<AppointmentType>[] = [
    { field: 'serviceType', headerName: 'Appointment Type', flex: 1.5 },
    {
      field: 'doctorName',
      headerName: 'Doctor',
      flex: 1.5,
      valueGetter: (_value, row) => row.doctorName || 'N/A',
    },
    {
      field: 'department',
      headerName: 'Department',
      flex: 1.5,
      valueGetter: (_value, row) => row.department || 'N/A',
    },
    {
      field: 'dateTime',
      headerName: 'Date & Time',
      flex: 2,
      valueGetter: (_value, row) => (row.dateTime ? new Date(row.dateTime).toLocaleString() : 'N/A'),
    },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => {
            // Handle view details action
            console.log('Viewing details for:', params.row.id);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  if (loading) {
    return <Typography>Loading appointments...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        My Appointments
      </Typography>
      <DataGrid
        rows={appointments}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[10]}
        autoHeight
        getRowId={(row) => row.id}
      />
    </Box>
  );
};

export default CombinedAppointmentsDataGrid;
