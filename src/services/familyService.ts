import { FamilyMember, AddFamilyMemberPayload } from '@/types/family';
import { apiClient } from '@/utils/api-client';

export const addFamilyMember = async (officerUserId: number, familyMemberData: AddFamilyMemberPayload): Promise<FamilyMember> => {
  return apiClient.post<FamilyMember>('/family', { ...familyMemberData, officerUserId });
};



export const getFamilyMembersByOfficerId = async (): Promise<FamilyMember[]> => {
  return apiClient.get<FamilyMember[]>('/family');
};

export const getFamilyMemberById = async (familyId: number): Promise<FamilyMember> => {
  return apiClient.get<FamilyMember>(`/family/${familyId}`);
};

export const updateFamilyMember = async (familyId: number, familyMemberData: Partial<Omit<FamilyMember, 'familyId' | 'officerUserId'>>): Promise<FamilyMember> => {
  return apiClient.put<FamilyMember>(`/family/${familyId}`, familyMemberData);
};

export const deleteFamilyMember = async (familyId: number): Promise<void> => {
  await apiClient.delete<void>(`/family/${familyId}`);
};

export const resetFamilyMemberPassword = async (officerUserId: number, familyId: number, newPassword: string): Promise<void> => {
  await apiClient.put<void>(`/family/${familyId}/reset-password`, { officerUserId, newPassword });
};