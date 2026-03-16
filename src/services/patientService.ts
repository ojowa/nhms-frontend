// nhms-frontend/src/services/patientService.ts

import api from '@/utils/api'; // Assuming you have an axios instance configured
import { User } from '@/types/user'; // Assuming User type is defined

interface PatientSearchResult {
  patientId: number;
  firstName: string;
  lastName: string;
  email: string;
  nisNumber?: string;
  userId: number;
}

export const searchPatients = async (searchTerm: string): Promise<PatientSearchResult[]> => {
  try {
    const response = await api.get<PatientSearchResult[]>(`/patients/search`, {
      params: { q: searchTerm }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error searching patients:', error);
    throw new Error(error.response?.data?.message || 'Failed to search patients');
  }
};

// Add other patient-related service functions here as needed
