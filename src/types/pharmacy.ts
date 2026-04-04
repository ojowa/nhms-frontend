export interface FormularyDrug {
  drugId: number;
  name: string;
  genericName?: string | null;
  dosageForm?: string | null;
  strength?: string | null;
  isActive: boolean;
}

export interface InventoryItem {
  inventoryId: number;
  drugId: number;
  drugName: string;
  genericName?: string | null;
  batchNumber: string;
  expiryDate?: string | null;
  quantityOnHand: number;
  reorderLevel: number;
}

export interface PendingPrescription {
  prescriptionId: number;
  medicalRecordId: number;
  patientId: number;
  patientFirstName: string;
  patientLastName: string;
  medicationName: string;
  dosage?: string | null;
  frequency?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  drugId?: number | null;
  status: string;
}

export interface DispensePayload {
  prescriptionId: number;
  inventoryId: number;
  quantityDispensed: number;
}

export interface AddInventoryStockPayload {
  drugId: number;
  batchNumber: string;
  expiryDate?: string | null;
  quantityToAdd: number;
  reorderLevel: number;
}

export interface DispenseResult {
  dispensationId: number;
  prescriptionId: number;
  inventoryId: number;
  quantityDispensed: number;
  remainingQuantity: number;
  prescriptionStatus: string;
}

export interface InventoryAuditEvent {
  auditId: number;
  inventoryId: number;
  drugId: number;
  drugName: string;
  batchNumber: string;
  eventType: 'ADD_STOCK' | 'DISPENSE' | 'MANUAL_ADJUSTMENT';
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceType?: string | null;
  referenceId?: number | null;
  note?: string | null;
  actorUserId?: number | null;
  actorFirstName?: string | null;
  actorLastName?: string | null;
  createdAt: string;
}
