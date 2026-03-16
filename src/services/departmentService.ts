import api from '../utils/api';
import { Department, PaginatedDepartments, CreateDepartmentPayload, UpdateDepartmentPayload } from '@/types/department';
import { User } from '@/types/auth'; // Ensure you have a User type

// A generic type for the backend response structure
export interface ApiResponse<T> {
  message: string;
  data: T;
  total?: number;
  currentPage?: number;
  totalPages?: number;
}

/**
 * Fetches a paginated list of departments.
 */
export const getDepartments = async (page: number, limit: number, searchTerm: string = ''): Promise<PaginatedDepartments> => {
  try {
    const response = await api.get<ApiResponse<Department[]>>('/departments', {
      params: { page, limit, searchTerm },
    });
    const { data, total } = response.data;
    return { departments: data, total: total || 0 };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch departments');
  }
};

/**
 * Fetches all departments without pagination.
 */
export const fetchAllDepartments = async (): Promise<Department[]> => {
  try {
    const response = await api.get<ApiResponse<Department[]>>('/departments?limit=9999'); // Assuming a large enough limit to get all
    return response.data.data || [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch all departments');
  }
};

/**
 * Fetches a single department by its ID.
 */
export const getDepartmentById = async (departmentId: number): Promise<Department> => {
  try {
    const response = await api.get<ApiResponse<Department>>(`/departments/${departmentId}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch department');
  }
};

/**
 * Creates a new department.
 */
export const createDepartment = async (payload: CreateDepartmentPayload): Promise<Department> => {
  try {
    const response = await api.post<ApiResponse<Department>>('/departments', payload);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create department');
  }
};

/**
 * Updates an existing department.
 */
export const updateDepartment = async (departmentId: number, payload: UpdateDepartmentPayload): Promise<Department> => {
  try {
    const response = await api.put<ApiResponse<Department>>(`/departments/${departmentId}`, payload);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update department');
  }
};

/**
 * Deletes a department by its ID.
 */
export const deleteDepartment = async (departmentId: number): Promise<string> => {
  try {
    const response = await api.delete<ApiResponse<null>>(`/departments/${departmentId}`);
    return response.data.message;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete department');
  }
};

/**
 * Fetches the staff members of a specific department.
 */
export const getDepartmentStaff = async (departmentId: number): Promise<User[]> => {
  try {
    const response = await api.get<ApiResponse<User[]>>(`/departments/${departmentId}/staff`);
    // Transform backend fields to match User type
    const staff = response.data.data.map((user: any) => ({
      userId: user.user_id,
      uuid: user.uuid || '',
      patientId: user.patient_id,
      userDepartmentId: user.user_department_id,
      email: user.email,
      roles: [], // Not returned by procedure, set to empty
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
    return staff;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch department staff');
  }
};

/**
 * Adds a user to a department.
 */
export const addUserToDepartment = async (departmentId: number, userId: number): Promise<string> => {
  try {
    const response = await api.post<ApiResponse<null>>(`/departments/${departmentId}/staff/${userId}`);
    return response.data.message;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to add user to department');
  }
};

/**
 * Removes a user from a department.
 */
export const removeUserFromDepartment = async (departmentId: number, userId: number): Promise<string> => {
  try {
    const response = await api.delete<ApiResponse<null>>(`/departments/${departmentId}/staff/${userId}`);
    return response.data.message;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to remove user from department');
  }
  };