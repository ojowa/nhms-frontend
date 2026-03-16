import api from '@/utils/api';
import { UserProfile, EmergencyContact, Doctor } from '@/types/userProfile'; // Added Doctor import

export const getUserProfile = async (id: number): Promise<UserProfile> => {
  const response = await api.get(`/profile/${id}`);
  return response.data;
};

export const updateUserProfile = async (id: number, profileData: Partial<UserProfile>): Promise<UserProfile> => {
  const response = await api.put(`/profile/${id}`, profileData);
  return response.data;
};

export const getEmergencyContacts = async (userId: number): Promise<EmergencyContact[]> => {
  const response = await api.get(`/profile/${userId}/emergency-contacts`);
  return response.data;
};

export const addEmergencyContact = async (userId: number, contactData: Partial<EmergencyContact>): Promise<EmergencyContact> => {
  const response = await api.post(`/profile/${userId}/emergency-contacts`, contactData);
  return response.data;
};

export const updateEmergencyContact = async (userId: number, contactId: number, contactData: Partial<EmergencyContact>): Promise<number> => {
  const response = await api.put(`/profile/${userId}/emergency-contacts/${contactId}`, contactData);
  return response.data;
};

export const deleteEmergencyContact = async (userId: number, contactId: number): Promise<void> => {
  await api.delete(`/profile/${userId}/emergency-contacts/${contactId}`);
};

export const getDoctors = async (): Promise<Doctor[]> => {
  const response = await api.get('/profile/doctors');
  return response.data;
};
