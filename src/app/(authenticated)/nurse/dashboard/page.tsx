"use client";

import React from "react";
import { Box, Typography, Paper, Button, Skeleton } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import Link from "next/link";
import withAuth from "@/components/auth/withAuth";
import { UserRole } from "@/types/auth";

function NurseDashboardPage() {
  // Simple static dashboard - no API calls needed
  // This is a navigation page only
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Nurse Dashboard
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
        Select an operational area to continue.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Vitals
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Open the vitals task queues and capture scheduled patient vitals.
            </Typography>
            <Button component={Link} href="/nurse/vitals" variant="contained">
              Open Vitals
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Bed Management
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Review beds, ward occupancy, and update bed assignment status.
            </Typography>
            <Button component={Link} href="/nurse/bed-management" variant="outlined">
              Open Bed Management
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Medication Administration
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              View medication schedules and administer ordered medications.
            </Typography>
            <Button component={Link} href="/nurse/medication-administration" variant="outlined">
              Open Medication
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default withAuth(NurseDashboardPage, [UserRole.Nurse]);
