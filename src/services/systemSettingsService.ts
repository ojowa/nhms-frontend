import api from '../utils/api'; // Assuming api utility for axios instance

export interface SystemSettings {
  sessionTimeout: number;
  maxAppointmentDays: number;
  enableNewRegistrations: boolean;
  enforceConsultationTransitions: boolean;
  consultationAllowedTransitionsCsv: string;
  enforceDischargeSummaryBeforeDischarge: boolean;
  bedStatusSlaHours: number;
  enableVitalTrendAlerts: boolean;
  vitalAlertSystolicHighThreshold: number;
  vitalAlertTemperatureHighThreshold: number;
  vitalAlertSpo2LowThreshold: number;
}

// Define the response type for updateSystemSettings
export interface UpdateSettingsResponse {
  success: boolean;
  message: string;
  settings: SystemSettings;
}

export const getSystemSettings = async (): Promise<SystemSettings> => {
  try {
    const response = await api.get<SystemSettings>('/admin/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching system settings:', error);
    throw error;
  }
};

export const updateSystemSettings = async (settings: Partial<SystemSettings>): Promise<UpdateSettingsResponse> => {
  try {
    const response = await api.post<UpdateSettingsResponse>('/admin/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Error updating system settings:', error);
    throw error;
  }
};
