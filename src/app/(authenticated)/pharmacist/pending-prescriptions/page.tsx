'use client';

import { useEffect, useMemo, useState } from 'react';
import withAuth from '@/components/auth/withAuth';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  dispenseMedication,
  getInventory,
  getInventoryByDrug,
  getPendingPrescriptions,
} from '@/services/pharmacyService';
import { InventoryItem, PendingPrescription } from '@/types/pharmacy';
import { useSnackbar } from '@/contexts/SnackbarContext';

function PendingPrescriptionsPage() {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<PendingPrescription[]>([]);
  const [selected, setSelected] = useState<PendingPrescription | null>(null);
  const [inventoryOptions, setInventoryOptions] = useState<InventoryItem[]>([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState<number | ''>('');
  const [quantityDispensed, setQuantityDispensed] = useState<number | ''>('');
  const [dispensing, setDispensing] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);

  const loadPending = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPendingPrescriptions();
      setItems(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load pending prescriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const openDispenseDialog = async (prescription: PendingPrescription) => {
    setSelected(prescription);
    setSelectedInventoryId('');
    setQuantityDispensed('');
    setInventoryOptions([]);

    try {
      setLoadingInventory(true);
      const options = prescription.drugId
        ? await getInventoryByDrug(Number(prescription.drugId))
        : await getInventory();
      const inStockOnly = options.filter((item) => item.quantityOnHand > 0);
      setInventoryOptions(inStockOnly);
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || 'Failed to load inventory batches.', 'error');
    } finally {
      setLoadingInventory(false);
    }
  };

  const selectedInventory = useMemo(
    () => inventoryOptions.find((item) => item.inventoryId === selectedInventoryId) || null,
    [inventoryOptions, selectedInventoryId]
  );

  const handleDispense = async () => {
    if (!selected) return;
    if (!selectedInventoryId) {
      showSnackbar('Select an inventory batch first.', 'error');
      return;
    }
    if (!quantityDispensed || Number(quantityDispensed) <= 0) {
      showSnackbar('Quantity dispensed must be greater than zero.', 'error');
      return;
    }

    try {
      setDispensing(true);
      await dispenseMedication({
        prescriptionId: selected.prescriptionId,
        inventoryId: Number(selectedInventoryId),
        quantityDispensed: Number(quantityDispensed),
      });
      showSnackbar('Medication dispensed successfully.', 'success');
      setSelected(null);
      await loadPending();
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || 'Failed to dispense medication.', 'error');
    } finally {
      setDispensing(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">Pending Prescriptions</Typography>
        <Button variant="outlined" onClick={loadPending} disabled={loading}>
          Refresh
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Typography variant="body2">Loading pending prescriptions...</Typography>
        ) : items.length === 0 ? (
          <Typography variant="body2">No pending prescriptions.</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Prescription ID</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Medication</TableCell>
                <TableCell>Dosage</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.prescriptionId}>
                  <TableCell>{item.prescriptionId}</TableCell>
                  <TableCell>{item.patientFirstName} {item.patientLastName}</TableCell>
                  <TableCell>{item.medicationName}</TableCell>
                  <TableCell>{item.dosage || 'N/A'}</TableCell>
                  <TableCell>{item.frequency || 'N/A'}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => openDispenseDialog(item)}
                    >
                      Dispense
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        <DialogTitle>Dispense Medication</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Prescription: {selected?.prescriptionId} | {selected?.medicationName}
            </Typography>

            <FormControl fullWidth disabled={loadingInventory}>
              <InputLabel>Inventory Batch</InputLabel>
              <Select
                value={selectedInventoryId}
                label="Inventory Batch"
                onChange={(e) => setSelectedInventoryId(Number(e.target.value))}
              >
                {inventoryOptions.map((option) => (
                  <MenuItem key={option.inventoryId} value={option.inventoryId}>
                    {option.batchNumber} - {option.drugName} (Stock: {option.quantityOnHand})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Quantity Dispensed"
              type="number"
              value={quantityDispensed}
              onChange={(e) => setQuantityDispensed(Number(e.target.value))}
              inputProps={{ min: 1, max: selectedInventory?.quantityOnHand || undefined }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Cancel</Button>
          <Button onClick={handleDispense} variant="contained" disabled={dispensing}>
            {dispensing ? 'Dispensing...' : 'Confirm Dispense'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default withAuth(PendingPrescriptionsPage, ['Pharmacist', 'Admin']);
