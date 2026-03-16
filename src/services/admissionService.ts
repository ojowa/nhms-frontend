import api from '@/utils/api';
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

/**
 * Retrieves all currently admitted patients.
 * @returns An array of admitted patient records.
 */
export const getAdmittedPatients = async (requestingUserId: number): Promise<Admission[]> => {
  const response = await api.get<Admission[]>('/admissions/admitted', {
    params: { requestingUserId },
  });
  return response.data;
};

export const admissionService = {
  /**
   * Creates a new admission record.
   * @param payload - Data for creating the admission.
   * @returns The created admission.
   */
  createAdmission: async (payload: CreateAdmissionPayload): Promise<Admission> => {
    const response = await api.post<Admission>('/admissions', payload);
    return response.data;
  },

  /**
   * Retrieves an admission by its ID.
   * @param admissionId - The ID of the admission to retrieve.
   * @returns The admission details, or null if not found/authorized.
   */
  getAdmissionById: async (admissionId: string): Promise<Admission | null> => {
    const response = await api.get<Admission>(`/admissions/${admissionId}`);
    return response.data;
  },

  /**
   * Retrieves admissions for a specific patient.
   * @param patientId - The ID of the patient.
   * @returns An array of admission records.
   */
  getAdmissionsByPatientId: async (patientId: string): Promise<Admission[]> => {
    const response = await api.get<Admission[]>(`/admissions/patient/${patientId}`);
    return response.data;
  },

  getActiveAdmissionsByPatientIds: async (patientIds: number[]): Promise<ActiveAdmissionByPatient[]> => {
    const normalized = Array.from(new Set((patientIds || []).filter((id) => Number.isInteger(id) && id > 0)));
    if (normalized.length === 0) return [];
    const response = await api.get<ActiveAdmissionByPatient[]>('/admissions/active-by-patients', {
      params: { patientIds: normalized.join(',') },
    });
    return response.data;
  },

  /**
   * Updates the status of an admission (e.g., to 'Discharged').
   * @param admissionId - The ID of the admission to update.
   * @param payload - Data for updating the admission status.
   * @returns The updated admission.
   */
  updateAdmissionStatus: async (admissionId: string, payload: UpdateAdmissionStatusPayload): Promise<Admission> => {
    const response = await api.patch<Admission>(`/admissions/${admissionId}/status`, {
      status: payload.status || payload.newStatus,
      dischargeDate: payload.dischargeDate,
    });
    return response.data;
  },

  getInpatientClinicalNotes: async (admissionId: string): Promise<InpatientClinicalNote[]> => {
    const response = await api.get<InpatientClinicalNote[]>(`/admissions/${admissionId}/clinical-notes`);
    return response.data;
  },

  createInpatientClinicalNote: async (
    admissionId: string,
    payload: CreateInpatientClinicalNotePayload
  ): Promise<InpatientClinicalNote> => {
    const response = await api.post<InpatientClinicalNote>(
      `/admissions/${admissionId}/clinical-notes`,
      payload
    );
    return response.data;
  },

  getInpatientCareTransitions: async (admissionId: string): Promise<InpatientCareTransition[]> => {
    const response = await api.get<InpatientCareTransition[]>(
      `/admissions/${admissionId}/care-transitions`
    );
    return response.data;
  },

  createInpatientCareTransition: async (
    admissionId: string,
    payload: CreateInpatientCareTransitionPayload
  ): Promise<InpatientCareTransition> => {
    const response = await api.post<InpatientCareTransition>(
      `/admissions/${admissionId}/care-transitions`,
      payload
    );
    return response.data;
  },

  getInpatientTimeline: async (admissionId: string): Promise<InpatientTimelineEvent[]> => {
    const response = await api.get<InpatientTimelineEvent[]>(`/admissions/${admissionId}/timeline`);
    return response.data;
  },

  exportInpatientTimelineCsv: async (admissionId: string): Promise<Blob> => {
    const response = await api.get(`/admissions/${admissionId}/timeline/export`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};
