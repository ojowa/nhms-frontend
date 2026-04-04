'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import withAuth from '@/components/auth/withAuth';
import Link from 'next/link';
import {
  getInventoryExpiryRisk,
  getInventoryLowStock,
  getInventoryReorderQueue,
  getPendingPrescriptions,
} from '@/services/pharmacyService';

function PharmacistDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [expiryRiskCount, setExpiryRiskCount] = useState(0);
  const [reorderCount, setReorderCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [pending, lowStock, expiryRisk, reorderQueue] = await Promise.all([
          getPendingPrescriptions(),
          getInventoryLowStock(),
          getInventoryExpiryRisk(90),
          getInventoryReorderQueue(),
        ]);
        setPendingCount(pending.length);
        setLowStockCount(lowStock.length);
        setExpiryRiskCount(expiryRisk.length);
        setReorderCount(reorderQueue.length);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Pharmacist Dashboard
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Manage prescription queue, dispensing, and inventory alerts.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper id="pending-prescriptions" sx={{ p: 2, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6">Pending Prescriptions</Typography>
              <Chip label={loading ? '...' : `${pendingCount}`} color="info" size="small" />
            </Stack>
            <Typography variant="body2" sx={{ mb: 2 }}>
              View prescriptions awaiting pharmacist action and prioritize by urgency.
            </Typography>
            <Button component={Link} href="/pharmacist/pending-prescriptions" variant="contained">
              Open Queue
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper id="dispense-medication" sx={{ p: 2, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6">Dispense Medication</Typography>
              <Chip label="Workflow" color="primary" size="small" />
            </Stack>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Select batch, verify quantity, and confirm dispensing for approved prescriptions.
            </Typography>
            <Button component={Link} href="/pharmacist/pending-prescriptions" variant="outlined">
              Open Dispense
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper id="inventory-alerts" sx={{ p: 2, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6">Inventory Alerts</Typography>
              <Chip label={loading ? '...' : `Low ${lowStockCount}`} color="warning" size="small" />
            </Stack>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Monitor low-stock medications and identify reorder priorities quickly.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip size="small" variant="outlined" label={`Expiry Risk: ${loading ? '...' : expiryRiskCount}`} />
              <Chip size="small" variant="outlined" label={`Reorder Queue: ${loading ? '...' : reorderCount}`} />
            </Stack>
            <Button component={Link} href="/pharmacist/inventory" variant="outlined">
              Open Inventory
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default withAuth(PharmacistDashboardPage, ['Pharmacist']);
