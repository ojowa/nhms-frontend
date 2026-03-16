'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import withAuth from '@/components/auth/withAuth';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { Admission } from '@/types/admission';
import { Appointment } from '@/types/appointment';
import { admissionService } from '@/services/admissionService';
import { InpatientCareTransition, InpatientClinicalNote, InpatientTimelineEvent } from '@/types/admission';
import { fetchAllDepartments } from '@/services/departmentService';
import { fetchDoctors } from '@/services/userService';
import { Department } from '@/types/department';
import { Doctor } from '@/types/user';
import { getAppointmentsByStatuses } from '@/services/appointmentService';
import {
  addPrescriptionToMedicalRecord,
  getMedicalRecordByAppointmentId,
  getPatientVitalsHistory,
  getPrescriptionsByPatientIdAndAdmissionId,
  PatientVitalsTrendPoint,
} from '@/services/emrService';
import { CreatePrescriptionPayload, Prescription } from '@/types/emr';
import { searchFormulary } from '@/services/pharmacyService';
import { FormularyDrug } from '@/types/pharmacy';
import VitalsTrendChart from '@/components/emr/VitalsTrendChart';
import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { getLabRequestsByPatientId } from '@/services/labRequestService';
import { LabRequest } from '@/types/labRequest';
import DiagnosticOrderForm, { DiagnosticOrderCategory } from '@/components/orders/DiagnosticOrderForm';
import ReferralWorkflowDialog, { ReferralWorkflowPayload } from '@/components/admissions/ReferralWorkflowDialog';

function DoctorInpatientWorkspacePage() {
  const params = useParams();
  const rawAdmissionParam = params.admissionId;
  const admissionId = Array.isArray(rawAdmissionParam)
    ? String(rawAdmissionParam[0] || '')
    : String(rawAdmissionParam || '');
  const normalizedAdmissionId = Number(admissionId);
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [admission, setAdmission] = useState<Admission | null>(null);
  const [consultation, setConsultation] = useState<Appointment | null>(null);
  const [vitalsHistory, setVitalsHistory] = useState<PatientVitalsTrendPoint[]>([]);
  const [isDiagnosticOrderFormOpen, setIsDiagnosticOrderFormOpen] = useState(false);
  const [defaultOrderCategory, setDefaultOrderCategory] = useState<DiagnosticOrderCategory>('Lab');
  const [dispositionNote, setDispositionNote] = useState('');
  const [progressNote, setProgressNote] = useState('');
  const [selectedDisposition, setSelectedDisposition] = useState('Under Observation');
  const [clinicalNotes, setClinicalNotes] = useState<InpatientClinicalNote[]>([]);
  const [careTransitions, setCareTransitions] = useState<InpatientCareTransition[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<InpatientTimelineEvent[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [targetDepartmentId, setTargetDepartmentId] = useState<number | ''>('');
  const [targetDoctorId, setTargetDoctorId] = useState<number | ''>('');
  const [referralDialogOpen, setReferralDialogOpen] = useState(false);

  const [formularyOptions, setFormularyOptions] = useState<FormularyDrug[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<FormularyDrug | null>(null);
  const [activePrescriptions, setActivePrescriptions] = useState<Prescription[]>([]);
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [medicationOverrideReason, setMedicationOverrideReason] = useState('');
  const [confirmHighRiskOverride, setConfirmHighRiskOverride] = useState(false);
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [savingProgressNote, setSavingProgressNote] = useState(false);
  const [savingDisposition, setSavingDisposition] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [exportingTimeline, setExportingTimeline] = useState(false);
  const [patientOrders, setPatientOrders] = useState<LabRequest[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersCategoryFilter, setOrdersCategoryFilter] = useState<'All' | DiagnosticOrderCategory>('All');

  const refreshTimeline = async (targetAdmissionId: string) => {
    try {
      setTimelineLoading(true);
      const timeline = await admissionService.getInpatientTimeline(targetAdmissionId);
      setTimelineEvents(timeline);
    } catch {
      setTimelineEvents([]);
    } finally {
      setTimelineLoading(false);
    }
  };

  const classifyOrderCategory = (testType: string): DiagnosticOrderCategory => {
    const normalized = String(testType || '').toLowerCase();
    if (normalized.startsWith('imaging -')) return 'Imaging';
    if (normalized.startsWith('other -')) return 'Other';
    if (
      normalized.includes('x-ray')
      || normalized.includes('mri')
      || normalized.includes('ct')
      || normalized.includes('ultrasound')
      || normalized.includes('echo')
    ) {
      return 'Imaging';
    }
    return 'Lab';
  };

  const refreshOrders = async (patientIdValue: number) => {
    try {
      setOrdersLoading(true);
      const response = await getLabRequestsByPatientId(patientIdValue, 1, 100);
      setPatientOrders(response?.data || []);
    } catch {
      setPatientOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    const loadContext = async () => {
      if (!Number.isInteger(normalizedAdmissionId) || normalizedAdmissionId <= 0) {
        setError('Admission ID is invalid.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const admissionData = await admissionService.getAdmissionById(String(normalizedAdmissionId));
        if (!admissionData) {
          setError('Admission not found.');
          return;
        }
        setAdmission(admissionData);
        const resolvedAdmissionId = Number((admissionData as any)?.admissionId || normalizedAdmissionId);

        const allConsultations = await getAppointmentsByStatuses([
          'SCHEDULED',
          'ASSIGNED',
          'IN_CONSULTATION',
          'COMPLETED',
        ]);
        const patientConsultations = allConsultations
          .filter((a) => Number(a.patientId) === Number(admissionData.patientId))
          .sort((a, b) => {
            const da = a.dateTime ? new Date(a.dateTime).getTime() : 0;
            const db = b.dateTime ? new Date(b.dateTime).getTime() : 0;
            return db - da;
          });
        setConsultation(patientConsultations[0] || null);

        if (admissionData.patientId) {
          try {
            const trends = await getPatientVitalsHistory(Number(admissionData.patientId), { limit: 20 });
            setVitalsHistory(trends);
          } catch (vitalsError) {
            console.error('Failed to load vitals history for inpatient workspace:', vitalsError);
            setVitalsHistory([]);
          }
          await refreshOrders(Number(admissionData.patientId));
          try {
            const prescriptions = await getPrescriptionsByPatientIdAndAdmissionId(
              Number(admissionData.patientId),
              resolvedAdmissionId
            );
            setActivePrescriptions(Array.isArray(prescriptions) ? prescriptions : []);
          } catch (prescriptionError) {
            console.error('Failed to load active prescriptions for inpatient workspace:', prescriptionError);
            setActivePrescriptions([]);
          }
        }
        const notes = await admissionService.getInpatientClinicalNotes(String(resolvedAdmissionId));
        setClinicalNotes(notes);
        const transitions = await admissionService.getInpatientCareTransitions(String(resolvedAdmissionId));
        setCareTransitions(transitions);
        await refreshTimeline(String(resolvedAdmissionId));

        const [departmentList, doctorList] = await Promise.all([
          fetchAllDepartments(),
          fetchDoctors(),
        ]);
        setDepartments(departmentList);
        setDoctors(doctorList);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load inpatient workspace.');
      } finally {
        setLoading(false);
      }
    };

    loadContext();
  }, [normalizedAdmissionId]);

  const latestVitals = useMemo(() => {
    if (!vitalsHistory.length) return null;
    return [...vitalsHistory].sort(
      (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    )[0];
  }, [vitalsHistory]);

  const normalizedActivePrescriptions = useMemo(() => {
    const now = new Date();
    return (activePrescriptions || []).filter((prescription: any) => {
      const end = prescription?.endDate ? new Date(prescription.endDate) : null;
      return !end || end >= now;
    });
  }, [activePrescriptions]);

  const medicationSafetyWarnings = useMemo(() => {
    const warnings: Array<{ severity: 'moderate' | 'high'; message: string }> = [];
    const candidate = medicationName.trim().toLowerCase();
    if (!candidate) return warnings;

    const activeMeds = normalizedActivePrescriptions.map((p: any) => String(
      p?.medicationName || p?.medication || ''
    ).toLowerCase());

    const duplicate = activeMeds.some((name) => name === candidate || name.includes(candidate) || candidate.includes(name));
    if (duplicate) {
      warnings.push({
        severity: 'high',
        message: 'Possible duplicate therapy detected with an existing active prescription.',
      });
    }

    const interactionPairs = [
      {
        pair: ['metformin', 'contrast'],
        severity: 'high' as const,
        message: 'Potential lactic acidosis risk around contrast studies. Review renal function and timing.',
      },
      {
        pair: ['losartan', 'ibuprofen'],
        severity: 'moderate' as const,
        message: 'Possible reduced antihypertensive effect and renal risk with NSAID co-therapy.',
      },
      {
        pair: ['amoxicillin', 'methotrexate'],
        severity: 'high' as const,
        message: 'May increase methotrexate toxicity. Consider alternatives or close monitoring.',
      },
    ];

    const candidateBag = `${candidate} ${selectedDrug?.genericName?.toLowerCase() || ''}`;
    interactionPairs.forEach((rule) => {
      const [a, b] = rule.pair;
      const candidateHasA = candidateBag.includes(a);
      const candidateHasB = candidateBag.includes(b);
      const activeHasA = activeMeds.some((m) => m.includes(a));
      const activeHasB = activeMeds.some((m) => m.includes(b));
      if ((candidateHasA && activeHasB) || (candidateHasB && activeHasA)) {
        warnings.push({ severity: rule.severity, message: rule.message });
      }
    });

    return warnings;
  }, [medicationName, normalizedActivePrescriptions, selectedDrug?.genericName]);

  const hasHighRiskMedicationWarning = useMemo(
    () => medicationSafetyWarnings.some((warning) => warning.severity === 'high'),
    [medicationSafetyWarnings]
  );

  const observationRisk = useMemo(() => {
    if (!latestVitals) {
      return {
        score: 0,
        level: 'Unknown' as 'Unknown' | 'Low' | 'Moderate' | 'High' | 'Critical',
        contributors: [] as string[],
      };
    }

    const contributors: string[] = [];
    let score = 0;

    const rr = Number(latestVitals.respirationRate || 0);
    if (rr <= 8 || rr >= 25) {
      score += 3;
      contributors.push('Respiratory rate is critically out of range.');
    } else if ((rr >= 21 && rr <= 24) || (rr >= 9 && rr <= 11)) {
      score += 1;
      contributors.push('Respiratory rate is mildly abnormal.');
    }

    const spo2 = Number(latestVitals.spo2 || 0);
    if (spo2 > 0) {
      if (spo2 <= 91) {
        score += 3;
        contributors.push('SpO2 indicates severe desaturation.');
      } else if (spo2 <= 93) {
        score += 2;
        contributors.push('SpO2 is below normal range.');
      } else if (spo2 <= 95) {
        score += 1;
      }
    }

    const temp = Number(latestVitals.temperature || 0);
    if (temp <= 35 || temp >= 39.1) {
      score += 3;
      contributors.push('Temperature is in a high-risk range.');
    } else if ((temp >= 35.1 && temp <= 36) || (temp >= 38.1 && temp <= 39)) {
      score += 1;
    }

    const sbp = Number(latestVitals.bloodPressureSystolic || 0);
    if (sbp <= 90 || sbp >= 220) {
      score += 3;
      contributors.push('Systolic blood pressure is critically abnormal.');
    } else if (sbp <= 100) {
      score += 2;
    } else if (sbp <= 110) {
      score += 1;
    }

    const hr = Number(latestVitals.pulseRate || 0);
    if (hr <= 40 || hr >= 131) {
      score += 3;
      contributors.push('Pulse rate is in a critical zone.');
    } else if ((hr >= 111 && hr <= 130) || (hr >= 41 && hr <= 50)) {
      score += 2;
    } else if (hr >= 91 && hr <= 110) {
      score += 1;
    }

    const recent = [...vitalsHistory]
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
      .slice(0, 3);
    if (recent.length === 3) {
      const spo2Drop = Number(recent[0].spo2 || 0) > 0 && Number(recent[2].spo2 || 0) > 0
        ? Number(recent[2].spo2) - Number(recent[0].spo2)
        : 0;
      const hrRise = Number(recent[0].pulseRate || 0) - Number(recent[2].pulseRate || 0);
      if (spo2Drop <= -3 || hrRise >= 20) {
        score += 1;
        contributors.push('Recent trend shows deterioration (SpO2 drop / pulse rise).');
      }
    }

    const level = score >= 9 ? 'Critical' : score >= 7 ? 'High' : score >= 5 ? 'Moderate' : 'Low';
    return { score, level, contributors };
  }, [latestVitals, vitalsHistory]);

  const filteredOrders = useMemo(() => {
    return patientOrders.filter((order) => {
      if (ordersCategoryFilter === 'All') return true;
      return classifyOrderCategory(order.test_type) === ordersCategoryFilter;
    });
  }, [patientOrders, ordersCategoryFilter]);

  const pendingOrders = useMemo(() => {
    return filteredOrders.filter((order) => (
      order.status === 'PENDING'
      || order.status === 'SAMPLE_COLLECTED'
      || order.status === 'PROCESSING'
    ));
  }, [filteredOrders]);

  const completedOrders = useMemo(() => {
    return filteredOrders.filter((order) => (
      order.status === 'COMPLETED' || order.status === 'CANCELLED'
    ));
  }, [filteredOrders]);

  const handleAddPrescription = async () => {
    if (!consultation?.id) {
      showSnackbar('No consultation context found for re-prescription.', 'error');
      return;
    }
    if (!medicationName.trim() || !dosage.trim() || !frequency.trim() || !startDate) {
      showSnackbar('Medication, dosage, frequency, and start date are required.', 'error');
      return;
    }
    if (hasHighRiskMedicationWarning) {
      if (!confirmHighRiskOverride) {
        showSnackbar('High-risk medication warning requires override confirmation.', 'error');
        return;
      }
      if (medicationOverrideReason.trim().length < 10) {
        showSnackbar('Provide an override reason of at least 10 characters for high-risk medications.', 'error');
        return;
      }
    }
    try {
      setSavingPrescription(true);
      const medicalRecord = await getMedicalRecordByAppointmentId(Number(consultation.id), user?.userId || 0);
      if (!medicalRecord?.recordId) {
        showSnackbar('Medical record not found for this consultation.', 'error');
        return;
      }

      const payload: CreatePrescriptionPayload = {
        medicalRecordId: String(medicalRecord.recordId),
        medication: medicationName.trim(),
        drugId: selectedDrug?.drugId,
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        instructions: instructions.trim() || undefined,
      };
      await addPrescriptionToMedicalRecord(payload);
      showSnackbar('Re-prescription added successfully.', 'success');
      setMedicationName('');
      setSelectedDrug(null);
      setDosage('');
      setFrequency('');
      setStartDate('');
      setEndDate('');
      setInstructions('');
      setMedicationOverrideReason('');
      setConfirmHighRiskOverride(false);
      if (admission?.patientId && admission?.admissionId) {
        try {
          const prescriptions = await getPrescriptionsByPatientIdAndAdmissionId(
            Number(admission.patientId),
            Number(admission.admissionId)
          );
          setActivePrescriptions(Array.isArray(prescriptions) ? prescriptions : []);
        } catch (prescriptionRefreshError) {
          console.error('Failed to refresh active prescriptions after save:', prescriptionRefreshError);
        }
      }
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || err?.message || 'Failed to add re-prescription.', 'error');
    } finally {
      setSavingPrescription(false);
    }
  };

  const handleSaveProgressNote = async () => {
    if (!progressNote.trim()) {
      showSnackbar('Progress note cannot be empty.', 'error');
      return;
    }

    try {
      setSavingProgressNote(true);
      const note = await admissionService.createInpatientClinicalNote(String(admissionId), {
        noteType: 'Progress',
        noteText: progressNote.trim(),
      });
      setClinicalNotes((prev) => [note, ...prev]);
      await refreshTimeline(String(admissionId));
      showSnackbar('Progress note saved.', 'success');
      setProgressNote('');
    } catch (err: any) {
      showSnackbar(err?.message || 'Failed to save progress note.', 'error');
    } finally {
      setSavingProgressNote(false);
    }
  };

  const handleSubmitDisposition = async () => {
    if (selectedDisposition === 'Refer to Specialist') {
      setReferralDialogOpen(true);
      return;
    }

    if (!dispositionNote.trim()) {
      showSnackbar('Disposition note is required.', 'error');
      return;
    }
    if (selectedDisposition === 'Transfer Ward' && targetDepartmentId === '') {
      showSnackbar('Target department is required for transfer.', 'error');
      return;
    }

    try {
      setSavingDisposition(true);
      const note = await admissionService.createInpatientClinicalNote(String(admissionId), {
        noteType: 'Disposition',
        noteText: dispositionNote.trim(),
        dispositionAction: selectedDisposition,
      });
      setClinicalNotes((prev) => [note, ...prev]);

      if (selectedDisposition === 'Transfer Ward') {
        const transition = await admissionService.createInpatientCareTransition(String(admissionId), {
          transitionType: 'TransferWard',
          reason: dispositionNote.trim(),
          targetDepartmentId: Number(targetDepartmentId),
          targetDoctorId: targetDoctorId === '' ? null : Number(targetDoctorId),
        });
        setCareTransitions((prev) => [transition, ...prev]);
      }

      if (selectedDisposition === 'Ready for Discharge' && admission?.admissionId) {
        await admissionService.updateAdmissionStatus(String(admission.admissionId), {
          newStatus: 'Discharged',
        });
        setAdmission((prev) => (prev ? { ...prev, status: 'Discharged' } : prev));
      }
      await refreshTimeline(String(admissionId));
      showSnackbar(
        selectedDisposition === 'Ready for Discharge'
          ? 'Disposition saved and admission marked as Discharged.'
          : 'Disposition note saved.',
        'success'
      );

      setDispositionNote('');
      setTargetDepartmentId('');
      setTargetDoctorId('');
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || err?.message || 'Failed to submit disposition.', 'error');
    } finally {
      setSavingDisposition(false);
    }
  };

  const handleExportTimeline = async () => {
    try {
      setExportingTimeline(true);
      const blob = await admissionService.exportInpatientTimelineCsv(String(admissionId));
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admission-${admissionId}-timeline.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showSnackbar('Timeline CSV export downloaded.', 'success');
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || err?.message || 'Failed to export timeline.', 'error');
    } finally {
      setExportingTimeline(false);
    }
  };

  const handleOpenOrderForm = (category: DiagnosticOrderCategory) => {
    setDefaultOrderCategory(category);
    setIsDiagnosticOrderFormOpen(true);
  };

  const handleReferralWorkflowSubmit = async (payload: ReferralWorkflowPayload) => {
    try {
      setSavingDisposition(true);
      const reasonWithUrgency = `[${payload.urgency}] ${payload.reason}`;
      const note = await admissionService.createInpatientClinicalNote(String(admissionId), {
        noteType: 'Referral',
        noteText: reasonWithUrgency,
        dispositionAction: 'Refer to Specialist',
      });
      setClinicalNotes((prev) => [note, ...prev]);

      const transition = await admissionService.createInpatientCareTransition(String(admissionId), {
        transitionType: 'Referral',
        reason: reasonWithUrgency,
        targetDepartmentId: payload.targetDepartmentId ?? null,
        targetDoctorId: payload.targetDoctorId ?? null,
      });
      setCareTransitions((prev) => [transition, ...prev]);
      await refreshTimeline(String(admissionId));
      setReferralDialogOpen(false);
      setSelectedDisposition('Under Observation');
      showSnackbar('Referral submitted successfully.', 'success');
    } catch (err: any) {
      showSnackbar(err?.response?.data?.message || err?.message || 'Failed to submit referral.', 'error');
    } finally {
      setSavingDisposition(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading inpatient workspace...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Typography variant="h4">
          Inpatient Refer / Continue Workspace
        </Typography>
        <Button
          variant="contained"
          color="error"
          disabled={savingDisposition || String(admission?.status || '').toLowerCase() === 'discharged'}
          onClick={() => {
            setActiveTab(5);
            setSelectedDisposition('Ready for Discharge');
          }}
        >
          Discharge Patient
        </Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">Patient</Typography>
            <Typography variant="subtitle1">
              {admission?.patientFirstName} {admission?.patientLastName} (ID: {admission?.patientId})
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">Admission</Typography>
            <Typography variant="subtitle1">
              {admission?.admissionDate ? new Date(admission.admissionDate).toLocaleString() : 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">Status</Typography>
            <Stack direction="row" spacing={1}>
              <Chip label={admission?.status || 'Unknown'} color="warning" />
              <Chip label={consultation ? 'Consultation Linked' : 'No Consultation'} color={consultation ? 'success' : 'default'} />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Tabs value={activeTab} onChange={(_e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
        <Tab label="Overview" />
        <Tab label="Observation" />
        <Tab label="Medications" />
        <Tab label="Orders" />
        <Tab label="Notes" />
        <Tab label="Disposition" />
      </Tabs>

      {activeTab === 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Overview</Typography>
          <Typography variant="body2">
            Inpatient clinical summary with immediate action points for observation, re-prescription, test orders, and disposition planning.
          </Typography>
        </Paper>
      )}

      {activeTab === 1 && (
        <Stack spacing={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Latest Vitals</Typography>
            {latestVitals ? (
              <Grid container spacing={2}>
                <Grid item xs={6} md={2}><Card><CardContent><Typography variant="caption">BP</Typography><Typography>{latestVitals.bloodPressureSystolic}/{latestVitals.bloodPressureDiastolic}</Typography></CardContent></Card></Grid>
                <Grid item xs={6} md={2}><Card><CardContent><Typography variant="caption">HR</Typography><Typography>{latestVitals.pulseRate}</Typography></CardContent></Card></Grid>
                <Grid item xs={6} md={2}><Card><CardContent><Typography variant="caption">Temp</Typography><Typography>{latestVitals.temperature}</Typography></CardContent></Card></Grid>
                <Grid item xs={6} md={2}><Card><CardContent><Typography variant="caption">RR</Typography><Typography>{latestVitals.respirationRate}</Typography></CardContent></Card></Grid>
                <Grid item xs={6} md={2}><Card><CardContent><Typography variant="caption">SpO2</Typography><Typography>{latestVitals.spo2 ?? 'N/A'}</Typography></CardContent></Card></Grid>
              </Grid>
            ) : (
              <Typography variant="body2">No vitals recorded yet.</Typography>
            )}
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6">Observation Risk Score</Typography>
              <Chip
                label={`${observationRisk.level} (Score ${observationRisk.score})`}
                color={
                  observationRisk.level === 'Critical'
                    ? 'error'
                    : observationRisk.level === 'High'
                      ? 'warning'
                      : observationRisk.level === 'Moderate'
                        ? 'info'
                        : 'success'
                }
              />
            </Stack>
            {observationRisk.level === 'Unknown' ? (
              <Typography variant="body2" color="text.secondary">
                Risk score will appear when vitals are available.
              </Typography>
            ) : observationRisk.contributors.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No immediate abnormal contributors detected from the latest vitals.
              </Typography>
            ) : (
              <Stack spacing={0.75}>
                {observationRisk.contributors.map((contributor) => (
                  <Typography key={contributor} variant="body2" color="text.secondary">
                    - {contributor}
                  </Typography>
                ))}
              </Stack>
            )}
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Vitals Trend</Typography>
            <VitalsTrendChart data={vitalsHistory} />
          </Paper>
        </Stack>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Re-prescription Interface</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Active inpatient prescriptions are listed below. New prescriptions are screened for duplicate therapy and key interaction risks.
          </Typography>
          <Stack spacing={2}>
            {normalizedActivePrescriptions.length > 0 && (
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Active Prescriptions</Typography>
                <Stack spacing={0.75}>
                  {normalizedActivePrescriptions.slice(0, 10).map((prescription: any, index) => (
                    <Typography key={`${prescription?.prescriptionId || index}`} variant="body2" color="text.secondary">
                      {prescription?.medicationName || prescription?.medication || 'Medication'} | {prescription?.dosage || 'N/A'} | {prescription?.frequency || 'N/A'}
                    </Typography>
                  ))}
                </Stack>
              </Paper>
            )}
            <Autocomplete
              options={formularyOptions}
              getOptionLabel={(option) => `${option.name}${option.strength ? ` (${option.strength})` : ''}`}
              value={selectedDrug}
              onInputChange={async (_e, value) => {
                setMedicationName(value);
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
              onChange={(_e, value) => {
                setSelectedDrug(value);
                if (value) setMedicationName(value.name);
              }}
              renderInput={(params) => <TextField {...params} label="Medication" />}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}><TextField fullWidth label="Dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth label="Frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth type="date" label="Start Date" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth type="date" label="End Date" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} /></Grid>
              <Grid item xs={12} md={8}><TextField fullWidth label="Instructions / Rationale" value={instructions} onChange={(e) => setInstructions(e.target.value)} /></Grid>
            </Grid>
            {medicationSafetyWarnings.length > 0 && (
              <Stack spacing={1}>
                {medicationSafetyWarnings.map((warning, index) => (
                  <Alert key={`${warning.message}-${index}`} severity={warning.severity === 'high' ? 'error' : 'warning'}>
                    {warning.message}
                  </Alert>
                ))}
              </Stack>
            )}
            {hasHighRiskMedicationWarning && (
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Stack spacing={1.25}>
                  <TextField
                    fullWidth
                    label="Override Reason (Required for High-Risk)"
                    value={medicationOverrideReason}
                    onChange={(e) => setMedicationOverrideReason(e.target.value)}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={confirmHighRiskOverride}
                        onChange={(e) => setConfirmHighRiskOverride(e.target.checked)}
                      />
                    }
                    label="I confirm this high-risk prescription override is clinically justified."
                  />
                </Stack>
              </Paper>
            )}
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" onClick={handleAddPrescription} disabled={savingPrescription}>
                {savingPrescription ? 'Saving...' : 'Save Re-prescription'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      {activeTab === 3 && (
        <Stack spacing={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Orders</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Place lab, imaging, and other diagnostic orders. Track pending and completed outcomes in one board.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="outlined"
                onClick={() => handleOpenOrderForm('Lab')}
                disabled={!consultation?.id || !admission?.patientId}
              >
                Order Lab
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleOpenOrderForm('Imaging')}
                disabled={!consultation?.id || !admission?.patientId}
              >
                Order Imaging
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleOpenOrderForm('Other')}
                disabled={!consultation?.id || !admission?.patientId}
              >
                Order Other
              </Button>
              <Select
                size="small"
                value={ordersCategoryFilter}
                onChange={(e) => setOrdersCategoryFilter(e.target.value as 'All' | DiagnosticOrderCategory)}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="All">All Categories</MenuItem>
                <MenuItem value="Lab">Lab</MenuItem>
                <MenuItem value="Imaging">Imaging</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </Stack>
          </Paper>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle1">Pending Orders</Typography>
                  <Chip label={pendingOrders.length} color="warning" size="small" />
                </Stack>
                {ordersLoading ? (
                  <Typography variant="body2" color="text.secondary">Loading orders...</Typography>
                ) : pendingOrders.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No pending orders.</Typography>
                ) : (
                  <Stack spacing={1}>
                    {pendingOrders.slice(0, 20).map((order) => (
                      <Paper key={order.lab_request_id} variant="outlined" sx={{ p: 1.25 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Chip size="small" label={classifyOrderCategory(order.test_type)} color="info" />
                          <Chip size="small" label={order.status} />
                        </Stack>
                        <Typography variant="subtitle2" sx={{ mt: 0.75 }}>{order.test_type}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {order.reason || 'No reason specified.'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Requested: {new Date(order.created_at).toLocaleString()}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle1">Completed / Closed</Typography>
                  <Chip label={completedOrders.length} color="success" size="small" />
                </Stack>
                {ordersLoading ? (
                  <Typography variant="body2" color="text.secondary">Loading orders...</Typography>
                ) : completedOrders.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No completed or cancelled orders yet.</Typography>
                ) : (
                  <Stack spacing={1}>
                    {completedOrders.slice(0, 20).map((order) => (
                      <Paper key={order.lab_request_id} variant="outlined" sx={{ p: 1.25 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Chip size="small" label={classifyOrderCategory(order.test_type)} color="info" />
                          <Chip
                            size="small"
                            label={order.status}
                            color={order.status === 'COMPLETED' ? 'success' : 'default'}
                          />
                        </Stack>
                        <Typography variant="subtitle2" sx={{ mt: 0.75 }}>{order.test_type}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {order.reason || 'No reason specified.'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Requested: {new Date(order.created_at).toLocaleString()}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      )}

      {activeTab === 4 && (
        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="h6">Clinical Notes</Typography>
            <Button variant="outlined" onClick={handleExportTimeline} disabled={exportingTimeline}>
              {exportingTimeline ? 'Exporting...' : 'Export Timeline CSV'}
            </Button>
          </Stack>
          <TextField
            fullWidth
            multiline
            minRows={6}
            label="Progress / Observation Note"
            value={progressNote}
            onChange={(e) => setProgressNote(e.target.value)}
          />
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
            <Button variant="contained" onClick={handleSaveProgressNote} disabled={savingProgressNote}>
              {savingProgressNote ? 'Saving...' : 'Save Note'}
            </Button>
          </Stack>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Recent Clinical Notes</Typography>
            {clinicalNotes.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No clinical notes yet.</Typography>
            ) : (
              <Stack spacing={1}>
                {clinicalNotes.slice(0, 10).map((note) => (
                  <Paper key={note.noteId} variant="outlined" sx={{ p: 1.25 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1}>
                        <Chip size="small" label={note.noteType} />
                        {note.dispositionAction && (
                          <Chip size="small" label={note.dispositionAction} color="warning" />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(note.createdAt).toLocaleString()}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                      {note.noteText}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      By: {note.createdByFirstName || 'User'} {note.createdByLastName || ''}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Inpatient Timeline</Typography>
            {timelineLoading ? (
              <Typography variant="body2" color="text.secondary">Loading timeline...</Typography>
            ) : timelineEvents.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No timeline events yet.</Typography>
            ) : (
              <Stack spacing={1}>
                {timelineEvents.slice(0, 20).map((event, index) => (
                  <Paper key={`${event.eventType}-${event.eventTime}-${index}`} variant="outlined" sx={{ p: 1.25 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Chip size="small" label={event.eventType} />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(event.eventTime).toLocaleString()}
                      </Typography>
                    </Stack>
                    <Typography variant="subtitle2" sx={{ mt: 0.75 }}>{event.title}</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>{event.details}</Typography>
                    {event.actorName && (
                      <Typography variant="caption" color="text.secondary">By: {event.actorName}</Typography>
                    )}
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        </Paper>
      )}

      {activeTab === 5 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Disposition</Typography>
          <Stack spacing={2}>
            <Select
              value={selectedDisposition}
              onChange={(e) => setSelectedDisposition(String(e.target.value))}
            >
              <MenuItem value="Under Observation">Under Observation</MenuItem>
              <MenuItem value="Refer to Specialist">Refer to Specialist</MenuItem>
              <MenuItem value="Transfer Ward">Transfer Ward</MenuItem>
              <MenuItem value="Ready for Discharge">Ready for Discharge</MenuItem>
            </Select>
            {selectedDisposition === 'Refer to Specialist' ? (
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Stack spacing={1.5}>
                  <Typography variant="body2" color="text.secondary">
                    Referral uses a dedicated workflow modal with target department/doctor, urgency, and note.
                  </Typography>
                  <Stack direction="row" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      onClick={() => setReferralDialogOpen(true)}
                      disabled={savingDisposition}
                    >
                      Open Referral Workflow
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            ) : (
              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Disposition Note / Reason"
                value={dispositionNote}
                onChange={(e) => setDispositionNote(e.target.value)}
              />
            )}
            {selectedDisposition === 'Transfer Ward' && (
              <Stack spacing={2}>
                <Select
                  displayEmpty
                  value={targetDepartmentId}
                  onChange={(e) => {
                    const value = e.target.value as string | number;
                    setTargetDepartmentId(value === '' ? '' : Number(value));
                  }}
                >
                  <MenuItem value="">Select Target Department</MenuItem>
                  {departments.map((dep) => (
                    <MenuItem key={dep.departmentId} value={dep.departmentId}>
                      {dep.name}
                    </MenuItem>
                  ))}
                </Select>
                <Select
                  displayEmpty
                  value={targetDoctorId}
                  onChange={(e) => {
                    const value = e.target.value as string | number;
                    setTargetDoctorId(value === '' ? '' : Number(value));
                  }}
                >
                  <MenuItem value="">Select Target Doctor (Optional)</MenuItem>
                  {doctors.map((doc) => (
                    <MenuItem key={doc.user_id} value={doc.user_id}>
                      {doc.fullName || `${doc.first_name} ${doc.last_name}`}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            )}
            {selectedDisposition !== 'Refer to Specialist' && (
              <Stack direction="row" justifyContent="flex-end">
                <Button variant="contained" onClick={handleSubmitDisposition} disabled={savingDisposition || !dispositionNote.trim()}>
                  {savingDisposition ? 'Submitting...' : 'Submit Disposition'}
                </Button>
              </Stack>
            )}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Care Transition Records</Typography>
              {careTransitions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No care transition records yet.</Typography>
              ) : (
                <Stack spacing={1}>
                  {careTransitions.slice(0, 10).map((transition) => (
                    <Paper key={transition.transitionId} variant="outlined" sx={{ p: 1.25 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1}>
                          <Chip size="small" label={transition.transitionType} color="info" />
                          <Chip size="small" label={transition.status} />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(transition.requestedAt).toLocaleString()}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ mt: 1 }}>{transition.reason}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Target: {transition.targetDepartmentName || 'N/A'}
                        {transition.targetDoctorFirstName ? ` | Dr. ${transition.targetDoctorFirstName} ${transition.targetDoctorLastName || ''}` : ''}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </Paper>
      )}

      {consultation && admission && (
        <ReferralWorkflowDialog
          open={referralDialogOpen}
          onClose={() => {
            if (savingDisposition) return;
            setReferralDialogOpen(false);
          }}
          onSubmit={handleReferralWorkflowSubmit}
          loading={savingDisposition}
          departments={departments}
          doctors={doctors}
          title="Referral Workflow"
        />
      )}

      {consultation && admission && (
        <DiagnosticOrderForm
          open={isDiagnosticOrderFormOpen}
          onClose={() => setIsDiagnosticOrderFormOpen(false)}
          onSuccess={async () => {
            setIsDiagnosticOrderFormOpen(false);
            if (admission.patientId) {
              await refreshOrders(Number(admission.patientId));
            }
          }}
          patientId={String(admission.patientId)}
          appointmentId={String(consultation.id)}
          defaultCategory={defaultOrderCategory}
        />
      )}
    </Box>
  );
}

export default withAuth(DoctorInpatientWorkspacePage, ['Doctor']);
