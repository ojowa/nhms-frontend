"use client";

import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Typography, Button, Alert } from '@mui/material';
import { useAppointments } from '@/hooks/useApi';
import { AppointmentListSkeleton } from '@/components/ui/skeletons';
import { Appointment as AppointmentType } from '@/types/appointment';

const CombinedAppointmentsDataGrid = () => {
  const { data, isLoading, error } = useAppointments('SCHEDULED', {
    serviceType: 'Doctor Consultation',
  });

  const appointments = data?.data || [];

  if (isLoading) {
    return <AppointmentListSkeleton />;
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

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
