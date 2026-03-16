// nhms-frontend/src/services/dischargeService.ts

import api from '@/utils/api';
import { Appointment } from '@/types/appointment'; // Assuming you have an Appointment type
import { DischargeSummaryPayload, DischargeSummary } from '@/types/discharge'; // These types will be created

export const createDischargeSummary = async (payload: DischargeSummaryPayload): Promise<DischargeSummary> => {
  const response = await api.post('/discharge/discharge-summary', payload);
  return response.data;
};

export const dischargePatient = async (admissionId: number): Promise<any> => {
  const response = await api.post(`/discharge/discharge/${admissionId}`);
  return response.data;
};

// You might need a service to fetch admissions for a doctor
// This can be part of admissionService or a new one. For now, assuming it exists.
// import { getAdmissionsForDoctor } from './admissionService'; // Example
