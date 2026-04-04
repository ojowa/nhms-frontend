// src/modules/lab/requests/lab.request.types.ts
import { LabResult } from './labResult';

export interface LabRequest {
    lab_request_id: number; // Changed from lab_request_id: number to labRequestId: string
    appointment_id: number;
    patient_id: number;
    doctor_id: number;
    request_date: Date;
    test_type: string;
    reason?: string;
    status: 'PENDING' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
    created_at: Date;
    updated_at: Date;
    patientFirstName?: string;
    patientMiddleName?: string;
    patientLastName?: string;
    doctorFirstName?: string;
    doctorMiddleName?: string;
    doctorLastName?: string;
}

export interface LabRequestCreationPayload {
    appointment_id: number;
    patient_id: number;
    doctor_id: number;
    test_type: string;
    reason?: string;
}

export interface LabRequestUpdatePayload {
    status?: 'PENDING' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
    test_type?: string;
    reason?: string;
    updated_at?: Date;
}

// Optionally, if you want to include results directly within a request view
export interface LabRequestWithResults extends LabRequest {
    lab_results: LabResult[];
}
