/**
 * Appointment Service
 * Aligned with backend appointments routes and validation schemas
 */

import { apiClient } from '@/utils/api-client';
import type {
  Appointment,
  BookAppointmentPayload,
  AppointmentStatus,
  AppointmentType,
  AssignDoctorPayload,
  UpdateAppointmentStatusPayload,
  GetAppointmentsParams,
  PaginatedAppointments,
  CombinedAppointmentsResponse,
} from '@/types/appointment';

/**
 * Book a new appointment
 * POST /api/appointments
 * 
 * Validation rules:
 * - patientId: required, positive integer
 * - reason: required, max 500 characters
 * - serviceType: 'Doctor Consultation' | 'Telemedicine Consultation'
 * - dateTime: ISO date string
 * - notes: optional, max 1000 characters
 * - departmentId: optional, positive integer
 * - doctorId: optional, positive integer
 * - telemedicineType: optional, 'VIDEO' | 'AUDIO' | 'CHAT'
 */
export const bookAppointment = async (payload: BookAppointmentPayload): Promise<Appointment> => {
  return apiClient.post<Appointment>('/appointments', payload);
};

/**
 * Get appointments by status
 * GET /api/appointments?status={status}&serviceType={type}&page={page}&limit={limit}
 * 
 * Roles: Patient, Officer, Nurse, Doctor, Admin, RecordStaff, LabStaff
 */
export const getAppointmentsByStatus = async (
  status: AppointmentStatus | string,
  params?: Omit<GetAppointmentsParams, 'status'>
): Promise<PaginatedAppointments> => {
  const queryParams = new URLSearchParams({
    status: status.toString(),
  });

  if (params?.serviceType) {
    queryParams.append('serviceType', params.serviceType);
  }
  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }

  return apiClient.get<PaginatedAppointments>(`/appointments?${queryParams.toString()}`);
};

/**
 * Get combined appointments (consultations + lab requests)
 * GET /api/appointments/combined?page={page}&limit={limit}&status={status}&serviceType={type}
 * 
 * Roles: Patient, Officer, Nurse, Doctor, Admin, RecordStaff, LabStaff
 */
export const getCombinedAppointments = async (
  params?: GetAppointmentsParams
): Promise<CombinedAppointmentsResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  if (params?.status) {
    queryParams.append('status', params.status.toString());
  }
  if (params?.serviceType) {
    queryParams.append('serviceType', params.serviceType);
  }

  return apiClient.get<CombinedAppointmentsResponse>(`/appointments/combined?${queryParams.toString()}`);
};

/**
 * Get appointment by ID
 * GET /api/appointments/{appointmentId}
 * 
 * Roles: Patient, Officer, Nurse, Doctor
 */
export const getAppointment = async (appointmentId: number): Promise<Appointment> => {
  return apiClient.get<Appointment>(`/appointments/${appointmentId}`);
};

/**
 * Get appointments for nurse assignment
 * GET /api/appointments/for-assignment
 * 
 * Roles: Nurse, Admin
 */
export const getAppointmentsForNurseAssignment = async (): Promise<Appointment[]> => {
  return apiClient.get<Appointment[]>('/appointments/for-assignment');
};

/**
 * Get assigned appointments for RecordStaff
 * GET /api/appointments/assigned?page={page}&limit={limit}
 * 
 * Roles: Admin, RecordStaff
 */
export const getAssignedAppointments = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedAppointments> => {
  return apiClient.get<PaginatedAppointments>(`/appointments/assigned?page=${page}&limit=${limit}`);
};

/**
 * Assign doctor to appointment
 * POST /api/appointments/{appointmentId}/assign-doctor
 * 
 * Validation rules:
 * - doctorId: required, positive integer
 * 
 * Roles: Admin, RecordStaff
 */
export const assignDoctorToAppointment = async (
  appointmentId: number,
  payload: AssignDoctorPayload
): Promise<{ message: string }> => {
  return apiClient.post<{ message: string }>(
    `/appointments/${appointmentId}/assign-doctor`,
    payload
  );
};

/**
 * Update appointment status
 * PUT /api/appointments/{appointmentId}/status
 * 
 * Validation rules:
 * - newStatus: required, valid AppointmentStatus
 * 
 * Roles: Nurse, Admin, Doctor, RecordStaff
 */
export const updateAppointmentStatus = async (
  appointmentId: number,
  payload: UpdateAppointmentStatusPayload
): Promise<Appointment> => {
  return apiClient.put<Appointment>(
    `/appointments/${appointmentId}/status`,
    payload
  );
};

/**
 * Get unassigned appointments
 * GET /api/appointments?unassigned=true
 * 
 * Roles: RecordStaff
 */
export const getUnassignedAppointments = async (): Promise<Appointment[]> => {
  return apiClient.get<Appointment[]>('/appointments?unassigned=true');
};

/**
 * Get appointments requiring vitals collection
 * GET /api/appointments?status=SCHEDULED,ASSIGNED
 * 
 * Roles: Nurse
 */
export const getAppointmentsRequiringVitals = async (): Promise<Appointment[]> => {
  const queryParams = new URLSearchParams({
    status: 'SCHEDULED,ASSIGNED',
  });
  return apiClient.get<Appointment[]>(`/appointments?${queryParams.toString()}`);
};

/**
 * Get all appointments for RecordStaff
 * GET /api/appointments
 * 
 * Roles: RecordStaff
 */
export const getAllAppointmentsForRecordStaff = async (
  params?: GetAppointmentsParams
): Promise<PaginatedAppointments> => {
  const queryParams = new URLSearchParams();

  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  if (params?.status) {
    queryParams.append('status', params.status.toString());
  }

  return apiClient.get<PaginatedAppointments>(`/appointments?${queryParams.toString()}`);
};

// Alias for backward compatibility
export const getAppointmentsByStatuses = async (
  statuses: string[],
  params?: Omit<GetAppointmentsParams, 'status'>
): Promise<Appointment[]> => {
  const queryParams = new URLSearchParams({
    status: statuses.join(','),
  });

  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }

  return apiClient.get<Appointment[]>(`/appointments?${queryParams.toString()}`);
};

// Alias for backward compatibility
export const getAssignedAppointmentsForRecordStaff = getAssignedAppointments;

// Alias for backward compatibility
export const getUnassignedAppointmentsForRecordStaff = getUnassignedAppointments;
