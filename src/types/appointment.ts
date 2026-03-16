export type AppointmentType = 'Doctor Consultation' | 'Telemedicine Consultation' | 'Lab Test Appointment';
export type AppointmentStatus =
  | 'SCHEDULED'
  | 'ASSIGNED'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'Scheduled'
  | 'Assigned'
  | 'Completed'
  | 'Cancelled';

export interface Appointment {
  id: string; // Unique ID, can be sessionId (UUID) or requestId (number as string)
  patientId: number;
  patientFirstName?: string; // New field for patient's first name
  patientMiddleName?: string; // Added field for patient's middle name
  patientLastName?: string;  // New field for patient's last name
  assignedDoctorId?: number | null; // New field for assigned doctor's ID
  doctorId?: number; // Changed from number to string (UUID), and made optional
  assignedDoctorFirstName?: string; // New field
  assignedDoctorLastName?: string; // New field
  doctorName?: string; // Optional, might not be present for lab tests
  departmentId?: number; // Optional, might not be present for lab tests
  department?: string; // Optional, might not be present for lab tests
  serviceType: AppointmentType; // Unifies consultationType and testType
  dateTime: Date | null; // Unified start time/request date (ISO string)
  endTime?: Date | null; // From consultations, optional
  status: AppointmentStatus;
  reason?: string;
  notes?: string; // From consultations, optional
  meetingUrl?: string | null; // From consultations, optional
  vitalsSaved?: boolean; // To indicate if vitals are saved for this appointment
  vitalStatus?: 'NOT_RECORDED' | 'RECORDED';
  createdAt?: Date; // New field
}

export interface BookAppointmentPayload {
  patientId: number;
  appointmentType: AppointmentType;
  appointmentDateTime: Date; // ISO date string
  departmentId?: number;
  reason: string;
  notes?: string;
  telemedicineType?: 'VIDEO' | 'AUDIO' | 'CHAT';
  doctorId?: number; // Added doctorId
}
