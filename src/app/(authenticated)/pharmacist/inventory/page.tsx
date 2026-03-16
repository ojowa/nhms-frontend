'use client';

import { useEffect, useMemo, useState } from 'react';
import withAuth from '@/components/auth/withAuth';
import {
  Autocomplete,
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  addInventoryStock,
  getInventory,
  getInventoryAuditTrail,
  getInventoryExpiryRisk,
  getInventoryLowStock,
  getInventoryReorderQueue,
  searchFormulary,
} from '@/services/pharmacyService';
import { FormularyDrug, InventoryAuditEvent, InventoryItem } from '@/types/pharmacy';
import { useSnackbar } from '@/contexts/SnackbarContext';

function PharmacyInventoryPage() {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [lowStockIds, setLowStockIds] = useState<Set<number>>(new Set());
  const [expiryRiskItems, setExpiryRiskItems] = useState<InventoryItem[]>([]);
  const [reorderQueueItems, setReorderQueueItems] = useState<InventoryItem[]>([]);
  const [auditTrail, setAuditTrail] = useState<InventoryAuditEvent[]>([]);
  const [expiryWindowDays, setExpiryWindowDays] = useState<number>(90);
  const [activeTab, setActiveTab] = useState(0);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [addingStock, setAddingStock] = useState(false);
  const [formularyOptions, setFormularyOptions] = useState<FormularyDrug[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<FormularyDrug | null>(null);
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantityToAdd, setQuantityToAdd] = useState<number | ''>('');
  const [reorderLevel, setReorderLevel] = useState<number | ''>(10);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [inventoryData, lowStockData, expiryData, reorderData, auditData] = await Promise.all([
        getInventory(search.trim() ? search : undefined),
        getInventoryLowStock(),
        getInventoryExpiryRisk(expiryWindowDays),
        getInventoryReorderQueue(),
        getInventoryAuditTrail(250),
      ]);
      setItems(inventoryData);
      setLowStockIds(new Set(lowStockData.map((i) => i.inventoryId)));
      setExpiryRiskItems(expiryData);
      setReorderQueueItems(reorderData);
      setAuditTrail(auditData);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        const aCritical = lowStockIds.has(a.inventoryId) ? 1 : 0;
        const bCritical = lowStockIds.has(b.inventoryId) ? 1 : 0;
        if (aCritical !== bCritical) return bCritical - aCritical;
        return a.drugName.localeCompare(b.drugName);
      }),
    [items, lowStockIds]
  );

  const getExpiryStatus = (expiryDate?: string | null) => {
    if (!expiryDate) return { label: 'No Expiry', color: 'default' as const };
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'Expired', color: 'error' as const };
    if (diffDays <= 30) return { label: `${diffDays}d left`, color: 'error' as const };
    if (diffDays <= expiryWindowDays) return { label: `${diffDays}d left`, color: 'warning' as const };
    return { label: `${diffDays}d left`, color: 'success' as const };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">Inventory Operations</Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            label="Search Drug/Batch"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="outlined" onClick={loadData} disabled={loading}>
            Refresh
          </Button>
          <Button variant="contained" onClick={() => setOpenAddDialog(true)}>
            Add Stock
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={(_e, value) => setActiveTab(value)}>
          <Tab label="Inventory" />
          <Tab label="Expiry Risk" />
          <Tab label="Reorder Queue" />
          <Tab label="Audit Trail" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {loading && activeTab === 0 ? (
          <Typography variant="body2">Loading inventory...</Typography>
        ) : activeTab === 0 && sortedItems.length === 0 ? (
          <Typography variant="body2">No inventory records found.</Typography>
        ) : activeTab === 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Drug</TableCell>
                <TableCell>Batch</TableCell>
                <TableCell>Expiry</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Reorder Level</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedItems.map((item) => {
                const isLowStock = lowStockIds.has(item.inventoryId);
                return (
                  <TableRow key={item.inventoryId}>
                    <TableCell>{item.drugName}</TableCell>
                    <TableCell>{item.batchNumber}</TableCell>
                    <TableCell>
                      {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>{item.quantityOnHand}</TableCell>
                    <TableCell>{item.reorderLevel}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={isLowStock ? 'Low Stock' : 'OK'}
                        color={isLowStock ? 'warning' : 'success'}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : null}

        {loading && activeTab === 1 ? (
          <Typography variant="body2">Loading expiry-risk board...</Typography>
        ) : activeTab === 1 ? (
          <>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                label="Expiry Window (Days)"
                type="number"
                size="small"
                value={expiryWindowDays}
                onChange={(e) => setExpiryWindowDays(Number(e.target.value) || 90)}
                inputProps={{ min: 1, max: 3650 }}
              />
              <Button
                variant="outlined"
                onClick={async () => {
                  try {
                    const data = await getInventoryExpiryRisk(expiryWindowDays);
                    setExpiryRiskItems(data);
                  } catch (err: any) {
                    showSnackbar(err?.response?.data?.message || 'Failed to refresh expiry-risk board.', 'error');
                  }
                }}
              >
                Apply
              </Button>
            </Stack>
            {expiryRiskItems.length === 0 ? (
              <Typography variant="body2">No batches within the expiry-risk window.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Drug</TableCell>
                    <TableCell>Batch</TableCell>
                    <TableCell>Expiry</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Risk</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expiryRiskItems.map((item) => {
                    const status = getExpiryStatus(item.expiryDate);
                    return (
                      <TableRow key={item.inventoryId}>
                        <TableCell>{item.drugName}</TableCell>
                        <TableCell>{item.batchNumber}</TableCell>
                        <TableCell>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>{item.quantityOnHand}</TableCell>
                        <TableCell><Chip size="small" label={status.label} color={status.color} /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </>
        ) : null}

        {loading && activeTab === 2 ? (
          <Typography variant="body2">Loading reorder queue...</Typography>
        ) : activeTab === 2 ? (
          reorderQueueItems.length === 0 ? (
            <Typography variant="body2">No items currently in reorder queue.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Drug</TableCell>
                  <TableCell>Batch</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Reorder Level</TableCell>
                  <TableCell>Gap</TableCell>
                  <TableCell>Priority</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reorderQueueItems.map((item) => {
                  const gap = Math.max(item.reorderLevel - item.quantityOnHand, 0);
                  const priority = gap >= 20 ? 'High' : gap >= 10 ? 'Medium' : 'Low';
                  return (
                    <TableRow key={item.inventoryId}>
                      <TableCell>{item.drugName}</TableCell>
                      <TableCell>{item.batchNumber}</TableCell>
                      <TableCell>{item.quantityOnHand}</TableCell>
                      <TableCell>{item.reorderLevel}</TableCell>
                      <TableCell>{gap}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={priority}
                          color={priority === 'High' ? 'error' : priority === 'Medium' ? 'warning' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )
        ) : null}

        {loading && activeTab === 3 ? (
          <Typography variant="body2">Loading inventory audit trail...</Typography>
        ) : activeTab === 3 ? (
          auditTrail.length === 0 ? (
            <Typography variant="body2">No audit events recorded yet.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Drug / Batch</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Change</TableCell>
                  <TableCell>Before</TableCell>
                  <TableCell>After</TableCell>
                  <TableCell>Actor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditTrail.map((event) => (
                  <TableRow key={event.auditId}>
                    <TableCell>{new Date(event.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{event.drugName} / {event.batchNumber}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={event.eventType}
                        color={event.eventType === 'DISPENSE' ? 'info' : 'success'}
                      />
                    </TableCell>
                    <TableCell>{event.quantityChange}</TableCell>
                    <TableCell>{event.quantityBefore}</TableCell>
                    <TableCell>{event.quantityAfter}</TableCell>
                    <TableCell>{event.actorFirstName ? `${event.actorFirstName} ${event.actorLastName || ''}` : 'System'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        ) : null}
      </Paper>

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Inventory Stock</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={formularyOptions}
              getOptionLabel={(option) =>
                `${option.name}${option.strength ? ` (${option.strength})` : ''}`
              }
              value={selectedDrug}
              onInputChange={async (_e, value) => {
                if (value.length < 2) {
                  setFormularyOptions([]);
                  return;
                }
                try {
                  const data = await searchFormulary(value);
                  setFormularyOptions(data);
                } catch {
                  setFormularyOptions([]);
                }
              }}
              onChange={(_e, value) => setSelectedDrug(value)}
              renderInput={(params) => (
                <TextField {...params} label="Drug" placeholder="Search formulary" />
              )}
            />

            <TextField
              label="Batch Number"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
            />

            <TextField
              label="Expiry Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />

            <TextField
              label="Quantity To Add"
              type="number"
              value={quantityToAdd}
              onChange={(e) => setQuantityToAdd(Number(e.target.value))}
              inputProps={{ min: 1 }}
            />

            <TextField
              label="Reorder Level"
              type="number"
              value={reorderLevel}
              onChange={(e) => setReorderLevel(Number(e.target.value))}
              inputProps={{ min: 0 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={addingStock}
            onClick={async () => {
              if (!selectedDrug) {
                showSnackbar('Select a drug first.', 'error');
                return;
              }
              if (!batchNumber.trim()) {
                showSnackbar('Batch number is required.', 'error');
                return;
              }
              if (!quantityToAdd || Number(quantityToAdd) <= 0) {
                showSnackbar('Quantity must be greater than zero.', 'error');
                return;
              }
              if (reorderLevel === '' || Number(reorderLevel) < 0) {
                showSnackbar('Reorder level must be zero or greater.', 'error');
                return;
              }

              try {
                setAddingStock(true);
                await addInventoryStock({
                  drugId: selectedDrug.drugId,
                  batchNumber: batchNumber.trim(),
                  expiryDate: expiryDate || null,
                  quantityToAdd: Number(quantityToAdd),
                  reorderLevel: Number(reorderLevel),
                });
                showSnackbar('Inventory stock updated successfully.', 'success');
                setOpenAddDialog(false);
                setSelectedDrug(null);
                setBatchNumber('');
                setExpiryDate('');
                setQuantityToAdd('');
                setReorderLevel(10);
                await loadData();
              } catch (err: any) {
                showSnackbar(
                  err?.response?.data?.message || 'Failed to add inventory stock.',
                  'error'
                );
              } finally {
                setAddingStock(false);
              }
            }}
          >
            {addingStock ? 'Saving...' : 'Save Stock'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default withAuth(PharmacyInventoryPage, ['Pharmacist', 'Admin']);
