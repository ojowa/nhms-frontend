import {
  AddInventoryStockPayload,
  DispensePayload,
  DispenseResult,
  FormularyDrug,
  InventoryAuditEvent,
  InventoryItem,
  PendingPrescription,
} from '@/types/pharmacy';
import { apiClient } from '@/utils/api-client';

export const searchFormulary = async (q?: string): Promise<FormularyDrug[]> => {
  const response = await apiClient.get<{ data: FormularyDrug[] }>('/pharmacy/formulary', {
    params: q ? { q } : undefined,
  });
  return response.data;
};

export const getPendingPrescriptions = async (): Promise<PendingPrescription[]> => {
  const response = await apiClient.get<{ data: PendingPrescription[] }>(
    '/pharmacy/pending-prescriptions'
  );
  return response.data;
};

export const getInventory = async (q?: string): Promise<InventoryItem[]> => {
  const response = await apiClient.get<{ data: InventoryItem[] }>('/pharmacy/inventory', {
    params: q ? { q } : undefined,
  });
  return response.data;
};

export const getInventoryByDrug = async (drugId: number): Promise<InventoryItem[]> => {
  const response = await apiClient.get<{ data: InventoryItem[] }>(
    `/pharmacy/inventory/by-drug/${drugId}`
  );
  return response.data;
};

export const getInventoryLowStock = async (): Promise<InventoryItem[]> => {
  const response = await apiClient.get<{ data: InventoryItem[] }>('/pharmacy/inventory/low-stock');
  return response.data;
};

export const getInventoryExpiryRisk = async (days: number = 90): Promise<InventoryItem[]> => {
  const response = await apiClient.get<{ data: InventoryItem[] }>('/pharmacy/inventory/expiry-risk', {
    params: { days },
  });
  return response.data;
};

export const getInventoryReorderQueue = async (): Promise<InventoryItem[]> => {
  const response = await apiClient.get<{ data: InventoryItem[] }>('/pharmacy/inventory/reorder-queue');
  return response.data;
};

export const getInventoryAuditTrail = async (limit: number = 200): Promise<InventoryAuditEvent[]> => {
  const response = await apiClient.get<{ data: InventoryAuditEvent[] }>('/pharmacy/inventory/audit-trail', {
    params: { limit },
  });
  return response.data;
};

export const addInventoryStock = async (
  payload: AddInventoryStockPayload
): Promise<InventoryItem> => {
  const response = await apiClient.post<{ data: InventoryItem }>(
    '/pharmacy/inventory/add-stock',
    payload
  );
  return response.data;
};

export const dispenseMedication = async (
  payload: DispensePayload
): Promise<DispenseResult> => {
  const response = await apiClient.post<{ data: DispenseResult }>('/pharmacy/dispense', payload);
  return response.data;
};
