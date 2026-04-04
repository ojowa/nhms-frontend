import { apiClient } from '@/utils/api-client';
import { CreateVitalSignPayload, VitalSign } from '@/types/vitals';

export const createVitalSign = async (payload: CreateVitalSignPayload): Promise<VitalSign> => {
  return apiClient.post<VitalSign>('/vitals', payload);
};

export const getVitalSignsByPatientId = async (patientId: number): Promise<VitalSign[]> => {
  return apiClient.get<VitalSign[]>(`/vitals/patient/${patientId}`);
};

export const getVitalSignsByAppointmentId = async (appointmentId: number): Promise<VitalSign[]> => {
  return apiClient.get<VitalSign[]>(`/vitals/appointment/${appointmentId}`);
};
