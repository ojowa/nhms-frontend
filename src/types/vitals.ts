export interface VitalSign {
    vitalId?: number;
    patientId: number;
    appointmentId?: number;
    nurseUserId: number;
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    temperature: number;
    pulseRate: number;
    respirationRate: number;
    weight?: number;
    height?: number;
    spo2?: number;
    recordedAt?: Date;
}

export interface CreateVitalSignPayload {
    patientId: number;
    appointmentId?: number;
    nurseUserId: number;
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    temperature: number;
    pulseRate: number;
    respirationRate: number;
    weight?: number;
    height?: number;
    spo2?: number;
    creatingUserId: number; // Added creatingUserId
}