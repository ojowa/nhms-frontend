/**
 * Response transformers to normalize backend responses to frontend types
 * Handles snake_case to camelCase conversions and type mismatches
 */

import { Appointment } from '@/types/appointment';
import { LabAppointment, LabAppointmentStatus } from '@/types/labAppointment';
import { MedicalRecord } from '@/types/emr';
import { User } from '@/types/auth';

/**
 * Transform appointment response from backend snake_case to camelCase
 */
export const transformAppointment = (data: any): Appointment => {
  return {
    id: data.session_id || data.request_id || data.id,
    patientId: Number(data.patient_id ?? data.patientId),
    patientFirstName: data.patient_first_name ?? data.patientFirstName,
    patientMiddleName: data.patient_middle_name ?? data.patientMiddleName,
    patientLastName: data.patient_last_name ?? data.patientLastName,
    assignedDoctorId: data.assigned_doctor_id ?? data.assignedDoctorId,
    assignedDoctorFirstName: data.assigned_doctor_first_name ?? data.assignedDoctorFirstName,
    assignedDoctorLastName: data.assigned_doctor_last_name ?? data.assignedDoctorLastName,
    doctorName: data.doctor_name ?? data.doctorName,
    departmentId: data.department_id ?? data.departmentId,
    department: data.department,
    serviceType: data.service_type ?? data.serviceType,
    dateTime: (data.date_time || data.appointment_time || data.dateTime) ? (data.date_time || data.appointment_time || data.dateTime) : null,
    endTime: data.end_time || data.endTime ? (data.end_time || data.endTime) : null,
    status: data.status,
    reason: data.reason,
    notes: data.notes,
    meetingUrl: data.meeting_url ?? data.meetingUrl,
    createdAt: data.created_at || data.createdAt ? (data.created_at || data.createdAt) : undefined,
    vitalsSaved: data.vitals_saved ?? data.vitalsSaved,
    vitalStatus: data.vital_status ?? data.vitalStatus,
  };
};

/**
 * Transform lab appointment response from backend
 */
export const transformLabAppointment = (data: any): LabAppointment => {
  const appointment: Partial<Appointment> = transformAppointment(data);

  return {
    id: appointment.id || data.request_id || data.session_id,
    patientId: appointment.patientId ?? data.patient_id,
    patientFirstName: appointment.patientFirstName ?? data.patient_first_name,
    patientLastName: appointment.patientLastName ?? data.patient_last_name,
    serviceType: 'Lab Test Appointment',
    dateTime: appointment.dateTime ? new Date(appointment.dateTime) : new Date(),
    status: normalizeLabAppointmentStatus(data.status) as LabAppointmentStatus,
    reason: appointment.reason,
  };
};

/**
 * Transform user response from backend
 */
export const transformUser = (data: any): User => {
  return {
    userId: data.user_id ?? data.userId,
    uuid: data.uuid,
    patientId: Number(data.patient_id ?? data.patientId),
    email: data.email,
    roles: Array.isArray(data.roles) ? data.roles : (data.roles ? data.roles.split(',') : []),
    firstName: data.first_name ?? data.firstName,
    middleName: data.middle_name ?? data.middleName,
    lastName: data.last_name ?? data.lastName,
    nisNumber: data.nis_number ?? data.nisNumber,
    phone: data.phone,
    isActive: data.is_active, // ADDED THIS LINE
    patientType: data.patient_type ?? data.patientType,
    familyId: data.family_id ?? data.familyId,
    lastPasswordChangeAt: data.last_password_change_at ? new Date(data.last_password_change_at) : data.lastPasswordChangeAt,
  };
};

/**
 * Transform array of appointments
 */
export const transformAppointments = (data: any[]): Appointment[] => {
  return data.map(transformAppointment);
};

/**
 * Transform array of lab appointments
 */
export const transformLabAppointments = (data: any[]): LabAppointment[] => {
  return data.map(transformLabAppointment);
};

/**
 * Normalize appointment status values to PascalCase
 */
export const normalizeAppointmentStatus = (status: string): string => {
  const normalizations: { [key: string]: string } = {
    pending: 'Pending',
    approved: 'Approved',
    APPROVED: 'Approved',
    vitals_pending: 'VitalsPending',
    'vitals pending': 'VitalsPending',
    ready_for_consultation: 'ReadyForConsultation',
    'ready for consultation': 'ReadyForConsultation',
    in_consultation: 'InConsultation',
    'in consultation': 'InConsultation',
  };
  return normalizations[status.toLowerCase()] || status;
};

/**
 * Normalize lab appointment status values
 */
export const normalizeLabAppointmentStatus = (status: string): string => {
  const normalizations: { [key: string]: string } = {
    pending: 'Pending',
    approved: 'Approved',
    APPROVED: 'Approved',
    pending_sample_collection: 'PendingSampleCollection',
    'pending sample collection': 'PendingSampleCollection',
    sample_collected: 'SampleCollected',
    'sample collected': 'SampleCollected',
    processing: 'Processing',
  };
  return normalizations[status.toLowerCase()] || status;
};

/**
 * Generic transformer for pagination responses
 */
export const transformPaginatedResponse = (data: any, transformer: (item: any) => any) => {
  return {
    data: Array.isArray(data.data) ? data.data.map(transformer) : [],
    total: data.total || 0,
    page: data.page || 1,
    pageSize: data.pageSize || 10,
  };
};
