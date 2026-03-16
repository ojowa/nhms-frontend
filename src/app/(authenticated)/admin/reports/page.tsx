'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import withAuth from '@/components/auth/withAuth';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Security,
  MonitorHeart,
  Science,
  LocalHospital,
  Medication,
  AssignmentTurnedIn,
  People,
  History,
  Apartment,
} from '@mui/icons-material';
import { getAllUsers, getUsersCountByRoles } from '@/services/userAdminService';
import { getAuditLogs } from '@/services/auditLogService';
import { getDepartments } from '@/services/departmentService';

type DomainStatus = 'Implemented' | 'In Progress' | 'Planned';

interface ReportingDomain {
  title: string;
  description: string;
  references: string;
  status: DomainStatus;
  maturity: number;
}

interface SnapshotMetrics {
  users: number;
  audits: number;
  departments: number;
  doctors: number;
  nurses: number;
}

const reportingDomains: ReportingDomain[] = [
  {
    title: 'Access, Security & Governance',
    description:
      'Track RBAC/RLS enforcement, audit-log activity, and emergency access events for NIS compliance posture.',
    references: 'GEMINI + RLS design + Break-the-Glass plan',
    status: 'In Progress',
    maturity: 70,
  },
  {
    title: 'Clinical Operations',
    description:
      'Monitor appointments, consultation flow states, and vitals trend readiness to improve care delivery.',
    references: 'Physical consultation workflow + vitals trending plan',
    status: 'In Progress',
    maturity: 65,
  },
  {
    title: 'Lab Quality & Turnaround',
    description:
      'Measure lab test throughput, turnaround, critical value acknowledgements, and result status distribution.',
    references: 'Lab workflow + lab critical value alerts plan',
    status: 'In Progress',
    maturity: 68,
  },
  {
    title: 'Inpatient & Bed Capacity',
    description:
      'Track bed occupancy lifecycle (Available/Occupied/Cleaning/Maintenance) and discharge pathway quality.',
    references: 'Inpatient bed management plan + implementation report',
    status: 'Implemented',
    maturity: 85,
  },
  {
    title: 'Pharmacy & Medication Safety',
    description:
      'Monitor formulary availability, low-stock risk, and medication administration completion coverage.',
    references: 'Pharmacy inventory + medication administration plans',
    status: 'Planned',
    maturity: 35,
  },
  {
    title: 'ICD-10 & Epidemiology',
    description:
      'Measure coded-diagnosis adoption and build disease trend reporting for policy and planning.',
    references: 'ICD-10 standardization plan',
    status: 'Planned',
    maturity: 40,
  },
];

const statusColor: Record<DomainStatus, 'success' | 'warning' | 'default'> = {
  Implemented: 'success',
  'In Progress': 'warning',
  Planned: 'default',
};

function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<SnapshotMetrics>({
    users: 0,
    audits: 0,
    departments: 0,
    doctors: 0,
    nurses: 0,
  });

  useEffect(() => {
    const loadSnapshot = async () => {
      try {
        setLoading(true);
        setError(null);

        const [usersRes, auditsRes, deptsRes, roleCountsRes] = await Promise.all([
          getAllUsers(1, 1),
          getAuditLogs(1, 1),
          getDepartments(1, 1),
          getUsersCountByRoles(['Doctor', 'Nurse']),
        ]);

        setMetrics({
          users: usersRes.total || 0,
          audits: auditsRes.total || 0,
          departments: deptsRes.total || 0,
          doctors: roleCountsRes.Doctor || 0,
          nurses: roleCountsRes.Nurse || 0,
        });
      } catch (err: any) {
        setError(err?.message || 'Failed to load report snapshot.');
      } finally {
        setLoading(false);
      }
    };

    loadSnapshot();
  }, []);

  const overallMaturity = useMemo(() => {
    if (reportingDomains.length === 0) return 0;
    const total = reportingDomains.reduce((sum, domain) => sum + domain.maturity, 0);
    return Math.round(total / reportingDomains.length);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f4f6f8', minHeight: '100%' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#1a237e', fontWeight: 700 }}>
            Admin Reports & Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Proposal-aligned reporting hub for NHMS governance, clinical operations, and service quality.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" component={Link} href="/admin/audit-logs">
            View Audit Logs
          </Button>
          <Button variant="contained" component={Link} href="/admin/user-management">
            Manage Users
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" color="text.secondary">Total Users</Typography>
                <People color="primary" />
              </Stack>
              <Typography variant="h4" sx={{ mt: 1 }}>{metrics.users}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" color="text.secondary">Audit Events</Typography>
                <History color="primary" />
              </Stack>
              <Typography variant="h4" sx={{ mt: 1 }}>{metrics.audits}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" color="text.secondary">Departments</Typography>
                <Apartment color="primary" />
              </Stack>
              <Typography variant="h4" sx={{ mt: 1 }}>{metrics.departments}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Overall Reporting Maturity</Typography>
              <Typography variant="h4" sx={{ mt: 1, mb: 1 }}>{overallMaturity}%</Typography>
              <LinearProgress variant="determinate" value={overallMaturity} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {reportingDomains.map((domain) => (
          <Grid item xs={12} md={6} key={domain.title}>
            <Paper sx={{ p: 2.5, height: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6">{domain.title}</Typography>
                <Chip size="small" color={statusColor[domain.status]} label={domain.status} />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {domain.description}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Source Proposal: {domain.references}
              </Typography>
              <LinearProgress variant="determinate" value={domain.maturity} sx={{ height: 8, borderRadius: 4 }} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
                Maturity: {domain.maturity}%
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Proposal KPI Matrix
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>KPI Area</TableCell>
                    <TableCell>Current Signal</TableCell>
                    <TableCell>Target Direction</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Security & Compliance</TableCell>
                    <TableCell>RBAC + RLS active, audit trail enabled</TableCell>
                    <TableCell>Zero unauthorized access events</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Doctor Consultation Flow</TableCell>
                    <TableCell>Appointment-to-consultation states tracked</TableCell>
                    <TableCell>Reduce waiting and handoff delays</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Lab Quality</TableCell>
                    <TableCell>Critical alert and review workflow defined</TableCell>
                    <TableCell>Lower turnaround time and pending queue</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Inpatient Utilization</TableCell>
                    <TableCell>Bed assignment/discharge workflow implemented</TableCell>
                    <TableCell>Improve occupancy visibility and turnover</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Medication & Pharmacy</TableCell>
                    <TableCell>Inventory and dispensation model proposed</TableCell>
                    <TableCell>Prevent stock-outs and missed administration</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Clinical Coding</TableCell>
                    <TableCell>ICD-10 migration plan documented</TableCell>
                    <TableCell>Increase coded diagnosis completeness</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 2.5, mb: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Workforce Snapshot
            </Typography>
            <Stack spacing={1.2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Doctors</Typography>
                <Typography variant="body2" fontWeight={700}>{metrics.doctors}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Nurses</Typography>
                <Typography variant="body2" fontWeight={700}>{metrics.nurses}</Typography>
              </Stack>
              <Divider />
              <Typography variant="caption" color="text.secondary">
                Source: `/admin/users/count-by-roles`
              </Typography>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Report Navigation
            </Typography>
            <Stack spacing={1}>
              <Button component={Link} href="/admin/audit-logs" variant="outlined" startIcon={<Security />}>
                Audit & Security Logs
              </Button>
              <Button component={Link} href="/LabStaff/lab-reports" variant="outlined" startIcon={<Science />}>
                Lab Analytics
              </Button>
              <Button component={Link} href="/recordstaff/hospital-management" variant="outlined" startIcon={<LocalHospital />}>
                Inpatient Operations
              </Button>
              <Button component={Link} href="/nurse/medication-administration" variant="outlined" startIcon={<Medication />}>
                Medication Administration
              </Button>
              <Button component={Link} href="/doctor/consultations" variant="outlined" startIcon={<MonitorHeart />}>
                Consultation Monitoring
              </Button>
              <Button component={Link} href="/admin/system-settings" variant="outlined" startIcon={<AssignmentTurnedIn />}>
                Governance Settings
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default withAuth(AdminReportsPage, ['Admin']);

