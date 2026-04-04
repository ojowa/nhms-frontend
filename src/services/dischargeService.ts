// nhms-frontend/src/services/dischargeService.ts

import { apiClient } from '@/utils/api-client';
import { DischargeSummaryPayload, DischargeSummary } from '@/types/discharge';

export const createDischargeSummary = async (payload: DischargeSummaryPayload): Promise<DischargeSummary> => {
  return apiClient.post<DischargeSummary>('/discharge/discharge-summary', payload);
};

export const dischargePatient = async (admissionId: number): Promise<any> => {
  return apiClient.post<any>(`/discharge/discharge/${admissionId}`);
};
