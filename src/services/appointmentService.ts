import api from '@/utils/api';
import { Appointment, BookAppointmentPayload, AppointmentStatus, AppointmentType } from '@/types/appointment'; // Assuming you create this type in frontend/src/types
import { transformAppointment, transformAppointments, normalizeAppointmentStatus } from '@/utils/responseTransformers';

export const bookAppointment = async (payload: BookAppointmentPayload): Promise<Appointment> => {
  // Normalize payload to backend format
  const normalizedPayload = {
    patientId: payload.patientId,
    serviceType: payload.appointmentType, // Map appointmentType to serviceType
    dateTime: payload.appointmentDateTime, // Map appointmentDateTime to dateTime
    departmentId: payload.departmentId,
    reason: payload.reason,
    notes: payload.notes,
    telemedicineType: payload.telemedicineType,
  };
  const response = await api.post('/appointments', normalizedPayload);
  return transformAppointment(response.data);
};

export const getAppointmentsByStatus = async (status: AppointmentStatus, serviceType?: AppointmentType): Promise<Appointment[]> => {
  let url = `/appointments?status=${status}`;
  if (serviceType) {
    url += `&serviceType=${serviceType}`;
  }
  const response = await api.get(url);
  return transformAppointments(Array.isArray(response.data) ? response.data : response.data.data || []);
};

export const getAppointmentsByStatuses = async (
  statuses: string[],
  serviceType?: AppointmentType
): Promise<Appointment[]> => {
  const statusCsv = statuses.map((s) => s.trim()).filter(Boolean).join(',');
  let url = `/appointments?status=${statusCsv}`;
  if (serviceType) {
    url += `&serviceType=${serviceType}`;
  }
  const response = await api.get(url);
  return transformAppointments(Array.isArray(response.data) ? response.data : response.data.data || []);
};

export const getCombinedAppointments = async (status?: string, serviceType?: AppointmentType, page: number = 1, limit: number = 10): Promise<{ data: Appointment[]; total: number }> => {
  let url = `/appointments/combined?page=${page}&limit=${limit}`;
  if (status) {
    url += `&status=${status}`;
  }
  if (serviceType) {
    url += `&serviceType=${serviceType}`;
  }
  const response = await api.get(url);
  return response.data; // Backend already returns { data, total }
};

export const getAppointment = async (appointmentId: number): Promise<Appointment> => {
  const response = await api.get(`/appointments/${appointmentId}`);
  return transformAppointment(response.data);
};

export const getAppointmentsRequiringVitals = async (): Promise<Appointment[]> => {
  // Nurses collect vitals on scheduled or assigned appointments.
  return getAppointmentsByStatuses(['SCHEDULED', 'ASSIGNED']);
};

export const getAllAppointmentsForRecordStaff = async (): Promise<Appointment[]> => {
  // Assuming a backend endpoint exists or will be created to fetch all appointments for RecordStaff
  // For now, we can use the existing /appointments endpoint and rely on backend RBAC to filter
  const response = await api.get('/appointments');
  return transformAppointments(Array.isArray(response.data) ? response.data : response.data.data || []);
};



export const updateAppointmentStatus = async (appointmentId: number, newStatus: AppointmentStatus): Promise<Appointment> => {
  const response = await api.put(`/appointments/${appointmentId}/status`, { newStatus });
  return transformAppointment(response.data);
};

export const getAppointmentsForNurseAssignment = async (): Promise<Appointment[]> => {
  const response = await api.get('/appointments/for-assignment');
  return transformAppointments(Array.isArray(response.data) ? response.data : response.data.data || []);
};

export const assignDoctorToAppointment = async (appointmentId: number, doctorId: number): Promise<void> => {
  await api.post(`/appointments/${appointmentId}/assign-doctor`, { doctorId });
};

export const getUnassignedAppointmentsForRecordStaff = async (): Promise<Appointment[]> => {
  const response = await api.get('/appointments?unassigned=true');
  return transformAppointments(Array.isArray(response.data) ? response.data : response.data.data || []);
};

export const getAssignedAppointmentsForRecordStaff = async (page: number = 1, limit: number = 10): Promise<{ data: Appointment[]; total: number }> => {
  const response = await api.get(`/appointments/assigned?page=${page}&limit=${limit}`);
  return response.data; // Backend already returns { data, total }
};
