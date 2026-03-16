// nhms-frontend/src/services/userService.ts

import api from '@/utils/api'; // Assuming you have an axios instance configured
import { User, Doctor } from '@/types/user'; // Adjust path as needed

interface ApiResponse<T> {
  message: string;
  data: T;
  total?: number;
}

const normalizeDoctor = (raw: any): Doctor => {
  const firstName = raw.first_name ?? raw.firstName ?? '';
  const middleName = raw.middle_name ?? raw.middleName ?? '';
  const lastName = raw.last_name ?? raw.lastName ?? '';
  const computedFullName = [firstName, middleName, lastName].filter(Boolean).join(' ').trim();

  return {
    user_id: raw.user_id ?? raw.userId ?? raw.id ?? 0,
    uuid: raw.uuid ?? '',
    nis_number: raw.nis_number ?? raw.nisNumber,
    email: raw.email ?? '',
    first_name: firstName,
    last_name: lastName,
    middle_name: middleName || undefined,
    phone: raw.phone,
    date_of_birth: raw.date_of_birth ?? raw.dateOfBirth,
    address_street: raw.address_street ?? raw.addressStreet,
    address_city: raw.address_city ?? raw.addressCity,
    address_state: raw.address_state ?? raw.addressState,
    address_zip_code: raw.address_zip_code ?? raw.addressZipCode,
    profile_picture_url: raw.profile_picture_url ?? raw.profilePictureUrl,
    preferred_communication_method: raw.preferred_communication_method ?? raw.preferredCommunicationMethod,
    accessibility_needs: raw.accessibility_needs ?? raw.accessibilityNeeds,
    is_active: raw.is_active ?? raw.isActive ?? true,
    created_at: raw.created_at ?? raw.createdAt,
    last_password_change_at: raw.last_password_change_at ?? raw.lastPasswordChangeAt,
    roles: raw.roles ?? [],
    patient_id: raw.patient_id ?? raw.patientId,
    fullName: raw.fullName ?? computedFullName,
    specialty: raw.specialty,
    license_number: raw.license_number ?? raw.licenseNumber,
  };
};

export const fetchDoctors = async (): Promise<Doctor[]> => {
  try {
    const response = await api.get<ApiResponse<Doctor[]> | Doctor[]>('/profile/doctors');
    const payload = Array.isArray(response.data)
      ? response.data
      : (response.data.data || []);
    return payload.map(normalizeDoctor);
  } catch (error: any) {
    console.error('Error fetching doctors:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch doctors');
  }
};

export const searchDoctors = async (searchTerm: string): Promise<User[]> => {
  try {
    const response = await api.get<any[]>(`/profile/doctors/search`, {
      params: { q: searchTerm }
    });
    return response.data.map(normalizeDoctor);
  } catch (error: any) {
    console.error('Error searching doctors:', error);
    throw new Error(error.response?.data?.message || 'Failed to search doctors');
  }
};

// Add other user-related service functions here as needed
