import labApi from '@/utils/labApi';
import { LabRequest, LabRequestCreationPayload } from '@/types/labRequest';
import { LabResult, LabResultCreationPayload } from '@/types/labResult';

// Lab Request Service Calls
export const getPendingLabRequestsForDoctor = async (doctorId: number): Promise<LabRequest[]> => {
    const response = await labApi.get<LabRequest[]>(`/lab-requests/doctor/${doctorId}/pending`);
    return response.data;
};

export const updateLabRequestStatus = async (
  labRequestId: number,
  newStatus: LabRequest['status'],
  updatingUserId: number
): Promise<LabRequest> => {
    const response = await labApi.patch<LabRequest>(`/lab-requests/${labRequestId}/status`, { new_status: newStatus, updatingUserId });
    return response.data;
};

// Lab Request Creation
export const createLabRequest = async (payload: LabRequestCreationPayload): Promise<LabRequest> => {
    const response = await labApi.post<LabRequest>('/lab-requests', payload);
    return response.data;
};

// Lab Result Service Calls
export const createLabResult = async (payload: LabResultCreationPayload): Promise<LabResult> => {
    const response = await labApi.post<LabResult>(`/lab-results`, payload);
    return response.data;
};

export const updateLabResultStatusAndReviewers = async (
  labResultId: string,
  status: LabResult['status'],
  statusNotes: string | undefined,
  reviewedByUserId: string | undefined,
  approvedByUserId: string | undefined,
  updatingUserId: string
): Promise<LabResult> => {
    const response = await labApi.patch<LabResult>(`/lab-results/${labResultId}/status-review`, {
        status,
        status_notes: statusNotes,
        reviewed_by_user_id: reviewedByUserId,
        approved_by_user_id: approvedByUserId,
        updatingUserId,
    });
    return response.data;
};

export const getLabResultsByLabRequest = async (labRequestId: number, requestingUserId: number): Promise<LabResult[]> => {
    const response = await labApi.get<LabResult[]>(`/lab-requests/${labRequestId}/results`, { data: { requestingUserId } });
    return response.data;
};

export const getLabRequestsForLabStaff = async (labStaffId: number): Promise<LabRequest[]> => {
    // In a real scenario, this would call a specific endpoint like
    // `/lab-requests/lab-staff/${labStaffId}/pending-processing`
    // For now, we'll use a more generic endpoint that the backend needs to implement
    // with appropriate filtering based on the labStaffId (e.g., assigned requests, or requests with specific statuses)
    const response = await labApi.get<LabRequest[]>(`/lab-requests`); // Assuming this endpoint will be implemented for lab staff
    return response.data;
};

export const getLabResultsByPatientId = async (patientId: number, requestingUserId: number): Promise<LabResult[]> => {
    // Backend responses are not always a raw array; normalize safely.
    const response = await labApi.get(`/lab-results/patient/${patientId}`, { data: { requestingUserId } });
    const payload = response.data as any;
    if (Array.isArray(payload)) return payload as LabResult[];
    if (Array.isArray(payload?.data)) return payload.data as LabResult[];
    if (Array.isArray(payload?.results)) return payload.results as LabResult[];
    return [];
};

export const getReviewableLabResults = async (): Promise<LabResult[]> => {
    // This assumes the backend has an endpoint to fetch results that are PRELIMINARY or PENDING_APPROVAL
    // The backend endpoint should filter based on user roles if necessary
    const response = await labApi.get<LabResult[]>(`/lab-results/reviewable`);
    return response.data;
};
