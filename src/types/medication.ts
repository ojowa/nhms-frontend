export interface MedicationAdministration {
    administrationId: string; // bigint
    prescriptionId: string; // bigint
    admissionId?: string | null; // bigint
    patientId: string; // bigint
    administeringNurseId: number; // int
    administrationTime: string; // datetime2
    dosageGiven?: string | null; // nvarchar
    route?: string | null; // nvarchar
    notes?: string | null; // nvarchar
    status: 'Administered' | 'Missed' | 'Refused' | 'Held'; // nvarchar
    createdAt: string; // datetime2
    // Extended fields for display purposes, e.g., from joins
    patientFirstName?: string;
    patientLastName?: string;
    nurseFirstName?: string;
    nurseLastName?: string;
    medicationName?: string; // From prescriptions table
}

export interface CreateMedicationAdministrationPayload {
    prescriptionId?: string;
    admissionId?: string;
    patientId: string;
    administeringNurseId: number;
    dosageGiven?: string;
    route?: string;
    notes?: string;
    status?: 'Administered' | 'Missed' | 'Refused' | 'Held';
}

export interface GetMedicationAdministrationsFilters {
    page?: number; // Added for pagination
    limit?: number; // Added for pagination
    administrationId?: string;
    prescriptionId?: string;
    admissionId?: string;
    patientId?: string;
    status?: string;
    searchTerm?: string;
    nurseUserId?: number;
    appointmentId?: number;
}