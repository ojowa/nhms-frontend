"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { getAppointmentsByStatuses } from "@/services/appointmentService";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import withAuth from "@/components/auth/withAuth";
import { Appointment } from "@/types/appointment";
import { ArrowForwardIos as ArrowForwardIosIcon } from "@mui/icons-material";
import {
  MonitorHeart as MonitorHeartIcon,
  Checklist as ChecklistIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

function NurseVitalsPage() {
  const [pendingVitalsAppointments, setPendingVitalsAppointments] = useState<Appointment[]>([]);
  const [vitalsTakenActiveAppointments, setVitalsTakenActiveAppointments] = useState<Appointment[]>([]);
  const [loadingVitals, setLoadingVitals] = useState(true);
  const [errorVitals, setErrorVitals] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const { loading: authLoading, user } = useAuth();

  const sortBySoonest = useCallback((appointments: Appointment[]) => {
    return [...appointments].sort((a, b) => {
      const aTime = a.dateTime ? new Date(a.dateTime).getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.dateTime ? new Date(b.dateTime).getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });
  }, []);

  const fetchVitalsQueues = useCallback(async () => {
    setLoadingVitals(true);
    setErrorVitals(null);
    try {
      const [awaitingVitals, vitalsTakenActive] = await Promise.all([
        getAppointmentsByStatuses(["SCHEDULED", "ASSIGNED"]),
        getAppointmentsByStatuses(["ASSIGNED", "IN_CONSULTATION"]),
      ]);
      setPendingVitalsAppointments(
        sortBySoonest(
          awaitingVitals.filter(
            (appt) => (appt.vitalStatus ?? 'NOT_RECORDED') === 'NOT_RECORDED'
          )
        )
      );
      setVitalsTakenActiveAppointments(
        sortBySoonest(
          vitalsTakenActive.filter(
            (appt) => appt.vitalStatus === 'RECORDED' || appt.status === 'IN_CONSULTATION'
          )
        )
      );
    } catch (err: any) {
      console.error("Error fetching nurse vitals queues:", err);
      setErrorVitals(
        err.response?.data?.message || "Failed to fetch nurse appointment vitals queues."
      );
    } finally {
      setLoadingVitals(false);
    }
  }, [sortBySoonest]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchVitalsQueues();
    }
  }, [fetchVitalsQueues, authLoading, user]);

  const appointmentsForActiveTab =
    activeTab === 0 ? pendingVitalsAppointments : vitalsTakenActiveAppointments;

  if (authLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Nurse Vitals
      </Typography>

      {errorVitals && <Alert severity="error">{errorVitals}</Alert>}

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 1, minHeight: 250 }}>
            <Typography variant="subtitle1" sx={{ px: 1, py: 1, fontWeight: 600 }}>
              Vitals Tasks
            </Typography>
            <List>
              <ListItem disablePadding>
                <ListItemButton selected={activeTab === 0} onClick={() => setActiveTab(0)}>
                  <ListItemIcon>
                    <MonitorHeartIcon />
                  </ListItemIcon>
                  <ListItemText primary={`Awaiting Vitals (${pendingVitalsAppointments.length})`} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton selected={activeTab === 1} onClick={() => setActiveTab(1)}>
                  <ListItemIcon>
                    <ChecklistIcon />
                  </ListItemIcon>
                  <ListItemText primary={`Vitals Taken - Active (${vitalsTakenActiveAppointments.length})`} />
                </ListItemButton>
              </ListItem>
            </List>
            <Divider sx={{ my: 1 }} />
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchVitalsQueues}
              sx={{ mb: 1 }}
            >
              Refresh Queues
            </Button>
            <Button fullWidth component={Link} href="/nurse/vitals-input" variant="contained">
              Open Vitals Input
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper elevation={3} sx={{ p: 2, display: "flex", flexDirection: "column", minHeight: 250 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Nurse Vitals Queues
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              {activeTab === 0
                ? "Appointments waiting for nurse vitals capture, ordered by soonest schedule."
                : "Appointments with vitals captured and still in active workflow."}
            </Typography>
            {loadingVitals ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                <CircularProgress />
              </Box>
            ) : appointmentsForActiveTab.length === 0 ? (
              <Typography
                variant="body1"
                sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}
              >
                {activeTab === 0
                  ? "No appointments currently awaiting vitals."
                  : "No active appointments with vitals taken."}
              </Typography>
            ) : (
              <List sx={{ flexGrow: 1 }}>
                {appointmentsForActiveTab.map((appointment) => (
                  <ListItem
                    key={appointment.id}
                    divider
                    secondaryAction={
                      <Link href={`/nurse/vitals/${appointment.id}`} passHref>
                        <IconButton edge="end" aria-label="open appointment">
                          <ArrowForwardIosIcon />
                        </IconButton>
                      </Link>
                    }
                  >
                    <ListItemText
                      primary={`Patient: ${appointment.patientFirstName} ${appointment.patientLastName}`}
                      secondary={`Time: ${appointment.dateTime ? new Date(appointment.dateTime).toLocaleString() : "N/A"} | Status: ${appointment.status} | Reason: ${appointment.reason}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
            {appointmentsForActiveTab.length > 0 && (
              <Button
                component={Link}
                href={`/nurse/vitals/${appointmentsForActiveTab[0].id}`}
                variant="contained"
                sx={{ mt: 2 }}
              >
                {activeTab === 0 ? "Enter Vitals" : "Open Appointment"}
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default withAuth(NurseVitalsPage, ["Nurse"]);
