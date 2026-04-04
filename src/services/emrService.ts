import { MedicalRecord, Diagnosis, Prescription, VitalSigns, Allergy, Document, CreateMedicalRecordPayload, CreateDiagnosisPayload, CreatePrescriptionPayload } from '@/types/emr';
import { apiClient } from '@/utils/api-client';


export const getMedicalRecords = async (): Promise<MedicalRecord[]> => {
  return apiClient.get<MedicalRecord[]>('/emr');
};

export const getMedicalRecordById = async (id: number): Promise<MedicalRecord> => {
  return apiClient.get<MedicalRecord>(`/emr/${id}`);
};

export const createMedicalRecord = async (payload: CreateMedicalRecordPayload): Promise<MedicalRecord> => {
  return apiClient.post<MedicalRecord>('/emr', {
    patientId: payload.patientId,
    doctorId: payload.doctorId,
    notes: payload.notes,
    chiefComplaint: payload.chiefComplaint,
    assessment: payload.assessment,
    plan: payload.plan,
    appointmentId: payload.appointmentId,
    creatingUserId: payload.creatingUserId,
  });
};

export const updateMedicalRecord = async (
  id: number,
  payload: { notes?: string; chiefComplaint?: string; assessment?: string; plan?: string }
): Promise<MedicalRecord> => {
  return apiClient.put<MedicalRecord>(`/emr/${id}`, payload);
};

export const addDiagnosisToMedicalRecord = async (payload: CreateDiagnosisPayload): Promise<Diagnosis> => {
  return apiClient.post<Diagnosis>(`/emr/${payload.medicalRecordId}/diagnoses`, {
    code: payload.code,
    severity: payload.severity,
  });
};

export const getDiagnosesByMedicalRecordId = async (recordId: string): Promise<Diagnosis[]> => {
  return apiClient.get<Diagnosis[]>(`/emr/${recordId}/diagnoses`);
};

export const addPrescriptionToMedicalRecord = async (payload: CreatePrescriptionPayload): Promise<Prescription> => {
  return apiClient.post<Prescription>(`/emr/${payload.medicalRecordId}/prescriptions`, {
    medication: payload.medication,
    drugId: payload.drugId,
    dosage: payload.dosage,
    frequency: payload.frequency,
    startDate: payload.startDate,
    endDate: payload.endDate,
    instructions: payload.instructions,
    refills: payload.refills,
  });
};

export const getPrescriptionsByMedicalRecordId = async (recordId: string): Promise<Prescription[]> => {
  return apiClient.get<Prescription[]>(`/emr/${recordId}/prescriptions`);
};

export const addVitalSigns = async (
  recordId: number,
  bloodPressure?: string,
  heartRate?: number,
  temperature?: number,
  weight?: number,
  height?: number
): Promise<VitalSigns> => {
  return apiClient.post<VitalSigns>(`/emr/${recordId}/vital-signs`, {
    bloodPressure,
    heartRate,
    temperature,
    weight,
    height,
  });
};

export const getVitalSignsByMedicalRecordId = async (recordId: number): Promise<VitalSigns[]> => {
  return apiClient.get<VitalSigns[]>(`/emr/${recordId}/vital-signs`);
};

export interface PatientVitalsTrendPoint {
  vitalId: number;
  patientId: number;
  appointmentId?: number | null;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  temperature: number;
  pulseRate: number;
  respirationRate: number;
  spo2?: number | null;
  recordedAt: string;
}

export const getPatientVitalsHistory = async (
  patientId: number,
  options?: { limit?: number; startDate?: string; endDate?: string }
): Promise<PatientVitalsTrendPoint[]> => {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);

  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiClient.get<PatientVitalsTrendPoint[]>(`/emr/vitals/history/${patientId}${suffix}`);
};

export const addAllergy = async (
  patientId: number,
  allergen: string,
  reaction: string,
  severity: string
): Promise<Allergy> => {
  return apiClient.post<Allergy>('/emr/allergies', {
    patientId,
    allergen,
    reaction,
    severity,
  });
};

export const getAllergiesByPatientId = async (patientId: number): Promise<Allergy[]> => {
  return apiClient.get<Allergy[]>(`/emr/allergies/${patientId}`);
};

export const searchMedicalRecords = async (
  patientId?: number,
  doctorId?: number,
  startDate?: string,
  endDate?: string,
  diagnosis?: string,
  limit: number = 50,
  offset: number = 0
): Promise<MedicalRecord[]> => {
  const params = new URLSearchParams();
  if (patientId) params.append('patientId', patientId.toString());
  if (doctorId) params.append('doctorId', doctorId.toString());
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (diagnosis) params.append('diagnosis', diagnosis);
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());

  return apiClient.get<MedicalRecord[]>(`/emr/search?${params.toString()}`);
};

export const uploadDocument = async (recordId: number, file: File): Promise<Document> => {
  const formData = new FormData();
  formData.append('document', file);

  return apiClient.upload<Document>(`/emr/${recordId}/documents`, formData);
};

export const getDocumentsForRecord = async (recordId: number): Promise<Document[]> => {
  return apiClient.get<Document[]>(`/emr/${recordId}/documents`);
};

export const getDocumentUrl = async (documentId: number): Promise<{ url: string; fileName: string }> => {
  return apiClient.get<{ url: string; fileName: string }>(`/emr/documents/${documentId}`);
};

export const getPrescriptionsByPatientId = async (patientId: number): Promise<Prescription[]> => {
  return apiClient.get<Prescription[]>(`/emr/patient/${patientId}/prescriptions`);
};

export const getPrescriptionsByPatientIdAndAdmissionId = async (patientId: number, admissionId: number): Promise<Prescription[]> => {
  return apiClient.get<Prescription[]>(`/emr/prescriptions/patient/${patientId}/admission/${admissionId}`);
};

export const getPatientMedicalRecordsSummary = async (patientId: number): Promise<any> => {
    return {
      lastDiagnosis: 'Hypertension',
      activePrescriptionsCount: 2,
      lastVisitDate: '2025-12-01',
    };
  };

export const getMedicalRecordByAppointmentId = async (appointmentId: number, _userId: number): Promise<MedicalRecord | null> => {
  try {
    return await apiClient.get<MedicalRecord>(`/emr/appointment/${appointmentId}`);
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const searchIcd10Codes = async (searchTerm: string): Promise<any[]> => {
  return apiClient.get<any[]>(`/emr/icd10-codes/search`, {
    params: { q: searchTerm },
  });
};
