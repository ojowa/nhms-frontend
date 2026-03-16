'use client';

import * as React from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import withAuth from '@/components/auth/withAuth';
import { UserRole } from '@/types/auth';
import { AccessTime, EventAvailable } from '@mui/icons-material';
import BookingForm from '@/components/appointments/BookingForm';
import MyAppointments from '@/components/appointments/MyAppointment';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function AppointmentsPage() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Appointments
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="appointment tabs">
          <Tab label="Book Appointment" icon={<EventAvailable />} iconPosition="start" {...a11yProps(0)} />
          <Tab label="My Appointments" icon={<AccessTime />} iconPosition="start" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <BookingForm />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <MyAppointments />
      </CustomTabPanel>
    </Box>
  );
}

export default withAuth(AppointmentsPage, [UserRole.Patient, UserRole.Officer, UserRole.FamilyMember]);
