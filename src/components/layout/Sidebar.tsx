'use client';
import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import Link from 'next/link';
import {
        AdminPanelSettings,
        CalendarToday,
        Dashboard,
        FolderCopy,
        Group,
        Notifications,
        Person,
        Science,
        VideoChat,
        LocalHospital,
        LocalPharmacy,
        People,
        Login as LoginIcon,
        MonitorHeart,
      } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { Toolbar, Box, Typography } from '@mui/material';

const drawerWidth = 200;

export default function Sidebar() {
  const { user, loading } = useAuth();
  const { open, toggleSidebar } = useSidebar();
  const userRoles = user?.roles || [];

  const mainItems = React.useMemo(() => {
    const items = [];

    // Role-specific Dashboards
    if (userRoles.includes('Admin')) {
      items.push({ text: 'Dashboard', href: '/admin/dashboard', icon: <AdminPanelSettings /> });
    }
    if (userRoles.includes('Doctor')) {
      items.push({ text: 'Dashboard', href: '/doctor/dashboard', icon: <Dashboard /> });
    }
    if (userRoles.includes('Nurse')) {
      items.push({ text: 'Dashboard', href: '/nurse/dashboard', icon: <Dashboard /> });
    }
    if (userRoles.includes('Officer')) {
      items.push({ text: 'Dashboard', href: '/officer/dashboard', icon: <Dashboard /> });
    }
    if (userRoles.includes('Patient')) {
      items.push({ text: 'Dashboard', href: '/patient/dashboard', icon: <Dashboard /> });
    }
    if (userRoles.includes('LabStaff')) {
      items.push({ text: 'Dashboard', href: '/LabStaff/dashboard', icon: <Dashboard /> });
    }
    if (userRoles.includes('RecordStaff')) {
      items.push({ text: 'Dashboard', href: '/recordstaff/dashboard', icon: <Dashboard /> });
    }
    if (userRoles.includes('Pharmacist')) {
      items.push({ text: 'Dashboard', href: '/pharmacist/dashboard', icon: <LocalPharmacy /> });
    }

    // Common items for Patient/Officer/Family Patient roles
    const showPatientRelatedItems = userRoles.includes('Patient') || userRoles.includes('Officer') || (user?.patientType === 'Family');
    
    if (showPatientRelatedItems) {
      items.push({ text: 'Consultations', href: '/consultations', icon: <VideoChat /> });
      items.push({ text: 'EMR', href: '/emr', icon: <FolderCopy /> });
      items.push({ text: 'Appointments', href: '/appointments', icon: <CalendarToday /> });
    }
    // Family link should only be for Officers (primary account holders)
    if (userRoles.includes('Officer')) {
      items.push({ text: 'Family', href: '/family', icon: <Group /> });
    }

    // Admin-specific items
    if (userRoles.includes('Admin')) {
      items.push({ text: 'User Management', href: '/admin/user-management', icon: <People /> });
      items.push({ text: 'Logged In Users', href: '/admin/logged-in-users', icon: <LoginIcon /> });
      items.push({ text: 'Department Management', href: '/admin/departments', icon: <LocalHospital /> });
      items.push({ text: 'Hospital & Bed Management', href: '/recordstaff/hospital-management', icon: <LocalHospital /> });
      items.push({ text: 'System Settings', href: '/admin/system-settings', icon: <AdminPanelSettings /> });
      items.push({ text: 'Audit Logs', href: '/admin/audit-logs', icon: <InboxIcon /> });
      items.push({ text: 'Reports', href: '/admin/reports', icon: <InboxIcon /> });
      // Removed: items.push({ text: 'Department Roles', href: '/admin/department-roles', icon: <AdminPanelSettings /> });
      }

    // Default dashboard for any authenticated user if no specific role-based dashboard was added
    if (items.length === 0) {
      items.push({ text: 'Dashboard', href: '/', icon: <Dashboard /> });
    }

    return items;
  }, [userRoles, user]);

  const medicalStaffItems = React.useMemo(() => {
    const items = [];
    if (userRoles.includes('Doctor')) {
      items.push({ text: 'Consultations', href: '/doctor/consultations', icon: <VideoChat /> });
      items.push({ text: 'EMR', href: '/doctor/emr', icon: <FolderCopy /> });
      items.push({ text: 'Lab Approvals', href: '/doctor/lab-approvals', icon: <Science /> });
    }
    if (userRoles.includes('Nurse')) {
      items.push({ text: 'Vitals', href: '/nurse/vitals', icon: <MonitorHeart /> });
      items.push({ text: 'Bed Management', href: '/nurse/bed-management', icon: <LocalHospital /> });
      items.push({ text: 'Medication Administration', href: '/nurse/medication-administration', icon: <LocalHospital /> });
    }
    if (userRoles.includes('LabStaff')) {
      items.push(
        { text: 'Lab Requests', href: '/LabStaff/lab-requests', icon: <CalendarToday /> },
        { text: 'My Submitted Results', href: '/LabStaff/my-results', icon: <Science /> }, // Renamed from Lab Results View
        { text: 'Results for Review', href: '/LabStaff/results-review', icon: <InboxIcon /> }, // New item for approval workflow
        { text: 'Lab Reports', href: '/LabStaff/lab-reports', icon: <InboxIcon /> }, // New item for analytics and reports
      );
    }
    if (userRoles.includes('RecordStaff')) {
      items.push(
        { text: 'Appointments', href: '/recordstaff/appointments/view', icon: <CalendarToday /> }, // New general appointments link
        { text: 'Book Consultation', href: '/recordstaff/appointments/create', icon: <CalendarToday /> },
        { text: 'Unified Management', href: '/recordstaff/unified-management', icon: <Group /> }, // New Unified Management link
        { text: 'Medical Staff Management', href: '/recordstaff/medical-staff-management', icon: <Group /> },
        { text: 'Department Management', href: '/admin/departments', icon: <LocalHospital /> },
        { text: 'Hospital Management', href: '/recordstaff/hospital-management', icon: <LocalHospital /> },
      );
    }
    if (userRoles.includes('Pharmacist')) {
      items.push(
        { text: 'Pending Prescriptions', href: '/pharmacist/pending-prescriptions', icon: <InboxIcon /> },
        { text: 'Dispense Medication', href: '/pharmacist/pending-prescriptions', icon: <LocalPharmacy /> },
        { text: 'Inventory Alerts', href: '/pharmacist/inventory', icon: <Science /> },
      );
    }
    return items;
  }, [userRoles]);

  const secondaryItems = React.useMemo(() => {
    const items = [];
    if (userRoles.includes('RecordStaff') || userRoles.includes('Officer') || userRoles.includes('Patient') || userRoles.includes('Doctor')) {
      items.push({ text: 'Profile', href: '/profile', icon: <Person /> });
    }
    items.push({ text: 'Notifications', href: '/notifications', icon: <Notifications /> });
    return items;
  }, [userRoles]);

  if (loading || !user) {
    return null; // Or a loading spinner/skeleton
  }

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)', // Subtle right border
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      <Toolbar sx={{ minHeight: 64 }} />
      <List>
        {mainItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Link href={item.href} passHref>
              <ListItemButton>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
      <Divider />
      {medicalStaffItems.length > 0 && (
        <>
          <List subheader={<ListItemText primary="Medical Staff" sx={{ pl: 2 }} />}>
            {medicalStaffItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <Link href={item.href} passHref>
                  <ListItemButton>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </Link>
              </ListItem>
            ))}
          </List>
          <Divider />
        </>
      )}
      <List>
        {secondaryItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Link href={item.href} passHref>
              <ListItemButton>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
      {userRoles.includes('Admin') && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Logged In As
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {user.firstName} {user.lastName}
            </Typography>
          </Box>
        </>
      )}
    </Drawer>
  );
}
