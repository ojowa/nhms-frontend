import api from '@/utils/api';
import { Consultation, BookConsultationPayload, ConsultationSessionDetails } from '@/types/consultation';
import { Doctor } from '@/types/userProfile';

export const getConsultations = async (): Promise<Consultation[]> => {
  const response = await api.get('/consultations');
  return response.data;
};

export const getConsultationById = async (id: string): Promise<Consultation | null> => {
  const response = await api.get(`/consultations/${id}`);
  return response.data;
};

export const cancelConsultation = async (id: string): Promise<void> => {
  await api.delete(`/consultations/${id}`);
};



export const finalizeConsultationSession = async (sessionId: string): Promise<void> => {
  await api.patch(`/consultations/${sessionId}/finalize`);
};

export const saveConsultationNotes = async (sessionId: string, doctorId: number, notesContent: string): Promise<void> => {
  await api.post(`/consultations/${sessionId}/notes`, { doctorId, notesContent });
};
