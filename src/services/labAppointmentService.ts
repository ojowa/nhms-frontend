import labApi from '@/utils/labApi';
import { BookLabAppointmentPayload, LabAppointment } from '@/types/labAppointment';
import { transformLabAppointment, transformLabAppointments } from '@/utils/responseTransformers';
import { LabRequestCreationPayload, LabRequest } from '@/types/labRequest';

export const bookLabAppointment = async (payload: BookLabAppointmentPayload): Promise<LabAppointment> => {
  const response = await labApi.post<LabAppointment>('/lab-requests/book-now', payload);
  return transformLabAppointment(response.data);
};

export const getLabAppointments = async (): Promise<LabAppointment[]> => {
    const response = await labApi.get<LabAppointment[]>(`/lab-requests`);
    return transformLabAppointments(response.data);
};

export const getLabQueue = async (): Promise<LabAppointment[]> => {
    const response = await labApi.get<LabAppointment[]>('/lab-requests/doctor/:doctor_id/pending');
    return transformLabAppointments(response.data);
};
