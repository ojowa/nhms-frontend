import api from '@/utils/api';
import { CreateMedicationAdministrationPayload, MedicationAdministration, GetMedicationAdministrationsFilters } from '@/types/medication';

export const medicationAdministrationService = {
  /**
   * Creates a new medication administration record.
   * @param payload - Data for creating the administration.
   * @returns The created medication administration.
   */
  createMedicationAdministration: async (payload: CreateMedicationAdministrationPayload): Promise<MedicationAdministration> => {
    const response = await api.post<MedicationAdministration>('/medication-administrations', payload);
    return response.data;
  },

  /**
   * Retrieves medication administration records based on various filters.
   * @param filters - An object containing filter criteria.
   * @returns An array of medication administration records.
   */
  getMedicationAdministrations: async (filters: GetMedicationAdministrationsFilters): Promise<MedicationAdministration[]> => {
    const response = await api.get<MedicationAdministration[]>('/medication-administrations', { params: filters });
    return response.data;
  },

  /**
   * Retrieves pending medication administrations for a specific nurse.
   * @param nurseId - The ID of the nurse.
   * @returns An array of pending medication administration records.
   */
  getPendingMedicationAdministrationsForNurse: async (nurseId: number): Promise<MedicationAdministration[]> => {
    const response = await api.get<MedicationAdministration[]>(`/medication-administrations/pending/nurse/${nurseId}`);
    return response.data;
  },
};
