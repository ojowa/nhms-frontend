"use client";

import React, { useState } from 'react';
import RecordStaffAppointmentList from '@/components/appointments/RecordStaffAppointmentList';
import RecordStaffUnassignedAppointmentList from '@/components/appointments/RecordStaffUnassignedAppointmentList';
import RecordStaffAssignedAppointmentList from '@/components/appointments/RecordStaffAssignedAppointmentList'; // New import
import { Typography, Container, Box, Tabs, Tab, AppBar } from '@mui/material';

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

const RecordStaffAppointmentsPage = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Record Staff Appointments View
        </Typography>

        <AppBar position="static" color="default" sx={{ boxShadow: 'none' }}>
          <Tabs value={value} onChange={handleChange} aria-label="appointment tabs" indicatorColor="primary" textColor="primary" variant="fullWidth">
            <Tab label="All Appointments" {...a11yProps(0)} />
            <Tab label="Unassigned Appointments" {...a11yProps(1)} />
            <Tab label="Assigned Appointments" {...a11yProps(2)} /> {/* New Tab */}
          </Tabs>
        </AppBar>
        <CustomTabPanel value={value} index={0}>
          <RecordStaffAppointmentList />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <RecordStaffUnassignedAppointmentList />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}> {/* New TabPanel */}
          <RecordStaffAssignedAppointmentList />
        </CustomTabPanel>
      </Box>
    </Container>
  );
};

export default RecordStaffAppointmentsPage;