export enum UserRole {
  Admin = 'Admin',
  Doctor = 'Doctor',
  Nurse = 'Nurse',
  LabStaff = 'LabStaff',
  RecordStaff = 'RecordStaff',
  Patient = 'Patient',
  Officer = 'Officer',
  FamilyMember = 'FamilyMember',
}

export interface User {
  userId: number; // Changed from string to number
  uuid: string;
  patientId?: number;
  userDepartmentId?: number; // Added for department staff key
  email: string;
  roles: string[];
  firstName: string;
  middleName?: string; // Added middleName
  lastName: string;
  nisNumber: string;
  phone: string;
  isActive: boolean; // CHANGED TO REQUIRED
  patientType?: string;
  familyId?: number;
  lastPasswordChangeAt?: Date;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'passwordHash'>;
}

export interface AuthCredentials {
  loginIdentifier: string;
  password?: string;
  isPatient?: boolean;
}
