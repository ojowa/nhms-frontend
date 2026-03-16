"use client";

import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { Appointment as AppointmentType } from '@/types/appointment';
import { getAssignedAppointmentsForRecordStaff } from '@/services/appointmentService';

const RecordStaffAssignedAppointmentList = () => {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalAppointments, setTotalAppointments] = useState(0);
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
      const response = await getAssignedAppointmentsForRecordStaff(page, pageSize);
      setAppointments(response.data);
      setTotalAppointments(response.total);
    } catch (err) {
      setError('Failed to fetch assigned appointments.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user, page, pageSize]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
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
      field: 'assignedDoctorName',
      headerName: 'Assigned Doctor',
      flex: 1.5,
      valueGetter: (_value, row) => `${row.assignedDoctorFirstName} ${row.assignedDoctorLastName}`,
    },
    {
      field: 'appointmentDateTime',
      headerName: 'Date & Time',
      flex: 2,
      valueGetter: (_value, row) => (row.dateTime ? new Date(row.dateTime).toLocaleString() : 'N/A'),
    },
    { field: 'status', headerName: 'Status', flex: 1 },
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
        Assigned Appointments
      </Typography>
      <DataGrid
        rows={appointments}
        columns={columns}
        getRowId={(row) => row.id}
        paginationMode="server"
        rowCount={totalAppointments}
        paginationModel={{ page: page - 1, pageSize: pageSize }}
        onPaginationModelChange={(model) => {
          setPage(model.page + 1);
          setPageSize(model.pageSize);
        }}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default RecordStaffAssignedAppointmentList;
