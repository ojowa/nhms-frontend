// Represents a single lab result record
export interface LabResult {
    labResultId: number;
    lab_request_id: number; // Added to link to lab requests
    appointmentId: number; // Aligned with DB
    patientId: number;
    patientFirstName?: string; // Added from SP
    patientLastName?: string; // Added from SP
    createdAt: Date; // Aligned with DB
    testName: string; // Aligned with DB
    resultValue: string;
    status: 'PRELIMINARY' | 'FINAL' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'; // Expanded for workflow
    unit?: string;
    referenceRange?: string;
    fileAttachmentUrl?: string; // Keep if still relevant for future
    notes?: string;
    status_notes?: string; // New field from migration
    reviewed_by_user_id?: number; // New field from migration
    approved_by_user_id?: number; // New field from migration
    created_by_user_id?: number;
}

// Payload for creating a new lab result
export interface LabResultCreationPayload {
    lab_request_id: number;
    appointmentId: number; // Required in payload
    patientId: number;
    testName: string;
    resultValue: string;
    unit?: string;
    referenceRange?: string;
    fileAttachmentUrl?: string;
    notes?: string;
    creatingUserId: string; // Required in payload
}

// Payload for updating lab result status and review fields
export interface UpdateLabResultStatusPayload {
    labResultId: number;
    newStatus: 'PRELIMINARY' | 'FINAL' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
    statusNotes?: string;
    reviewerUserId?: number;
    approverUserId?: number;
}

// Interface for LabResult with additional admin-specific fields
export interface AdminLabResult extends LabResult {
    patientFirstName: string;
    patientLastName: string;
}

// Interface for paginated admin lab results
export interface PaginatedAdminLabResults {
    data: AdminLabResult[];
    total: number;
    page: number;
    limit: number;
}

// Analytics Types
export interface LabTestVolume {
    Period: string;
    TotalTests: number;
    TestType: string;
}

export interface LabTurnaroundTime {
    TestType: string;
    AverageTurnaroundTimeHours: number;
}

export interface LabResultDistribution {
    ResultStatus: string;
    Count: number;
}

export interface LabStaffPerformance {
    user_id: number;
    first_name: string;
    last_name: string;
    TotalResultsHandled: number;
}