import api from '@/utils/api';
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

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

export const getWards = async (): Promise<Ward[]> => {
  const response = await api.get<ApiEnvelope<Ward[]>>('/bed-management/wards');
  return response.data.data;
};

export const createWard = async (payload: CreateWardPayload): Promise<Ward> => {
  const response = await api.post<ApiEnvelope<Ward>>('/bed-management/wards', payload);
  return response.data.data;
};

export const updateWard = async (payload: UpdateWardPayload): Promise<Ward> => {
  const response = await api.patch<ApiEnvelope<Ward>>(
    `/bed-management/wards/${payload.wardId}`,
    payload
  );
  return response.data.data;
};

export const getPendingAdmissions = async (): Promise<PendingAdmission[]> => {
  const response = await api.get<ApiEnvelope<PendingAdmission[]>>(
    '/bed-management/admissions/pending'
  );
  return response.data.data;
};

export const getWardOccupancy = async (
  wardId: number
): Promise<WardOccupancyBed[]> => {
  const response = await api.get<ApiEnvelope<WardOccupancyBed[]>>(
    `/bed-management/wards/${wardId}/occupancy`
  );
  return response.data.data;
};

export const getBedsInWard = async (
  wardId: number,
  status?: BedStatus
): Promise<Bed[]> => {
  const params = status ? { status } : undefined;
  const response = await api.get<ApiEnvelope<Bed[]>>(
    `/bed-management/wards/${wardId}/beds`,
    { params }
  );
  return response.data.data;
};

export const getAvailableBedsInWard = async (wardId: number): Promise<Bed[]> =>
  getBedsInWard(wardId, 'Available');

export const assignBed = async (
  admissionId: number,
  bedId: number
): Promise<AdmissionBedAssignment> => {
  const response = await api.post<ApiEnvelope<AdmissionBedAssignment>>(
    '/bed-management/beds/assign',
    { admissionId, bedId }
  );
  return response.data.data;
};

export const updateBedStatus = async (
  bedId: number,
  status: BedStatus
): Promise<Bed> => {
  const response = await api.patch<ApiEnvelope<Bed>>(
    `/bed-management/beds/${bedId}/status`,
    { status }
  );
  return response.data.data;
};

export const dischargePatientFromBed = async (
  admissionId: number
): Promise<AdmissionBedAssignment> => {
  const response = await api.post<ApiEnvelope<AdmissionBedAssignment>>(
    `/bed-management/admissions/${admissionId}/discharge-from-bed`
  );
  return response.data.data;
};
