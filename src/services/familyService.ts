import api from '@/utils/api';
import { FamilyMember, AddFamilyMemberPayload } from '@/types/family';

export const addFamilyMember = async (officerUserId: number, familyMemberData: AddFamilyMemberPayload): Promise<FamilyMember> => {
  const response = await api.post('/family', { ...familyMemberData, officerUserId });
  return response.data;
};



export const getFamilyMembersByOfficerId = async (): Promise<FamilyMember[]> => {
  const response = await api.get('/family');
  return response.data;
};

export const getFamilyMemberById = async (familyId: number): Promise<FamilyMember> => {
  const response = await api.get(`/family/${familyId}`);
  return response.data;
};

export const updateFamilyMember = async (familyId: number, familyMemberData: Partial<Omit<FamilyMember, 'familyId' | 'officerUserId'>>): Promise<FamilyMember> => {
  const response = await api.put(`/family/${familyId}`, familyMemberData);
  return response.data;
};

export const deleteFamilyMember = async (familyId: number): Promise<void> => {
  await api.delete(`/family/${familyId}`);
};

export const resetFamilyMemberPassword = async (officerUserId: number, familyId: number, newPassword: string): Promise<void> => {
  await api.put(`/family/${familyId}/reset-password`, { officerUserId, newPassword });
};