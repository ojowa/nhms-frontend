import { Department, PaginatedDepartments, CreateDepartmentPayload, UpdateDepartmentPayload } from '@/types/department';
import { User } from '@/types/auth';
import { apiClient } from '@/utils/api-client';

export const getDepartments = async (page: number, limit: number, searchTerm: string = ''): Promise<PaginatedDepartments> => {
  const response = await apiClient.get<{ data: Department[]; total: number }>('/departments', {
    params: { page, limit, searchTerm },
  });
  return { departments: response.data, total: response.total || 0 };
};

export const fetchAllDepartments = async (): Promise<Department[]> => {
  const response = await apiClient.get<{ data: Department[] }>('/departments?limit=9999');
  return response.data || [];
};

export const getDepartmentById = async (departmentId: number): Promise<Department> => {
  const response = await apiClient.get<{ data: Department }>(`/departments/${departmentId}`);
  return response.data;
};

export const createDepartment = async (payload: CreateDepartmentPayload): Promise<Department> => {
  const response = await apiClient.post<{ data: Department }>('/departments', payload);
  return response.data;
};

export const updateDepartment = async (departmentId: number, payload: UpdateDepartmentPayload): Promise<Department> => {
  const response = await apiClient.put<{ data: Department }>(`/departments/${departmentId}`, payload);
  return response.data;
};

export const deleteDepartment = async (departmentId: number): Promise<string> => {
  const response = await apiClient.delete<{ message: string }>(`/departments/${departmentId}`);
  return response.message;
};

export const getDepartmentStaff = async (departmentId: number): Promise<User[]> => {
  const response = await apiClient.get<{ data: User[] }>(`/departments/${departmentId}/staff`);
  // Transform backend fields to match User type
  return response.data.map((user: any) => ({
    userId: user.user_id,
    uuid: user.uuid || '',
    patientId: user.patient_id,
    userDepartmentId: user.user_department_id,
    email: user.email,
    roles: [],
    firstName: user.first_name,
    middleName: user.middle_name,
    lastName: user.last_name,
    nisNumber: user.nis_number || '',
    phone: user.phone,
    isActive: user.is_active,
    patientType: user.patient_type,
    familyId: user.family_id,
    lastPasswordChangeAt: user.last_password_change_at,
  }));
};

export const addUserToDepartment = async (departmentId: number, userId: number): Promise<string> => {
  const response = await apiClient.post<{ message: string }>(`/departments/${departmentId}/staff/${userId}`);
  return response.message;
};

export const removeUserFromDepartment = async (departmentId: number, userId: number): Promise<string> => {
  const response = await apiClient.delete<{ message: string }>(`/departments/${departmentId}/staff/${userId}`);
  return response.message;
};