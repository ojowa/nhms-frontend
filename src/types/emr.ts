export interface MedicalRecord {
    recordId: string;
    patientId: string;
    appointmentId?: string | null;
    doctorId: number;
    visitDate: string;
    notes?: string;
    chiefComplaint?: string;
    assessment?: string;
    plan?: string;
    createdAt: string;
    updatedAt: string;
    doctorFirstName?: string;
    doctorLastName?: string;
    diagnoses?: Diagnosis[];
    prescriptions?: Prescription[];
    documents?: Document[];
}

export interface CreateMedicalRecordPayload {
    patientId: number;
    appointmentId: number;
    doctorId: number;
    notes?: string;
    chiefComplaint: string;
    assessment: string;
    plan: string;
    creatingUserId: number; // Added creatingUserId
}

export interface Diagnosis {
    diagnosisId: string;
    medicalRecordId: string;
    code: string; // ICD-10 code
    description: string; // ICD-10 description
    diagnosisDate: string;
    severity?: string;
    createdAt: string;
}

export interface CreateDiagnosisPayload {
    medicalRecordId: string;
    code: string; // ICD-10 code
    severity?: string;
}

export interface Prescription {
    prescriptionId: string;
    medicalRecordId: string;
    medicationName: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    notes?: string;
    startDate: string; // Added startDate
    createdAt: string;
    doctorFirstName?: string; // From join
    doctorLastName?: string; // From join
    endDate?: string; // Ensure this is string for raw backend data
}

export interface CreatePrescriptionPayload {
    medicalRecordId: string;
    medication: string;
    drugId?: number;
    dosage?: string;
    frequency?: string;
    duration?: string;
    notes?: string;
    startDate: Date; // Added startDate and changed type from string to Date
    endDate?: Date; // Changed type from string to Date
    instructions?: string; // Added instructions
    refills?: number; // Added refills
}

export interface Document {
    id: number;
    recordId: string;
    fileName: string;
    fileUrl: string;
    uploadDate: string;
}

export interface CreateDocumentPayload {
    recordId: string;
    fileName: string;
    fileContent: string; // Base64 encoded or similar for upload
}

export interface VitalSigns {
    vitalId: number;
    patientId: number;
    appointmentId?: number;
    nurseUserId: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    temperature?: number;
    pulseRate?: number;
    respirationRate?: number;
    weight?: number;
    height?: number;
    spo2?: number;
    recordedAt: string;
}

export interface CreateVitalSignsPayload {
    patientId: number;
    appointmentId?: number;
    nurseUserId: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    temperature?: number;
    pulseRate?: number;
    respirationRate?: number;
    weight?: number;
    height?: number;
    spo2?: number;
}

export interface Allergy {
    allergyId: string;
    patientId: string;
    allergen: string;
    reaction?: string;
    severity?: 'Mild' | 'Moderate' | 'Severe';
    onsetDate?: string;
    createdAt: string;
    updatedAt: string;
}
