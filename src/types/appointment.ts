/**
 * Appointment Types
 * Aligned with backend appointment.types.ts and validation schemas
 */

// Must match backend AppointmentType enum
export type AppointmentType = 'Doctor Consultation' | 'Telemedicine Consultation';

// Must match backend CanonicalAppointmentStatus
export type AppointmentStatus =
  | 'PENDING'
  | 'SCHEDULED'
  | 'ASSIGNED'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NOSHOW';

// Telemedicine types
export type TelemedicineType = 'VIDEO' | 'AUDIO' | 'CHAT';

// Appointment interface - matches backend Appointment type
export interface Appointment {
  id: string; // Can be sessionId (UUID) or requestId (number as string)
  patientId: number;
  patientFirstName?: string;
  patientMiddleName?: string;
  patientLastName?: string;
  assignedDoctorId?: number | null;
  assignedDoctorFirstName?: string;
  assignedDoctorLastName?: string;
  doctorName?: string; // Computed field
  departmentId?: number;
  department?: string;
  serviceType: AppointmentType;
  dateTime: string | null; // ISO date string
  endTime?: string | null; // ISO date string
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  meetingUrl?: string | null;
  createdAt?: string; // ISO date string
  vitalsSaved?: boolean;
  vitalStatus?: 'NOT_RECORDED' | 'RECORDED';
}

// Book appointment payload - matches backend BookAppointmentPayload
export interface BookAppointmentPayload {
  patientId: number;
  serviceType?: AppointmentType; // Preferred field name
  appointmentType?: AppointmentType; // For backward compatibility
  dateTime?: string; // ISO date string (preferred)
  appointmentDateTime?: string; // ISO date string (backward compatible)
  departmentId?: number | null;
  reason: string; // Required, max 500 chars
  notes?: string; // Optional, max 1000 chars
  telemedicineType?: TelemedicineType;
  doctorId?: number;
}

// Assign doctor payload - matches backend assignDoctorSchema
export interface AssignDoctorPayload {
  doctorId: number; // Must be positive integer
}

// Update status payload - matches backend updateAppointmentStatusSchema
export interface UpdateAppointmentStatusPayload {
  newStatus: AppointmentStatus;
}

// Query parameters for getting appointments
export interface GetAppointmentsParams {
  status?: AppointmentStatus | string;
  page?: number;
  limit?: number;
  serviceType?: AppointmentType;
  unassigned?: boolean;
}

// Paginated response
export interface PaginatedAppointments {
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Combined appointments response
export interface CombinedAppointmentsResponse {
  appointments: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
