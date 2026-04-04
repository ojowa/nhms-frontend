/**
 * Authentication Types
 * Aligned with backend validation schemas and response format
 */

export enum UserRole {
  Admin = 'Admin',
  Doctor = 'Doctor',
  Nurse = 'Nurse',
  LabStaff = 'LabStaff',
  RecordStaff = 'RecordStaff',
  Patient = 'Patient',
  Officer = 'Officer',
  FamilyMember = 'FamilyMember',
  Pharmacist = 'Pharmacist',
}

export interface User {
  userId: number;
  uuid: string;
  patientId?: number;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  nisNumber: string;
  phone: string;
  roles: UserRole[];
  isActive?: boolean;
  patientType?: string;
  familyId?: number;
  lastPasswordChangeAt?: string; // ISO date string
}

export interface AuthUser extends User {
  profile?: UserProfile;
}

// Backend response format for login/register
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Login request - matches backend loginSchema
export interface LoginRequest {
  loginIdentifier: string; // Can be email or NIS number
  password: string;
}

// Alias for compatibility with AuthContext
export type AuthCredentials = LoginRequest;

// Register request - matches backend registerSchema
export interface RegisterRequest {
  nisNumber: string; // min 6 characters
  email: string; // valid email format
  password: string; // min 8 characters
  firstName: string; // min 1, max 50
  middleName?: string; // max 50
  lastName: string; // min 1, max 50
  phone: string; // valid phone format
}

// Password reset request - matches backend forgotPasswordSchema
export interface ForgotPasswordRequest {
  emailOrNisNumber: string;
}

// Password reset confirmation - matches backend resetPasswordSchema
export interface ResetPasswordRequest {
  token: string;
  newPassword: string; // min 8 characters
}

// Refresh token request - matches backend refreshTokenSchema
export interface RefreshTokenRequest {
  refreshToken: string; // UUID format
}

// User profile - matches backend userProfile types
export interface UserProfile {
  userId: number;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string; // ISO date
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  profileImageUrl?: string;
  emergencyContacts?: EmergencyContact[];
  patientId?: number;
  departmentId?: number;
  lastPasswordChangeAt?: string; // ISO date
}

export interface EmergencyContact {
  id?: number;
  userId: number;
  name: string;
  phone: string;
  relationship: string;
}

// Validation error from backend
export interface ValidationError {
  field: string;
  message: string;
}

// API Error response
export interface ApiErrorResponse {
  success: false;
  error: string;
  errors?: ValidationError[];
  timestamp: string;
  requestId?: string;
}

// API Success response
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
  requestId?: string;
}

// Generic API response (union type)
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
