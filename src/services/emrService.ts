import { MedicalRecord, Diagnosis, Prescription, VitalSigns, Allergy, Document, CreateMedicalRecordPayload, CreateDiagnosisPayload, CreatePrescriptionPayload } from '@/types/emr';
import api from '@/utils/api';
import { AxiosError } from 'axios';


export const getMedicalRecords = async (): Promise<MedicalRecord[]> => {
  const response = await api.get('/emr');
  return response.data;
};

export const getMedicalRecordById = async (id: number): Promise<MedicalRecord> => {
  const response = await api.get(`/emr/${id}`);
  return response.data;
};

export const createMedicalRecord = async (payload: CreateMedicalRecordPayload): Promise<MedicalRecord> => {
    try {
      const response = await api.post('/emr', {
        patientId: payload.patientId,
        doctorId: payload.doctorId,
        notes: payload.notes,
        chiefComplaint: payload.chiefComplaint,
        assessment: payload.assessment,
        plan: payload.plan,
        appointmentId: payload.appointmentId,
        creatingUserId: payload.creatingUserId, // Pass creatingUserId
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to create medical record');
    }
  };

export const updateMedicalRecord = async (
  id: number,
  payload: { notes?: string; chiefComplaint?: string; assessment?: string; plan?: string }
): Promise<MedicalRecord> => {
  const response = await api.put(`/emr/${id}`, payload);
  return response.data;
};

export const addDiagnosisToMedicalRecord = async (payload: CreateDiagnosisPayload): Promise<Diagnosis> => {
    const response = await api.post(`/emr/${payload.medicalRecordId}/diagnoses`, {
      code: payload.code, // Use payload.code
      severity: payload.severity,
    });
    return response.data;
  };

export const getDiagnosesByMedicalRecordId = async (recordId: string): Promise<Diagnosis[]> => {
  const response = await api.get(`/emr/${recordId}/diagnoses`);
  return response.data;
};

export const addPrescriptionToMedicalRecord = async (payload: CreatePrescriptionPayload): Promise<Prescription> => {
    const response = await api.post(`/emr/${payload.medicalRecordId}/prescriptions`, {
      medication: payload.medication,
      drugId: payload.drugId,
      dosage: payload.dosage,
      frequency: payload.frequency,
      startDate: payload.startDate,
      endDate: payload.endDate,
      instructions: payload.instructions,
      refills: payload.refills,
    });
    return response.data;
  };

export const getPrescriptionsByMedicalRecordId = async (recordId: string): Promise<Prescription[]> => {
  const response = await api.get(`/emr/${recordId}/prescriptions`);
  return response.data;
};

export const addVitalSigns = async (
    recordId: number,
    bloodPressure?: string,
    heartRate?: number,
    temperature?: number,
    weight?: number,
    height?: number
  ): Promise<VitalSigns> => {
    const response = await api.post(`/emr/${recordId}/vital-signs`, {
      bloodPressure,
      heartRate,
      temperature,
      weight,
      height,
    });
    return response.data;
  };

export const getVitalSignsByMedicalRecordId = async (recordId: number): Promise<VitalSigns[]> => {
  const response = await api.get(`/emr/${recordId}/vital-signs`);
  return response.data;
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
  const response = await api.get(`/emr/vitals/history/${patientId}${suffix}`);
  return response.data;
};

export const addAllergy = async (
    patientId: number,
    allergen: string,
    reaction: string,
    severity: string
  ): Promise<Allergy> => {
    const response = await api.post('/emr/allergies', {
      patientId,
      allergen,
      reaction,
      severity,
    });
    return response.data;
  };

export const getAllergiesByPatientId = async (patientId: number): Promise<Allergy[]> => {
  const response = await api.get(`/emr/allergies/${patientId}`);
  return response.data;
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

    const response = await api.get(`/emr/search?${params.toString()}`);
    return response.data;
  };

export const uploadDocument = async (recordId: number, file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('document', file);

    const response = await api.post(`/emr/${recordId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  };

export const getDocumentsForRecord = async (recordId: number): Promise<Document[]> => {
    const response = await api.get(`/emr/${recordId}/documents`);
    return response.data;
  };

export const getDocumentUrl = async (documentId: number): Promise<{ url: string; fileName: string }> => {
    const response = await api.get(`/emr/documents/${documentId}`);
    return response.data;
  };

export const getPrescriptionsByPatientId = async (patientId: number): Promise<Prescription[]> => {
    const response = await api.get<Prescription[]>(`/emr/patient/${patientId}/prescriptions`);
    return response.data;
  };

export const getPrescriptionsByPatientIdAndAdmissionId = async (patientId: number, admissionId: number): Promise<Prescription[]> => {
    const response = await api.get<Prescription[]>(`/emr/prescriptions/patient/${patientId}/admission/${admissionId}`);
    return response.data;
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
      const response = await api.get(`/emr/appointment/${appointmentId}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
};

// New function to search ICD-10 codes
export const searchIcd10Codes = async (searchTerm: string): Promise<any[]> => {
  const response = await api.get(`/emr/icd10-codes/search`, {
    params: { q: searchTerm },
  });
  return Array.isArray(response.data) ? response.data : [];
};
