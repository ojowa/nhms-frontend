// nhms-frontend/src/services/vitalsService.ts

import api from '@/utils/api';
import { CreateVitalSignPayload, VitalSign } from '@/types/vitals'; // Assuming you have a Vitals type

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const createVitalSign = async (payload: CreateVitalSignPayload): Promise<VitalSign> => {
  try {
    const response = await api.post<ApiResponse<VitalSign>>('/vitals', payload);
    const responseData: any = response.data;
    return (responseData?.data ?? responseData) as VitalSign;
  } catch (error: any) {
    console.error('Error creating vital sign:', error);
    throw new Error(error.response?.data?.message || 'Failed to create vital sign');
  }
};

export const getVitalSignsByAppointmentId = async (appointmentId: number): Promise<VitalSign[]> => {
  try {
    const response = await api.get<ApiResponse<VitalSign[]>>(`/vitals/appointment/${appointmentId}`);
    const payload: any = response.data;
    if (Array.isArray(payload)) {
      return payload as VitalSign[];
    }
    if (Array.isArray(payload?.data)) {
      return payload.data as VitalSign[];
    }
    return [];
  } catch (error: any) {
    console.error('Error fetching vital signs by appointment ID:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch vital signs');
  }
};

// Add other vital sign related service functions here as needed
