export interface Consultation {
  id: string; // Matches backend sessionId
  patientId: number;
  doctorId: number;
  doctorName: string;

  startTime: string;
  endTime: string | null;

  consultationType: 'Doctor Consultation' | 'Telemedicine Consultation';
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  notes: string;
  meetingUrl?: string;
}

export interface BookConsultationPayload {
  patientId: number;
  doctorId: number;
  consultationType: 'Doctor Consultation' | 'Telemedicine Consultation';
  appointmentDateTime: string; // ISO date string
  reason: string;
}

export interface ConsultationSessionDetails {
  sessionId: string;


  startTime: Date;
  endTime: Date | null;
  sessionType: 'Telemedicine' | 'Physical';
  notesContent: string | null;
}