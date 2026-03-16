import api from '@/utils/api';
import { CreateVitalSignPayload, VitalSign } from '@/types/vitals';

export const createVitalSign = async (payload: CreateVitalSignPayload): Promise<VitalSign> => {
    const response = await api.post<VitalSign>('/vitals', payload);
    return response.data;
};

export const getVitalSignsByPatientId = async (patientId: number): Promise<VitalSign[]> => {
    const response = await api.get<VitalSign[]>(`/vitals/patient/${patientId}`);
    return response.data;
};

export const getVitalSignsByAppointmentId = async (appointmentId: number): Promise<VitalSign[]> => {
    const response = await api.get<VitalSign[]>(`/vitals/appointment/${appointmentId}`);
    return response.data;
};
