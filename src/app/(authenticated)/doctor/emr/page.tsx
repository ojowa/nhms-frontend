'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { searchMedicalRecords } from '@/services/emrService';
import { MedicalRecord } from '@/types/emr';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

type PatientRow = {
  patientId: number;
  visitCount: number;
  lastVisitMillis: number;
  lastVisitDate: string;
};

function DoctorEmrLandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  const [patientIdInput, setPatientIdInput] = useState('');
  const [diagnosisInput, setDiagnosisInput] = useState('');
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [myPatientsOnly, setMyPatientsOnly] = useState(false);

  const fetchRecords = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      setError(null);

      const parsedPatientId = patientIdInput.trim() ? Number(patientIdInput) : undefined;
      const patientId = Number.isFinite(parsedPatientId) ? parsedPatientId : undefined;

      const data = await searchMedicalRecords(
        patientId,
        myPatientsOnly ? user.userId : undefined,
        startDateInput || undefined,
        endDateInput || undefined,
        diagnosisInput.trim() || undefined,
        200,
        0
      );
      setRecords(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load EMR records.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  const patientRows = useMemo<PatientRow[]>(() => {
    const grouped = new Map<number, { count: number; lastVisit: number }>();

    records.forEach((record) => {
      const patientId = Number(record.patientId);
      if (!Number.isFinite(patientId)) return;

      const visitMillis = new Date(record.visitDate || record.createdAt).getTime();
      const prev = grouped.get(patientId);
      if (!prev) {
        grouped.set(patientId, { count: 1, lastVisit: visitMillis });
        return;
      }
      grouped.set(patientId, {
        count: prev.count + 1,
        lastVisit: Math.max(prev.lastVisit, visitMillis),
      });
    });

    return Array.from(grouped.entries())
      .map(([patientId, v]) => ({
        patientId,
        visitCount: v.count,
        lastVisitMillis: v.lastVisit,
        lastVisitDate: Number.isFinite(v.lastVisit) ? new Date(v.lastVisit).toLocaleString() : 'N/A',
      }))
      .sort((a, b) => b.lastVisitMillis - a.lastVisitMillis);
  }, [records]);

  const handleClearFilters = async () => {
    setPatientIdInput('');
    setDiagnosisInput('');
    setStartDateInput('');
    setEndDateInput('');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Doctor EMR Workspace
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Search and review your patients&apos; medical records, then open a patient EMR view for detailed results.
          </Typography>
        </Box>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} flexWrap="wrap">
            <TextField
              label="Patient ID"
              value={patientIdInput}
              onChange={(e) => setPatientIdInput(e.target.value)}
              size="small"
              sx={{ minWidth: 180 }}
            />
            <TextField
              label="Diagnosis Contains"
              value={diagnosisInput}
              onChange={(e) => setDiagnosisInput(e.target.value)}
              size="small"
              sx={{ minWidth: 240 }}
            />
            <TextField
              label="Start Date"
              type="date"
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDateInput}
              onChange={(e) => setEndDateInput(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={fetchRecords} disabled={loading}>
                Apply
              </Button>
              <Button
                variant="outlined"
                onClick={async () => {
                  await handleClearFilters();
                  await fetchRecords();
                }}
                disabled={loading}
              >
                Reset
              </Button>
            </Stack>
          </Stack>
          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Checkbox
                checked={myPatientsOnly}
                onChange={(e) => setMyPatientsOnly(e.target.checked)}
              />
            }
            label="My Patients Only"
          />
        </Paper>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="h6">Patients</Typography>
              <Chip label={`${patientRows.length} patient(s)`} color="primary" />
            </Stack>

            {patientRows.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No records found for the current filter.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Patient ID</TableCell>
                      <TableCell>Total Visits</TableCell>
                      <TableCell>Last Visit</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {patientRows.map((row) => (
                      <TableRow key={row.patientId} hover>
                        <TableCell>{row.patientId}</TableCell>
                        <TableCell>{row.visitCount}</TableCell>
                        <TableCell>{row.lastVisitDate}</TableCell>
                        <TableCell align="right">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => router.push(`/doctor/emr/${row.patientId}`)}
                          >
                            Open EMR
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        )}
      </Stack>
    </Box>
  );
}

export default withAuth(DoctorEmrLandingPage, ['Doctor']);
