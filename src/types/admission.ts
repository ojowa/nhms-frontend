export interface Admission {
    admissionId: string;
    patientId: string;
    admittingDoctorId: number;
    admissionDate: string; // Use string for dates from API, convert to Date object when needed
    dischargeDate?: string | null;
    departmentId?: number | null;
    status: 'Admitted' | 'Discharged' | 'Transferred';
    createdAt: string;
    updatedAt: string;
    patientFirstName?: string;
    patientLastName?: string;
    doctorFirstName?: string;
    doctorLastName?: string;
    departmentName?: string;
}

export interface CreateAdmissionPayload {
    patientId: string;
    admittingDoctorId: number;
    departmentId?: number;
    status?: 'Admitted' | 'Discharged' | 'Transferred';
}

export interface UpdateAdmissionStatusPayload {
    newStatus: 'Admitted' | 'Discharged' | 'Transferred';
    status?: 'Admitted' | 'Discharged' | 'Transferred';
    dischargeDate?: string | null;
}

export interface InpatientClinicalNote {
    noteId: number;
    admissionId: string;
    noteType: 'Progress' | 'Disposition' | 'Observation' | 'Referral';
    noteText: string;
    dispositionAction?: string | null;
    createdByUserId: number;
    createdByFirstName?: string;
    createdByLastName?: string;
    createdAt: string;
}

export interface CreateInpatientClinicalNotePayload {
    noteType: 'Progress' | 'Disposition' | 'Observation' | 'Referral';
    noteText: string;
    dispositionAction?: string | null;
}

export interface InpatientCareTransition {
    transitionId: number;
    admissionId: string;
    transitionType: 'Referral' | 'TransferWard';
    targetDepartmentId?: number | null;
    targetDepartmentName?: string | null;
    targetDoctorId?: number | null;
    targetDoctorFirstName?: string | null;
    targetDoctorLastName?: string | null;
    reason: string;
    requestedByUserId: number;
    requestedByFirstName?: string | null;
    requestedByLastName?: string | null;
    status: 'Requested' | 'InProgress' | 'Completed' | 'Cancelled';
    requestedAt: string;
}

export interface CreateInpatientCareTransitionPayload {
    transitionType: 'Referral' | 'TransferWard';
    reason: string;
    targetDepartmentId?: number | null;
    targetDoctorId?: number | null;
}

export interface InpatientTimelineEvent {
    eventType: 'Admission' | 'ClinicalNote' | 'CareTransition';
    eventTime: string;
    title: string;
    details: string;
    actorName?: string | null;
}

export interface ActiveAdmissionByPatient {
    patientId: number;
    admissionId: number;
    status: string;
    admissionDate: string;
}
