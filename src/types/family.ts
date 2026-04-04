export interface FamilyMember {
  familyId: number;
  officerUserId: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  relationship: string;
  dateOfBirth: Date;
    userId?: number; 
    patientId?: number;  // Add other family member properties as needed
}

export interface AddFamilyMemberPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  relationship: string;
  dateOfBirth: Date;
  email: string;
  password: string;
}
