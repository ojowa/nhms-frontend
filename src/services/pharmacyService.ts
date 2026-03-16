import api from '@/utils/api';
import {
  AddInventoryStockPayload,
  DispensePayload,
  DispenseResult,
  FormularyDrug,
  InventoryAuditEvent,
  InventoryItem,
  PendingPrescription,
} from '@/types/pharmacy';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export const searchFormulary = async (q?: string): Promise<FormularyDrug[]> => {
  const response = await api.get<ApiEnvelope<FormularyDrug[]>>('/pharmacy/formulary', {
    params: q ? { q } : undefined,
  });
  return response.data.data;
};

export const getPendingPrescriptions = async (): Promise<PendingPrescription[]> => {
  const response = await api.get<ApiEnvelope<PendingPrescription[]>>(
    '/pharmacy/pending-prescriptions'
  );
  return response.data.data;
};

export const getInventory = async (q?: string): Promise<InventoryItem[]> => {
  const response = await api.get<ApiEnvelope<InventoryItem[]>>('/pharmacy/inventory', {
    params: q ? { q } : undefined,
  });
  return response.data.data;
};

export const getInventoryByDrug = async (drugId: number): Promise<InventoryItem[]> => {
  const response = await api.get<ApiEnvelope<InventoryItem[]>>(
    `/pharmacy/inventory/by-drug/${drugId}`
  );
  return response.data.data;
};

export const getInventoryLowStock = async (): Promise<InventoryItem[]> => {
  const response = await api.get<ApiEnvelope<InventoryItem[]>>('/pharmacy/inventory/low-stock');
  return response.data.data;
};

export const getInventoryExpiryRisk = async (days: number = 90): Promise<InventoryItem[]> => {
  const response = await api.get<ApiEnvelope<InventoryItem[]>>('/pharmacy/inventory/expiry-risk', {
    params: { days },
  });
  return response.data.data;
};

export const getInventoryReorderQueue = async (): Promise<InventoryItem[]> => {
  const response = await api.get<ApiEnvelope<InventoryItem[]>>('/pharmacy/inventory/reorder-queue');
  return response.data.data;
};

export const getInventoryAuditTrail = async (limit: number = 200): Promise<InventoryAuditEvent[]> => {
  const response = await api.get<ApiEnvelope<InventoryAuditEvent[]>>('/pharmacy/inventory/audit-trail', {
    params: { limit },
  });
  return response.data.data;
};

export const addInventoryStock = async (
  payload: AddInventoryStockPayload
): Promise<InventoryItem> => {
  const response = await api.post<ApiEnvelope<InventoryItem>>(
    '/pharmacy/inventory/add-stock',
    payload
  );
  return response.data.data;
};

export const dispenseMedication = async (
  payload: DispensePayload
): Promise<DispenseResult> => {
  const response = await api.post<ApiEnvelope<DispenseResult>>('/pharmacy/dispense', payload);
  return response.data.data;
};
