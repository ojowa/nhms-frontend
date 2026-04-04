// nhms-frontend/src/types/user.ts

export interface User {
  user_id: number;
  uuid: string;
  nis_number?: string;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone?: string;
  date_of_birth?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip_code?: string;
  profile_picture_url?: string;
  preferred_communication_method?: string;
  accessibility_needs?: string;
  is_active: boolean;
  created_at?: string;
  last_password_change_at?: string;
  roles: string[]; // Array of role names, e.g., ['Admin', 'Doctor']
  patient_id?: number; // Added patient_id for users who are also patients
}

export interface Doctor extends User {
  // Doctors might have specific fields, e.g., specialty, license number
  specialty?: string;
  license_number?: string;
  fullName?: string; // Added fullName for convenience
}
