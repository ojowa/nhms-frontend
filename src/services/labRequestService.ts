'use client';

import { LabRequest, LabRequestCreationPayload } from '@/types/labRequest';
import { apiClient } from '@/utils/api-client';

interface UpdateLabRequestStatusPayload {
  status: LabRequest['status'];
}

/**
 * Creates a new lab request.
 * @param payload The data for creating the lab request.
 * @returns The newly created lab request.
 */
export const createLabRequest = async (payload: LabRequestCreationPayload): Promise<LabRequest> => {
  return apiClient.post<LabRequest>('/lab/requests', payload);
};

/**
 * Retrieves all pending lab requests for a specific doctor.
 * @param doctorId The ID of the doctor whose pending requests are to be retrieved.
 * @returns A list of pending lab requests.
 */
export const getPendingLabRequestsForDoctor = async (doctorId: number): Promise<LabRequest[]> => {
  return apiClient.get<LabRequest[]>(`/lab/requests/doctor/${doctorId}/pending`);
};

/**
 * Retrieves all lab requests with pagination and filtering.
 * @param page Page number (default: 1)
 * @param limit Items per page (default: 10)
 * @param status Optional status filter
 * @returns Paginated lab requests response
 */
export const getAllLabRequests = async (
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<{ requests: LabRequest[]; total: number }> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (status) params.append('status', status);
  
  return apiClient.get<{ requests: LabRequest[]; total: number }>(`/lab/requests?${params.toString()}`);
};

/**
 * Updates the status of a lab request.
 * @param labRequestId The ID of the lab request to update.
 * @param payload The new status data.
 * @returns The updated lab request.
 */
export const updateLabRequestStatus = async (
  labRequestId: number,
  payload: UpdateLabRequestStatusPayload
): Promise<LabRequest> => {
  return apiClient.patch<LabRequest>(`/lab/requests/${labRequestId}/status`, payload);
};

/**
 * Get lab request by ID
 * GET /lab/requests/:id
 */
export const getLabRequestById = async (labRequestId: number): Promise<LabRequest> => {
  return apiClient.get<LabRequest>(`/lab/requests/${labRequestId}`);
};

/**
 * Get lab requests by patient ID
 * GET /lab/requests/patient/:patientId
 */
export const getLabRequestsByPatientId = async (patientId: number): Promise<LabRequest[]> => {
  return apiClient.get<LabRequest[]>(`/lab/requests/patient/${patientId}`);
};

/**
 * Update lab request reason
 * PATCH /lab/requests/:id/reason
 */
export const updateLabRequestReason = async (
  labRequestId: number,
  reason: string
): Promise<LabRequest> => {
  return apiClient.patch<LabRequest>(`/lab/requests/${labRequestId}/reason`, { reason });
};
