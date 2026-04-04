import api from '../utils/api';

export interface HospitalOverview {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
  totalNurses: number;
  totalDepartments: number;
  totalAppointmentsScheduled: number;
  totalAppointmentsCompleted: number;
}

export const getHospitalOverview = async (): Promise<HospitalOverview> => {
  try {
    const response = await api.get<HospitalOverview>('/admin/hospital/overview');
    return response.data;
  } catch (error) {
    console.error('Error fetching hospital overview:', error);
    throw error;
  }
};
