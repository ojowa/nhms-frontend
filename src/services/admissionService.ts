import {
  Admission,
  ActiveAdmissionByPatient,
  CreateAdmissionPayload,
  CreateInpatientCareTransitionPayload,
  CreateInpatientClinicalNotePayload,
  InpatientCareTransition,
  InpatientClinicalNote,
  InpatientTimelineEvent,
  UpdateAdmissionStatusPayload,
} from '@/types/admission';
import { apiClient } from '@/utils/api-client';

/**
 * Retrieves all currently admitted patients.
 * @returns An array of admitted patient records.
 */
export const getAdmittedPatients = async (): Promise<Admission[]> => {
  return apiClient.get<Admission[]>('/admissions/admitted');
};

export const admissionService = {
  /**
   * Creates a new admission record.
   * @param payload - Data for creating the admission.
   * @returns The created admission.
   */
  createAdmission: async (payload: CreateAdmissionPayload): Promise<Admission> => {
    return apiClient.post<Admission>('/admissions', payload);
  },

  /**
   * Retrieves an admission by its ID.
   * @param admissionId - The ID of the admission to retrieve.
   * @returns The admission details, or null if not found/authorized.
   */
  getAdmissionById: async (admissionId: string): Promise<Admission | null> => {
    return apiClient.get<Admission>(`/admissions/${admissionId}`);
  },

  /**
   * Retrieves admissions for a specific patient.
   * @param patientId - The ID of the patient.
   * @returns An array of admission records.
   */
  getAdmissionsByPatientId: async (patientId: string): Promise<Admission[]> => {
    return apiClient.get<Admission[]>(`/admissions/patient/${patientId}`);
  },

  getActiveAdmissionsByPatientIds: async (patientIds: number[]): Promise<ActiveAdmissionByPatient[]> => {
    const normalized = Array.from(new Set((patientIds || []).filter((id) => Number.isInteger(id) && id > 0)));
    if (normalized.length === 0) return [];
    return apiClient.get<ActiveAdmissionByPatient[]>('/admissions/active-by-patients', {
      params: { patientIds: normalized.join(',') },
    });
  },

  /**
   * Updates the status of an admission (e.g., to 'Discharged').
   * @param admissionId - The ID of the admission to update.
   * @param payload - Data for updating the admission status.
   * @returns The updated admission.
   */
  updateAdmissionStatus: async (admissionId: string, payload: UpdateAdmissionStatusPayload): Promise<Admission> => {
    return apiClient.patch<Admission>(`/admissions/${admissionId}/status`, {
      status: payload.status || payload.newStatus,
      dischargeDate: payload.dischargeDate,
    });
  },

  getInpatientClinicalNotes: async (admissionId: string): Promise<InpatientClinicalNote[]> => {
    return apiClient.get<InpatientClinicalNote[]>(`/admissions/${admissionId}/clinical-notes`);
  },

  createInpatientClinicalNote: async (
    admissionId: string,
    payload: CreateInpatientClinicalNotePayload
  ): Promise<InpatientClinicalNote> => {
    return apiClient.post<InpatientClinicalNote>(
      `/admissions/${admissionId}/clinical-notes`,
      payload
    );
  },

  getInpatientCareTransitions: async (admissionId: string): Promise<InpatientCareTransition[]> => {
    return apiClient.get<InpatientCareTransition[]>(
      `/admissions/${admissionId}/care-transitions`
    );
  },

  createInpatientCareTransition: async (
    admissionId: string,
    payload: CreateInpatientCareTransitionPayload
  ): Promise<InpatientCareTransition> => {
    return apiClient.post<InpatientCareTransition>(
      `/admissions/${admissionId}/care-transitions`,
      payload
    );
  },

  getInpatientTimeline: async (admissionId: string): Promise<InpatientTimelineEvent[]> => {
    return apiClient.get<InpatientTimelineEvent[]>(`/admissions/${admissionId}/timeline`);
  },

  exportInpatientTimelineCsv: async (admissionId: string): Promise<Blob> => {
    return apiClient.download(`/admissions/${admissionId}/timeline/export`);
  },
};
