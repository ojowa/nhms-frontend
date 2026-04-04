export interface User {
  userId: number;
  uuid: string;
  email: string;
  roles: string[];
  firstName: string;
  middleName?: string;
  lastName: string;
  gender?: 'Male' | 'Female' | 'Other' | null;
  nisNumber: string;
  phone: string;
  isActive: boolean;
  patientId?: number;
  // Add other user properties relevant for admin view
}

export interface Role {
  roleId: number;
  roleName: string;
}

export interface CreateUserPayload {
  email: string;
  password:string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender?: 'Male' | 'Female' | 'Other' | null;
  nisNumber: string;
  phone: string;
  roles: string[];
  patientType?: string;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
}

export interface LoggedInUser {
  userId: number;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  roles: string[];
  activeSessionCount: number;
  latestSessionExpiry: string;
}

export interface PaginatedLoggedInUsers {
  users: LoggedInUser[];
  total: number;
}

export interface PaginatedRoles {
  roles: Role[];
  total: number;
}

export interface PatientSearchResult {
  patientId: number;
  firstName: string;
  lastName: string;
}

