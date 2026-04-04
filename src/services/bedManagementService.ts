import {
  AdmissionBedAssignment,
  Bed,
  BedStatus,
  CreateWardPayload,
  PendingAdmission,
  UpdateWardPayload,
  Ward,
  WardOccupancyBed,
} from '@/types/bedManagement';
import { apiClient } from '@/utils/api-client';

export const getWards = async (): Promise<Ward[]> => {
  const response = await apiClient.get<{ data: Ward[] }>('/bed-management/wards');
  return response.data;
};

export const createWard = async (payload: CreateWardPayload): Promise<Ward> => {
  const response = await apiClient.post<{ data: Ward }>('/bed-management/wards', payload);
  return response.data;
};

export const updateWard = async (payload: UpdateWardPayload): Promise<Ward> => {
  const response = await apiClient.patch<{ data: Ward }>(
    `/bed-management/wards/${payload.wardId}`,
    payload
  );
  return response.data;
};

export const getPendingAdmissions = async (): Promise<PendingAdmission[]> => {
  const response = await apiClient.get<{ data: PendingAdmission[] }>(
    '/bed-management/admissions/pending'
  );
  return response.data;
};

export const getWardOccupancy = async (
  wardId: number
): Promise<WardOccupancyBed[]> => {
  const response = await apiClient.get<{ data: WardOccupancyBed[] }>(
    `/bed-management/wards/${wardId}/occupancy`
  );
  return response.data;
};

export const getBedsInWard = async (
  wardId: number,
  status?: BedStatus
): Promise<Bed[]> => {
  const params = status ? { status } : undefined;
  const response = await apiClient.get<{ data: Bed[] }>(
    `/bed-management/wards/${wardId}/beds`,
    { params }
  );
  return response.data;
};

export const getAvailableBedsInWard = async (wardId: number): Promise<Bed[]> =>
  getBedsInWard(wardId, 'Available');

export const assignBed = async (
  admissionId: number,
  bedId: number
): Promise<AdmissionBedAssignment> => {
  const response = await apiClient.post<{ data: AdmissionBedAssignment }>(
    '/bed-management/beds/assign',
    { admissionId, bedId }
  );
  return response.data;
};

export const updateBedStatus = async (
  bedId: number,
  status: BedStatus
): Promise<Bed> => {
  const response = await apiClient.patch<{ data: Bed }>(
    `/bed-management/beds/${bedId}/status`,
    { status }
  );
  return response.data;
};

export const dischargePatientFromBed = async (
  admissionId: number
): Promise<AdmissionBedAssignment> => {
  const response = await apiClient.post<{ data: AdmissionBedAssignment }>(
    `/bed-management/admissions/${admissionId}/discharge-from-bed`
  );
  return response.data;
};
