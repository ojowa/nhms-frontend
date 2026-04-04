import { apiClient } from '@/utils/api-client';
import { Consultation, BookConsultationPayload, ConsultationSessionDetails } from '@/types/consultation';
import { Doctor } from '@/types/userProfile';

export const getConsultations = async (): Promise<Consultation[]> => {
  return apiClient.get<Consultation[]>('/consultations');
};

export const getConsultationById = async (id: string): Promise<Consultation | null> => {
  return apiClient.get<Consultation>(`/consultations/${id}`);
};

export const cancelConsultation = async (id: string): Promise<void> => {
  await apiClient.delete<void>(`/consultations/${id}`);
};



export const finalizeConsultationSession = async (sessionId: string): Promise<void> => {
  await apiClient.patch<void>(`/consultations/${sessionId}/finalize`);
};

export const saveConsultationNotes = async (sessionId: string, doctorId: number, notesContent: string): Promise<void> => {
  await apiClient.post<void>(`/consultations/${sessionId}/notes`, { doctorId, notesContent });
};
