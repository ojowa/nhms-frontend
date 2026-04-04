"use client";
import { UserRole } from '@/types/auth';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { Consultation } from '@/types/consultation';
import withAuth from '@/components/auth/withAuth';
import VideocamIcon from '@mui/icons-material/Videocam';
import EventIcon from '@mui/icons-material/Event';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ConsultationDetailsModal from '@/components/modals/ConsultationDetailsModal';
import ConfirmationDialog from '@/components/modals/ConfirmationDialog';
import { getConsultations, cancelConsultation } from '@/services/consultationService';
import { useAuth } from '@/contexts/AuthContext';

const ConsultationsPage = () => {
  const { user } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  const fetchConsultations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getConsultations();
      setConsultations(data);
    } catch (err) {
      setError('Failed to fetch consultations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConsultations(); }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleOpenConfirmDialog = (id: string) => {
    const consultation = consultations.find(c => c.id === String(id));
    if (consultation) {
      setSelectedConsultation(consultation);
      setConfirmDialogOpen(true);
    }
  };

  const handleCloseConfirmDialog = () => {
    setSelectedConsultation(null);
    setConfirmDialogOpen(false);
  };

  const handleCancelConsultation = async () => {
    if (selectedConsultation) {
      try {
        await cancelConsultation(selectedConsultation.id);
        setSnackbar({ open: true, message: 'Consultation cancelled successfully!' });
        fetchConsultations();
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to cancel consultation.' });
      } finally {
        handleCloseConfirmDialog();
      }
    }
  };

  const handleOpenDetailsModal = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setSelectedConsultation(null);
    setDetailsModalOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const normalizeStatus = (status: string) => status.trim().toLowerCase().replace(/[_\s]+/g, ' ');
  const now = Date.now();

  const upcomingConsultations = useMemo(() => (
    consultations.filter((c) => {
      const status = normalizeStatus(c.status);
      const isCancelledOrDone = status === 'completed' || status === 'cancelled';
      if (isCancelledOrDone) return false;
      const startsAt = new Date(c.startTime).getTime();
      return Number.isFinite(startsAt) ? startsAt >= now : true;
    })
  ), [consultations]);

  const historyConsultations = useMemo(() => (
    consultations.filter((c) => {
      const status = normalizeStatus(c.status);
      const startsAt = new Date(c.startTime).getTime();
      return status === 'completed' || status === 'cancelled' || (Number.isFinite(startsAt) && startsAt < now);
    })
  ), [consultations]);

  const completedCount = consultations.filter((c) => normalizeStatus(c.status) === 'completed').length;
  const cancelledCount = consultations.filter((c) => normalizeStatus(c.status) === 'cancelled').length;

  const isOfficer = Boolean(user?.roles?.includes(UserRole.Officer) || user?.roles?.includes(UserRole.FamilyMember));
  const pageTitle = isOfficer ? 'Family Consultations' : 'My Consultations';
  const pageSubtitle = isOfficer
    ? 'Track upcoming and past consultations for family members under your care.'
    : 'Review your upcoming consultations and consultation history.';

  const statusChipColor = (status: string) => {
    const normalized = normalizeStatus(status);
    if (normalized === 'completed') return 'success';
    if (normalized === 'cancelled') return 'default';
    return 'warning';
  };

  const consultationTypeChipColor = (consultationType: string) => (
    consultationType === 'Telemedicine Consultation' ? 'info' : 'secondary'
  );

  const renderConsultationCard = (consultation: Consultation, includeHistoryAction: boolean) => {
    const startsAt = new Date(consultation.startTime);
    return (
      <Paper
        key={consultation.id}
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          borderColor: 'divider',
          background: 'linear-gradient(180deg, rgba(6,70,99,0.04) 0%, rgba(2,132,199,0.01) 100%)',
        }}
      >
        <Stack spacing={1.2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
            <Box>
              <Typography variant="h6">{consultation.doctorName || 'Assigned Doctor'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {Number.isFinite(startsAt.getTime()) ? startsAt.toLocaleString() : 'Date/Time unavailable'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip size="small" label={consultation.consultationType} color={consultationTypeChipColor(consultation.consultationType)} />
              <Chip size="small" label={consultation.status} color={statusChipColor(consultation.status)} />
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="flex-end">
            {consultation.consultationType === 'Telemedicine Consultation' && consultation.meetingUrl && (
              <Button variant="outlined" startIcon={<VideocamIcon />} href={consultation.meetingUrl} target="_blank">
                Join Session
              </Button>
            )}
            {includeHistoryAction ? (
              <Button variant="outlined" onClick={() => handleOpenDetailsModal(consultation)}>
                View Details
              </Button>
            ) : (
              <Button variant="outlined" color="error" onClick={() => handleOpenConfirmDialog(consultation.id)}>
                Cancel
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>
    );
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f0f9ff 0%, #ecfeff 45%, #f8fafc 100%)',
          border: '1px solid',
          borderColor: 'divider',
          mb: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>{pageTitle}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          {pageSubtitle}
        </Typography>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <EventIcon color="primary" />
            <Box>
              <Typography variant="body2" color="text.secondary">Upcoming</Typography>
              <Typography variant="h6">{upcomingConsultations.length}</Typography>
            </Box>
          </Stack>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CheckCircleOutlineIcon color="success" />
            <Box>
              <Typography variant="body2" color="text.secondary">Completed</Typography>
              <Typography variant="h6">{completedCount}</Typography>
            </Box>
          </Stack>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CancelOutlinedIcon color="disabled" />
            <Box>
              <Typography variant="body2" color="text.secondary">Cancelled</Typography>
              <Typography variant="h6">{cancelledCount}</Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Paper sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 2 }}>
          <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
            <Tab label="Upcoming" />
            <Tab label="History" />
          </Tabs>

          <Box sx={{ mt: 2 }}>
            {tabIndex === 0 && (
              upcomingConsultations.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                  <EventIcon color="disabled" />
                  <Typography sx={{ mt: 1 }}>No upcoming consultations.</Typography>
                </Paper>
              ) : (
                <Stack spacing={1.25}>
                  {upcomingConsultations.map((consultation) => renderConsultationCard(consultation, false))}
                </Stack>
              )
            )}

            {tabIndex === 1 && (
              historyConsultations.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                  <HistoryIcon color="disabled" />
                  <Typography sx={{ mt: 1 }}>No consultation history yet.</Typography>
                </Paper>
              ) : (
                <Stack spacing={1.25}>
                  {historyConsultations.map((consultation) => renderConsultationCard(consultation, true))}
                </Stack>
              )
            )}
          </Box>
        </Paper>
      )}

      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleCancelConsultation}
        title="Cancel Consultation"
        description="Are you sure you want to cancel this consultation?"
      />
      <ConsultationDetailsModal
        open={detailsModalOpen}
        onClose={handleCloseDetailsModal}
        consultation={selectedConsultation}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Box>
  );
};

export default withAuth(ConsultationsPage, ['Patient', UserRole.Officer, UserRole.FamilyMember]);
