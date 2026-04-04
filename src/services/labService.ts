import { apiClient } from '@/utils/api-client';
import { LabRequest, LabRequestCreationPayload } from '@/types/labRequest';
import { LabResult, LabResultCreationPayload } from '@/types/labResult';

// Lab Request Service Calls
export const getPendingLabRequestsForDoctor = async (doctorId: number): Promise<LabRequest[]> => {
  return apiClient.get<LabRequest[]>(`/lab-requests/doctor/${doctorId}/pending`);
};

export const updateLabRequestStatus = async (
  labRequestId: number,
  newStatus: LabRequest['status'],
  updatingUserId: number
): Promise<LabRequest> => {
  return apiClient.patch<LabRequest>(`/lab-requests/${labRequestId}/status`, { new_status: newStatus, updatingUserId });
};

export const createLabRequest = async (payload: LabRequestCreationPayload): Promise<LabRequest> => {
  return apiClient.post<LabRequest>('/lab-requests', payload);
};

export const createLabResult = async (payload: LabResultCreationPayload): Promise<LabResult> => {
  return apiClient.post<LabResult>(`/lab-results`, payload);
};

export const updateLabResultStatusAndReviewers = async (
  labResultId: string,
  status: LabResult['status'],
  statusNotes: string | undefined,
  reviewedByUserId: string | undefined,
  approvedByUserId: string | undefined,
  updatingUserId: string
): Promise<LabResult> => {
  return apiClient.patch<LabResult>(`/lab-results/${labResultId}/status-review`, {
    status,
    status_notes: statusNotes,
    reviewed_by_user_id: reviewedByUserId,
    approved_by_user_id: approvedByUserId,
    updatingUserId,
  });
};

export const getLabResultsByLabRequest = async (labRequestId: number, requestingUserId: number): Promise<LabResult[]> => {
  return apiClient.get<LabResult[]>(`/lab-requests/${labRequestId}/results`, { data: { requestingUserId } });
};

export const getLabRequestsForLabStaff = async (labStaffId: number): Promise<LabRequest[]> => {
  return apiClient.get<LabRequest[]>(`/lab-requests`);
};

export const getLabResultsByPatientId = async (patientId: number, requestingUserId: number): Promise<LabResult[]> => {
  const response = await apiClient.get<any>(`/lab-results/patient/${patientId}`, { data: { requestingUserId } });
  const payload = response as any;
  if (Array.isArray(payload)) return payload as LabResult[];
  if (Array.isArray(payload?.data)) return payload.data as LabResult[];
  if (Array.isArray(payload?.results)) return payload.results as LabResult[];
  return [];
};

export const getReviewableLabResults = async (): Promise<LabResult[]> => {
  return apiClient.get<LabResult[]>(`/lab-results/reviewable`);
};
