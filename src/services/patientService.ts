// nhms-frontend/src/services/patientService.ts

import { apiClient } from '@/utils/api-client';
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
  return apiClient.get<PatientSearchResult[]>(`/patients/search`, {
    params: { q: searchTerm }
  });
};

// Add other patient-related service functions here as needed
