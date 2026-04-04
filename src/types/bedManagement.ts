export type BedStatus = 'Available' | 'Occupied' | 'Maintenance' | 'Cleaning';

export interface Ward {
  wardId: number;
  departmentId?: number | null;
  departmentName?: string | null;
  name: string;
  genderRestriction: 'Male' | 'Female' | 'Mixed';
  capacity: number;
}

export interface CreateWardPayload {
  departmentId?: number | null;
  name: string;
  genderRestriction: 'Male' | 'Female' | 'Mixed';
  capacity: number;
}

export interface UpdateWardPayload extends CreateWardPayload {
  wardId: number;
}

export interface Bed {
  bedId: number;
  wardId: number;
  bedNumber: string;
  status: BedStatus;
}

export interface WardOccupancyBed extends Bed {
  admissionId?: number | null;
  patientId?: number | null;
  patientFirstName?: string | null;
  patientLastName?: string | null;
}

export interface PendingAdmission {
  admissionId: number;
  patientId: number;
  patientFirstName: string;
  patientLastName: string;
  doctorFirstName: string;
  doctorLastName: string;
  admissionDate: string;
  departmentId?: number | null;
  departmentName?: string | null;
  status: string;
  wardId?: number | null;
  bedId?: number | null;
}

export interface AdmissionBedAssignment {
  admissionId: number;
  patientId: number;
  wardId?: number | null;
  bedId?: number | null;
  status: string;
}
