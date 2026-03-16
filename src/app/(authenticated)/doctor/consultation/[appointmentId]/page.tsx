// src/app/(authenticated)/doctor/consultation/[appointmentId]/page.tsx

"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { CreateMedicalRecordPayload, CreateDiagnosisPayload, CreatePrescriptionPayload, Diagnosis, Prescription } from '@/types/emr';
import { VitalSign } from '@/types/vitals';
import { Doctor } from '@/types/user';
import {
  getAppointment,
  updateAppointmentStatus,
} from '@/services/appointmentService';
import {
  getMedicalRecordByAppointmentId,
  createMedicalRecord,
  updateMedicalRecord,
  addDiagnosisToMedicalRecord,
  addPrescriptionToMedicalRecord,
  getDiagnosesByMedicalRecordId,
  getPrescriptionsByMedicalRecordId,
  getPatientVitalsHistory,
  PatientVitalsTrendPoint,
  searchIcd10Codes, // New: Import ICD-10 search service
} from '@/services/emrService';
import { searchFormulary } from '@/services/pharmacyService';
import { FormularyDrug } from '@/types/pharmacy';
import { getVitalSignsByAppointmentId } from '@/services/vitalsService';
import { fetchDoctors } from '@/services/userService';
import VitalsTrendChart from '@/components/emr/VitalsTrendChart';
import { admissionService } from '@/services/admissionService';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import Autocomplete from '@mui/material/Autocomplete'; // New: Import Autocomplete
import TextField from '@mui/material/TextField';     // New: Import TextField
import LabTestOrderForm from '@/components/lab/LabTestOrderForm';

// New: Define ICD10Code interface for fetched codes
interface ICD10Code {
  code: string;
  description: string;
  category?: string;
}

const DoctorConsultationPage = () => {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.appointmentId as string;
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [medicalRecord, setMedicalRecord] = useState<any | null>(null);
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [vitalsHistory, setVitalsHistory] = useState<PatientVitalsTrendPoint[]>([]);
  const [showVitalsTrend, setShowVitalsTrend] = useState(false);
  const [loadingVitalsTrend, setLoadingVitalsTrend] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // EMR Form States
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [notes, setNotes] = useState('');

  // Diagnosis Form States
  const [selectedIcd10Code, setSelectedIcd10Code] = useState<ICD10Code | null>(null); // New: State for selected ICD-10 code
  const [icd10SearchOptions, setIcd10SearchOptions] = useState<ICD10Code[]>([]); // New: State for search options
  const [newDiagnosisSeverity, setNewDiagnosisSeverity] = useState('');

  // Prescription Form States
  const [newMedication, setNewMedication] = useState('');
  const [selectedFormularyDrug, setSelectedFormularyDrug] = useState<FormularyDrug | null>(null);
  const [formularyOptions, setFormularyOptions] = useState<FormularyDrug[]>([]);
  const [newDosage, setNewDosage] = useState('');
  const [newFrequency, setNewFrequency] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newRefills, setNewRefills] = useState<number | ''>('');
  const [isLabOrderFormOpen, setIsLabOrderFormOpen] = useState(false);
  const [isAdmitting, setIsAdmitting] = useState(false);
  const [hasActiveAdmission, setHasActiveAdmission] = useState(false);
  const [checkingAdmission, setCheckingAdmission] = useState(false);

  const fetchConsultationData = useCallback(async () => {
    if (!appointmentId || !user?.userId) return;

    try {
      setLoading(true);
      const [apptData, vitalsData, medicalRecordData] = await Promise.all([
        getAppointment(Number(appointmentId)),
        getVitalSignsByAppointmentId(Number(appointmentId)),
        getMedicalRecordByAppointmentId(Number(appointmentId), user.userId),
      ]);
      setAppointment(apptData);
      setVitals(vitalsData);
      setLoadingVitalsTrend(true);
      try {
        const trendData = await getPatientVitalsHistory(apptData.patientId, { limit: 20 });
        setVitalsHistory(trendData);
      } catch (trendError) {
        console.error('Failed to load vitals trend data:', trendError);
      } finally {
        setLoadingVitalsTrend(false);
      }

      if (medicalRecordData) {
        setMedicalRecord(medicalRecordData);
        // If medical record exists, pre-fill forms
        setChiefComplaint(medicalRecordData.chiefComplaint || '');
        setAssessment(medicalRecordData.assessment || '');
        setPlan(medicalRecordData.plan || '');
        setNotes(medicalRecordData.notes || '');

        // Fetch associated diagnoses and prescriptions
        const [diagnosesData, prescriptionsData] = await Promise.all([
          getDiagnosesByMedicalRecordId(medicalRecordData.recordId),
          getPrescriptionsByMedicalRecordId(medicalRecordData.recordId),
        ]);
        setDiagnoses(diagnosesData);
        setPrescriptions(prescriptionsData);
      }
    } catch (err: any) {
      console.error('Failed to fetch consultation data:', err);
      setError(err.message || 'Failed to load consultation details.');
      showSnackbar(err.message || 'Failed to load data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [appointmentId, user, showSnackbar]);

  useEffect(() => {
    fetchConsultationData();
  }, [fetchConsultationData]);

  useEffect(() => {
    const checkActiveAdmission = async () => {
      if (!appointment?.patientId) return;
      setCheckingAdmission(true);
      try {
        const admissions = await admissionService.getAdmissionsByPatientId(String(appointment.patientId));
        const active = Array.isArray(admissions)
          && admissions.some((a: any) => String(a?.status).toLowerCase() === 'admitted');
        setHasActiveAdmission(active);
      } catch (err) {
        console.error('Failed to check existing admissions:', err);
      } finally {
        setCheckingAdmission(false);
      }
    };

    checkActiveAdmission();
  }, [appointment?.patientId]);

  const handleCreateMedicalRecord = async () => {
    const numericAppointmentId = Number(appointmentId);
    if (!user || !user.userId || !appointment?.patientId || !Number.isFinite(numericAppointmentId)) {
      showSnackbar('Missing required data to create medical record.', 'error');
      return;
    }
    if (!chiefComplaint.trim() || !assessment.trim() || !plan.trim()) {
      showSnackbar('Chief Complaint, Assessment, and Plan are required for Medical Record.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (medicalRecord?.recordId) {
        const updatedMedicalRecord = await updateMedicalRecord(Number(medicalRecord.recordId), {
          notes,
          chiefComplaint,
          assessment,
          plan,
        });
        setMedicalRecord(updatedMedicalRecord);
        showSnackbar('Medical record updated successfully!', 'success');
        return;
      }

      const payload: CreateMedicalRecordPayload = {
        patientId: appointment.patientId,
        appointmentId: numericAppointmentId,
        doctorId: user.userId, // Doctor is the current authenticated user
        notes,
        chiefComplaint,
        assessment,
        plan,
        creatingUserId: user.userId,
      };
      const newMedicalRecord = await createMedicalRecord(payload);
      setMedicalRecord(newMedicalRecord);
      showSnackbar('Medical record created successfully!', 'success');
    } catch (err: any) {
      console.error('Failed to create medical record:', err);
      showSnackbar(err?.response?.data?.message || err.message || 'Failed to create medical record.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddDiagnosis = async () => {
    if (!medicalRecord?.recordId || !selectedIcd10Code) {
      showSnackbar('Medical Record must exist and an ICD-10 Diagnosis must be selected.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateDiagnosisPayload = {
        medicalRecordId: medicalRecord.recordId,
        code: selectedIcd10Code.code, // Use the selected ICD-10 code
        severity: newDiagnosisSeverity || undefined,
      };
      const addedDiagnosis = await addDiagnosisToMedicalRecord(payload);
      setDiagnoses((prev) => [...prev, addedDiagnosis]);
      showSnackbar('Diagnosis added successfully!', 'success');
      // Clear form
      setSelectedIcd10Code(null);
      setNewDiagnosisSeverity('');
    } catch (err: any) {
      console.error('Failed to add diagnosis:', err);
      showSnackbar(err.message || 'Failed to add diagnosis.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPrescription = async () => {
    if (!medicalRecord?.recordId || !newMedication.trim() || !newDosage.trim() || !newFrequency.trim() || !newStartDate.trim()) {
      showSnackbar('Medical Record must exist and Medication, Dosage, Frequency, and Start Date are required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreatePrescriptionPayload = {
        medicalRecordId: medicalRecord.recordId,
        medication: newMedication,
        drugId: selectedFormularyDrug?.drugId,
        dosage: newDosage,
        frequency: newFrequency,
        startDate: new Date(newStartDate), // Convert to Date object
        endDate: newEndDate ? new Date(newEndDate) : undefined, // Convert to Date or keep undefined
        instructions: newInstructions || undefined,
        refills: newRefills === '' ? undefined : newRefills,
      };
      const addedPrescription = await addPrescriptionToMedicalRecord(payload);
      setPrescriptions((prev) => [...prev, addedPrescription]);
      showSnackbar('Prescription added successfully!', 'success');
      // Clear form
      setNewMedication('');
      setSelectedFormularyDrug(null);
      setFormularyOptions([]);
      setNewDosage('');
      setNewFrequency('');
      setNewStartDate('');
      setNewEndDate('');
      setNewInstructions('');
      setNewRefills('');
    } catch (err: any) {
      console.error('Failed to add prescription:', err);
      showSnackbar(err.message || 'Failed to add prescription.', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  const handleEndConsultation = async () => {
    if (!user || !user.userId || !appointment?.id) {
      showSnackbar('Missing user or appointment data.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const currentStatus = String(appointment.status || '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '_');

      if (currentStatus === 'ASSIGNED') {
        await updateAppointmentStatus(Number(appointment.id), 'IN_CONSULTATION');
      }

      await updateAppointmentStatus(Number(appointment.id), 'COMPLETED');
      showSnackbar('Consultation ended successfully!', 'success');
      router.push('/doctor/dashboard');
    } catch (err: any) {
      console.error('Failed to end consultation:', err);
      showSnackbar(err.message || 'Failed to end consultation.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdmitPatient = async () => {
    if (!user?.userId || !appointment?.patientId) {
      showSnackbar('Missing patient or doctor context for admission.', 'error');
      return;
    }

    setIsAdmitting(true);
    try {
      await admissionService.createAdmission({
        patientId: String(appointment.patientId),
        admittingDoctorId: user.userId,
        departmentId: appointment.departmentId,
        status: 'Admitted',
      });
      setHasActiveAdmission(true);
      showSnackbar('Patient admitted successfully.', 'success');
    } catch (err: any) {
      console.error('Failed to admit patient:', err);
      showSnackbar(err?.response?.data?.message || 'Failed to admit patient.', 'error');
    } finally {
      setIsAdmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading consultation...</p></div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user || !user.roles.includes('Doctor')) {
    router.push('/dashboard'); // Redirect if not authorized
    return null;
  }

  if (!appointment) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Appointment not found or you are not authorized to view it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Doctor Consultation</CardTitle>
          <CardDescription>
            Patient: {appointment.patientFirstName} {appointment.patientLastName} | Appointment Time: {appointment.dateTime ? new Date(appointment.dateTime).toLocaleString() : 'N/A'}
          </CardDescription>
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              onClick={handleAdmitPatient}
              variant="secondary"
              disabled={submitting || isAdmitting || checkingAdmission || hasActiveAdmission || !appointment?.patientId}
            >
              {checkingAdmission ? 'Checking Admission...'
                : hasActiveAdmission ? 'Already Admitted'
                : isAdmitting ? 'Admitting...'
                : 'Admit Patient'}
            </Button>
            <Button onClick={() => router.back()} variant="outline" disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleEndConsultation} disabled={submitting || !medicalRecord}>
              {submitting ? 'Ending...' : 'End Consultation'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Details & Vitals */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Patient ID:</strong> {appointment.patientId}</p>
                <div><strong>Service Type:</strong> <Badge>{appointment.serviceType}</Badge></div>
                <p><strong>Reason for Visit:</strong> {appointment.reason}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Latest Vital Signs</CardTitle>
              </CardHeader>
              <CardContent>
                {vitals.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {vitals.map((v, index) => (
                      <li key={index}>
                        BP: {v.bloodPressureSystolic}/{v.bloodPressureDiastolic}, Temp: {v.temperature}°C, Pulse: {v.pulseRate}, Resp: {v.respirationRate}, SpO2: {v.spo2}%
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No vital signs recorded for this appointment.</p>
                )}
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowVitalsTrend((prev) => !prev)}
                  >
                    {showVitalsTrend ? 'Hide Trends' : 'View Trends'}
                  </Button>
                </div>
                {showVitalsTrend && (
                  <div className="mt-4">
                    {loadingVitalsTrend ? (
                      <p className="text-sm text-muted-foreground">Loading trend data...</p>
                    ) : (
                      <VitalsTrendChart data={vitalsHistory} />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TODO: Add Patient History/EMR summary here */}
            <Card>
              <CardHeader>
                <CardTitle>Medical History Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  (Future: Link to full EMR view for patient's historical records)
                </p>
                {/* Placeholder for actual history display */}
                <p>Previous diagnoses, allergies, etc. will appear here.</p>
              </CardContent>
            </Card>
          </div>

          {/* EMR and Documentation Forms */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Consultation Notes (SOAP)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {medicalRecord ? (
                  <>
                    <Label>Chief Complaint</Label>
                    <Input value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} disabled={submitting} />
                    <Label>Assessment</Label>
                    <Textarea value={assessment} onChange={(e) => setAssessment(e.target.value)} disabled={submitting} />
                    <Label>Plan</Label>
                    <Textarea value={plan} onChange={(e) => setPlan(e.target.value)} disabled={submitting} />
                    <Label>Additional Notes</Label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} disabled={submitting} />
                    <Button onClick={handleCreateMedicalRecord} disabled={submitting}>
                        Update Medical Record
                    </Button> {/* Could be update if record exists */}
                  </>
                ) : (
                  <>
                    <Label htmlFor="chiefComplaint">Chief Complaint</Label>
                    <Input id="chiefComplaint" value={chiefComplaint} onChange={(e) => setChiefComplaint(e.target.value)} placeholder="Patient's primary reason for visit" />

                    <Label htmlFor="assessment">Assessment</Label>
                    <Textarea id="assessment" value={assessment} onChange={(e) => setAssessment(e.target.value)} placeholder="Doctor's assessment" />

                    <Label htmlFor="plan">Plan</Label>
                    <Textarea id="plan" value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="Treatment plan, next steps" />

                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any other relevant notes" />

                    <Button onClick={handleCreateMedicalRecord} disabled={submitting}>
                      {submitting ? 'Creating...' : 'Create Medical Record'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Diagnoses */}
            <Card>
              <CardHeader>
                <CardTitle>Diagnoses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="list-disc pl-5">
                  {diagnoses.map((d, index) => (
                    <li key={index}>
                      <strong>{d.code}</strong>: {d.description} {d.severity && `(Severity: ${d.severity})`}
                    </li>
                  ))}
                </ul>
                <Autocomplete
                  options={icd10SearchOptions}
                  getOptionLabel={(option) => `${option.code} - ${option.description}`}
                  isOptionEqualToValue={(option, value) => option.code === value.code}
                  onInputChange={async (event, newInputValue) => {
                    if (newInputValue.length > 2) {
                      const results = await searchIcd10Codes(newInputValue);
                      setIcd10SearchOptions(results);
                    } else {
                      setIcd10SearchOptions([]);
                    }
                  }}
                  onChange={(event, newValue) => {
                    setSelectedIcd10Code(newValue);
                  }}
                  value={selectedIcd10Code}
                  disabled={!medicalRecord || submitting}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search ICD-10 Code or Description"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
                <Input placeholder="Severity (Optional)" value={newDiagnosisSeverity} onChange={(e) => setNewDiagnosisSeverity(e.target.value)} disabled={!medicalRecord || submitting} />
                <Button onClick={handleAddDiagnosis} disabled={!medicalRecord || submitting || !selectedIcd10Code}>
                  {submitting ? 'Adding...' : 'Add Diagnosis'}
                </Button>
              </CardContent>
            </Card>

            <Separator />

            {/* Prescriptions */}
            <Card>
              <CardHeader>
                <CardTitle>Prescriptions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="list-disc pl-5">
                  {prescriptions.map((p, index) => (
                    <li key={index}>
                      <strong>{p.medicationName}</strong> {p.dosage} ({p.frequency}) - {new Date(p.startDate).toLocaleDateString()} to {p.endDate ? new Date(p.endDate).toLocaleDateString() : 'N/A'}
                    </li>
                  ))}
                </ul>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Autocomplete
                    options={formularyOptions}
                    getOptionLabel={(option) => {
                      if (typeof option === 'string') return option;
                      return `${option.name}${option.strength ? ` (${option.strength})` : ''}`;
                    }}
                    isOptionEqualToValue={(option, value) =>
                      typeof value !== 'string' && option.drugId === value.drugId
                    }
                    onInputChange={async (_event, newInputValue) => {
                      setNewMedication(newInputValue);
                      if (newInputValue.length > 2) {
                        try {
                          const results = await searchFormulary(newInputValue);
                          setFormularyOptions(results);
                        } catch {
                          setFormularyOptions([]);
                        }
                      } else {
                        setFormularyOptions([]);
                      }
                    }}
                    onChange={(_event, newValue) => {
                      if (typeof newValue === 'string') {
                        setSelectedFormularyDrug(null);
                        setNewMedication(newValue);
                        return;
                      }

                      setSelectedFormularyDrug(newValue);
                      if (newValue) {
                        setNewMedication(newValue.name);
                      }
                    }}
                    value={selectedFormularyDrug}
                    freeSolo
                    disabled={!medicalRecord || submitting}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Medication Name"
                        placeholder="Type to search formulary"
                        fullWidth
                      />
                    )}
                  />
                  <Input placeholder="Dosage" value={newDosage} onChange={(e) => setNewDosage(e.target.value)} disabled={!medicalRecord || submitting} />
                  <Input placeholder="Frequency" value={newFrequency} onChange={(e) => setNewFrequency(e.target.value)} disabled={!medicalRecord || submitting} />
                  <Input type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} disabled={!medicalRecord || submitting} />
                  <Input type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} disabled={!medicalRecord || submitting} />
                  <Textarea placeholder="Instructions (Optional)" value={newInstructions} onChange={(e) => setNewInstructions(e.target.value)} disabled={!medicalRecord || submitting} />
                  <Input type="number" placeholder="Refills (Optional)" value={newRefills} onChange={(e) => setNewRefills(Number(e.target.value))} disabled={!medicalRecord || submitting} />
                </div>
                <Button onClick={handleAddPrescription} disabled={!medicalRecord || submitting}>
                  {submitting ? 'Adding...' : 'Add Prescription'}
                </Button>
              </CardContent>
            </Card>

            <Separator />

            {/* Lab Requests (Future) */}
            <Card>
              <CardHeader>
                <CardTitle>Lab & Imaging Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Order labs directly for this consultation.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsLabOrderFormOpen(true)}
                  disabled={submitting || !appointment?.patientId || !appointment?.id}
                >
                  Order Lab Test
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <LabTestOrderForm
        open={isLabOrderFormOpen}
        onClose={() => setIsLabOrderFormOpen(false)}
        onSuccess={() => {
          setIsLabOrderFormOpen(false);
        }}
        patientId={String(appointment.patientId)}
        appointmentId={String(appointment.id)}
      />
    </div>
  );
};

export default DoctorConsultationPage;
