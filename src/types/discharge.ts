// nhms-frontend/src/types/discharge.ts

export interface DischargeSummaryPayload {
  admissionId: number;
  patientId: number;
  doctorId: number;
  admissionDate: Date;
  dischargeDate: Date;
  diagnosisAtDischarge: string;
  proceduresPerformed?: string;
  medicationOnDischarge?: string;
  followUpInstructions?: string;
}

export interface DischargeSummary extends DischargeSummaryPayload {
  summaryId: number;
  createdAt: Date;
}
