'use client';

import { LabRequest, LabRequestCreationPayload } from '@/types/labRequest';
import api from '@/utils/api';

// Reusing the same interface for status update from the existing code
interface UpdateLabRequestStatusPayload {
  status: LabRequest['status'];
}

/**
 * Creates a new lab request.
 * @param payload The data for creating the lab request.
 * @returns The newly created lab request.
 */
export const createLabRequest = async (payload: LabRequestCreationPayload): Promise<LabRequest> => {
  const response = await api.post<LabRequest>('/lab/requests', payload);
  return response.data;
};

/**
 * Retrieves all pending lab requests for a specific doctor.
 * @param doctorId The ID of the doctor whose pending requests are to be retrieved.
 * @returns A list of pending lab requests.
 */
export const getPendingLabRequestsForDoctor = async (doctorId: number): Promise<LabRequest[]> => {
  const response = await api.get<LabRequest[]>(`/lab/requests/doctor/${doctorId}/pending`);
  return response.data;
};

/**
 * Gets a lab request by its ID.
 * @param labRequestId The ID of the lab request.
 * @returns The lab request, or null if not found.
 */
export const getLabRequestById = async (labRequestId: number): Promise<LabRequest> => {
  const response = await api.get<LabRequest>(`/lab/requests/${labRequestId}`);
  return response.data;
};

/**
 * Gets all lab requests for a specific patient with pagination.
 * @param patientId The ID of the patient.
 * @param page The page number for pagination.
 * @param limit The number of items per page.
 * @returns A paginated list of lab requests.
 */
export const getLabRequestsByPatientId = async (
  patientId: number,
  page: number = 1,
  limit: number = 10
): Promise<{ data: LabRequest[]; total: number; page: number; limit: number }> => {
  const response = await api.get<{ data: LabRequest[]; total: number; page: number; limit: number }>(
    `/lab/requests/patient/${patientId}?page=${page}&limit=${limit}`
  );
  return response.data;
};

/**
 * Gets all lab requests with optional filters and pagination.
 * @param page The page number.
 * @param limit The number of items per page.
 * @param statusFilter Optional status to filter by.
 * @param patientIdFilter Optional patient ID to filter by.
 * @returns A paginated list of lab requests.
 */
export const getAllLabRequests = async (
  page: number = 1,
  limit: number = 10,
  statusFilter?: LabRequest['status'],
  patientIdFilter?: number,
  searchQuery?: string // Added searchQuery parameter
): Promise<{ data: LabRequest[]; total: number; page: number; limit: number }> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  if (statusFilter) params.append('status', statusFilter);
  if (patientIdFilter) params.append('patientId', patientIdFilter.toString());
  if (searchQuery) params.append('search', searchQuery); // Add searchQuery to params

  const response = await api.get<{ data: LabRequest[]; total: number; page: number; limit: number }>(
    `/lab/requests?${params.toString()}`
  );
  return response.data;
};

/**
 * Updates the status of a lab request.
 * @param labRequestId The ID of the lab request to update.
 * @param newStatus The new status for the lab request.
 * @returns The updated lab request.
 */
export const updateLabRequestStatus = async (
  labRequestId: number,
  newStatus: LabRequest['status']
): Promise<LabRequest> => {
  const response = await api.put<LabRequest>(`/lab/requests/${labRequestId}/status`, {
    status: newStatus,
  });
  return response.data;
};

/**
 * Updates the reason for a lab request.
 * @param labRequestId The ID of the lab request to update.
 * @param newReason The new reason for the lab request.
 * @returns The updated lab request.
 */
export const updateLabRequestReason = async (
  labRequestId: number,
  newReason: string
): Promise<LabRequest> => {
  const response = await api.put<LabRequest>(`/lab/requests/${labRequestId}/reason`, {
    reason: newReason,
  });
  return response.data;
};
