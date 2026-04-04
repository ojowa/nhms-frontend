import { apiClient } from '@/utils/api-client';
import { UserProfile, EmergencyContact, Doctor } from '@/types/userProfile';

export const getUserProfile = async (id: number): Promise<UserProfile> => {
  return apiClient.get<UserProfile>(`/profile/${id}`);
};

export const updateUserProfile = async (id: number, profileData: Partial<UserProfile>): Promise<UserProfile> => {
  return apiClient.put<UserProfile>(`/profile/${id}`, profileData);
};

export const getEmergencyContacts = async (userId: number): Promise<EmergencyContact[]> => {
  return apiClient.get<EmergencyContact[]>(`/profile/${userId}/emergency-contacts`);
};

export const addEmergencyContact = async (userId: number, contactData: Partial<EmergencyContact>): Promise<EmergencyContact> => {
  return apiClient.post<EmergencyContact>(`/profile/${userId}/emergency-contacts`, contactData);
};

export const updateEmergencyContact = async (userId: number, contactId: number, contactData: Partial<EmergencyContact>): Promise<number> => {
  return apiClient.put<number>(`/profile/${userId}/emergency-contacts/${contactId}`, contactData);
};

export const deleteEmergencyContact = async (userId: number, contactId: number): Promise<void> => {
  await apiClient.delete<void>(`/profile/${userId}/emergency-contacts/${contactId}`);
};

export const getDoctors = async (): Promise<Doctor[]> => {
  return apiClient.get<Doctor[]>('/profile/doctors');
};
