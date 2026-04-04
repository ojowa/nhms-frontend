export type AppointmentType = 'Lab Test Appointment';

export type LabAppointmentStatus = 'PENDING' | 'Scheduled' | 'PENDING_SAMPLE_COLLECTION' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface LabAppointment {
  id: number; 
  patientId: number;
  patientFirstName?: string; // Added for display in lab queue/dashboard
  patientLastName?: string; // Added for display in lab queue/dashboard
  serviceType: AppointmentType;
  dateTime: Date; 
  status: LabAppointmentStatus; // Use new type
  reason?: string;
}

export interface BookLabAppointmentPayload {
  patientId: number;
  appointmentType: AppointmentType;
  appointmentDateTime: Date; // ISO date string
  reason: string;
}
