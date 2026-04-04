import labApi from '@/utils/labApi';
import { LabResult, LabResultCreationPayload, UpdateLabResultStatusPayload, PaginatedAdminLabResults } from '@/types/labResult';



// NOTE: CreateLabResultPayload and UpdateLabResultPayload are now derived from LabResult
// export interface CreateLabResultPayload { // This can be removed and use LabResultCreationPayload
//   appointmentId: number;
//   patientId: number;
//   testName: string;
//   resultValue: string;
//   status: 'PRELIMINARY' | 'FINAL';
//   unit?: string; // Renamed for consistency
//   referenceRange?: string;
//   notes?: string;
// }

// export interface UpdateLabResultPayload { // This can be removed and use Partial<LabResult>
//   status?: 'PRELIMINARY' | 'FINAL';
//   resultValue?: string;
//   notes?: string;
// }

// New interface for the paginated response for patient-specific lab results
export interface PaginatedPatientLabResults {
  data: LabResult[]; // LabResult allows patientFirstName/LastName to be optional
  total: number;
  page: number;
  limit: number;
}

// New interface for the paginated response from submitted lab results
export interface PaginatedLabResults {
  data: LabResult[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Fetches a paginated list of lab results for a specific patient.
 * @param patientId The ID of the patient.
 * @param page The page number to fetch.
 * @param limit The number of results per page.
 * @returns A promise that resolves to the paginated lab results.
 */
export const getLabResultsByPatientIdWithAuth = async (
  patientId: number,
  user: any, // user object is not used here but kept for consistency with backend
  page: number = 1, // Make optional with default
  limit: number = 3, // Make optional with default to fetch few recent for dashboard
  testNameSearch?: string,
  startDate?: string,
  endDate?: string
): Promise<PaginatedPatientLabResults | null> => {
  const params: any = { page, limit };
  if (testNameSearch) params.testNameSearch = testNameSearch;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await labApi.get(`/lab-results/patient/${patientId}`, {
    params,
  });
  return response.data as PaginatedPatientLabResults; // Explicitly cast
};

/**
 * Fetches a paginated list of lab results submitted or approved by a specific lab staff user.
 * @param labStaffUserId The ID of the lab staff user.
 * @param page The page number to fetch.
 * @param limit The number of results per page.
 * @param statusFilter Optional: Filter by lab result status.
 * @returns A promise that resolves to the paginated lab results.
 */
export const getSubmittedLabResultsByLabStaff = async (
  labStaffUserId: number,
  page: number = 1,
  limit: number = 10,
  statusFilter?: string
): Promise<PaginatedLabResults> => {
  const params: any = { page, limit };
  if (statusFilter) params.status = statusFilter;

  const response = await labApi.get(`/lab-results/submitted-by-me`, {
    params,
  });
  return response.data as PaginatedLabResults;
};

/**
 * Fetches all lab results that are pending approval.
 * @returns A promise that resolves to an array of LabResult objects.
 */
export const getLabResultsPendingApproval = async (): Promise<LabResult[]> => {
  const response = await labApi.get('/lab-results/pending-approval');
  if (Array.isArray(response.data)) {
    return response.data as LabResult[];
  }
  if (Array.isArray(response.data?.data)) {
    return response.data.data as LabResult[];
  }
  return [];
};

/**
 * Fetches a single lab result by its ID.
 * @param labResultId The ID of the lab result.
 * @returns A promise that resolves to the lab result.
 */
export const getLabResultById = async (labResultId: number): Promise<LabResult> => {
  const response = await labApi.get(`/lab-results/${labResultId}`);
  return response.data;
};

/**
 * Creates a new lab result.
 * @param payload The data for the new lab result.
 * @returns A promise that resolves to the newly created lab result.
 */
export const createLabResult = async (payload: LabResultCreationPayload): Promise<LabResult> => {
  const response = await labApi.post('/lab-results', payload);
  return response.data;
};

/**
 * Updates an existing lab result.
 * @param labResultId The ID of the lab result to update.
 * @param payload The data to update.
 * @returns A promise that resolves to the updated lab result.
 */
export const updateLabResult = async (labResultId: number, payload: Partial<LabResult>): Promise<LabResult> => { // Use Partial<LabResult>
  const response = await labApi.put(`/lab-results/${labResultId}`, payload);
  return response.data;
};

/**
 * Updates the status and review details of a lab result.
 * @param payload The data for updating the lab result status and review.
 * @returns A promise that resolves to the updated lab result.
 */
export const updateLabResultStatusAndReviewers = async (payload: UpdateLabResultStatusPayload): Promise<LabResult> => {
  const { labResultId, ...rest } = payload;
  const response = await labApi.patch(`/lab-results/${labResultId}/status-review`, rest);
  return response.data;
};


/**
 * Deletes a lab result.
 * @param labResultId The ID of the lab result to delete.
 */
export const deleteLabResult = async (labResultId: number): Promise<void> => {
  await labApi.delete(`/lab-results/${labResultId}`);
};

/**
 * Fetches a paginated list of all lab results for administrative view.
 * @param page The page number to fetch.
 * @param limit The number of results per page.
 * @param patientIdFilter Optional: Filter by specific patient ID.
 * @param statusFilter Optional: Filter by lab result status.
 * @returns A promise that resolves to the paginated lab results.
 */
export const getAllLabResultsForAdmin = async (
  page: number,
  limit: number,
  patientIdFilter?: number,
  statusFilter?: string,
  searchQuery?: string // Added searchQuery parameter
): Promise<PaginatedAdminLabResults> => {
  const params: any = { page, limit };
  if (patientIdFilter) params.patientId = patientIdFilter;
  if (statusFilter) params.status = statusFilter;
  if (searchQuery) params.search = searchQuery; // Add searchQuery to params

  const response = await labApi.get('/lab-results/admin', {
    params,
  });
  return response.data as PaginatedAdminLabResults; // Explicitly cast
};

/**
 * Fetches lab results by lab request ID.
 * @param labRequestId The ID of the lab request.
 * @returns A promise that resolves to an array of LabResult objects.
 */
export const getLabResultsByLabRequest = async (labRequestId: number): Promise<LabResult[]> => {
  const response = await labApi.get(`/lab-requests/${labRequestId}/results`);
  return response.data;
};


export const searchLabResults = async (
  patientId?: number,
  testName?: string,
  startDate?: string,
  endDate?: string
): Promise<LabResult[]> => {
  const params: any = {};
  if (patientId) params.patientId = patientId;
  if (testName) params.testName = testName;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await labApi.get('/lab-results/search', {
    params,
  });
  return response.data;
};
