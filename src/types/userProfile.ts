export interface EmergencyContact {
  contactId: number;
  userId: number;
  name: string;
  phone: string;
  relationship: string;
}

export interface UserProfile {
  userId: number;
  patientId: number;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  nisNumber: string;
  phone: string;
  dateOfBirth?: Date;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZipCode?: string;
  preferredCommunicationMethod?: string;
  accessibilityNeeds?: string;
  emergencyContacts?: EmergencyContact[];
}

export interface Doctor {
  userId: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string; // Added
  phone?: string; // Added
}
