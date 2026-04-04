import { apiClient } from '@/utils/api-client';
import {
  User,
  Role,
  CreateUserPayload,
  PaginatedUsers,
  PaginatedRoles,
  PaginatedLoggedInUsers,
} from '@/types/admin';

export const getAllUsers = async (
  page: number = 1,
  limit: number = 10,
  searchTerm: string = '',
  role?: string | string[],
  includeInactive: boolean = false
): Promise<PaginatedUsers> => {
  const params: { page: number; limit: number; searchTerm?: string; role?: string; includeInactive?: boolean } = {
    page,
    limit,
  };

  if (searchTerm) {
    params.searchTerm = searchTerm;
  }

  if (role) {
    params.role = Array.isArray(role) ? role.join(',') : role;
  }
  if (includeInactive) {
    params.includeInactive = true;
  }

  return apiClient.get<PaginatedUsers>('/admin/users', { params });
};

export const getUserById = async (id: number): Promise<User> => {
  return apiClient.get<User>(`/admin/users/${id}`);
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  return apiClient.post<User>('/admin/users', payload);
};

export const updateUser = async (userId: number, data: Partial<User>): Promise<User> => {
  return apiClient.put<User>(`/admin/users/${userId}`, data);
};

export const setUserPortalAccess = async (userId: number, isActive: boolean): Promise<{ message: string }> => {
  return apiClient.patch<{ message: string }>(`/admin/users/${userId}/access`, { isActive });
};

export const updateUserRoles = async (userId: number, roles: string[]): Promise<User> => {
  return apiClient.put<User>(`/admin/users/${userId}/roles`, { roles });
};

export const deleteUser = async (id: number): Promise<void> => {
  await apiClient.delete<void>(`/admin/users/${id}`);
};

export const getAllRoles = async (page: number = 1, limit: number = 10, searchTerm: string = ''): Promise<PaginatedRoles> => {
  return apiClient.get<PaginatedRoles>('/admin/roles', {
    params: { page, limit, searchTerm },
  });
};

export const assignRoleToUser = async (userId: number, roleName: string): Promise<{ message: string }> => {
  return apiClient.post<{ message: string }>(`/admin/users/${userId}/roles`, { roleName });
};

export const removeRoleFromUser = async (userId: number, roleName: string): Promise<{ message: string }> => {
  return apiClient.delete<{ message: string }>(`/admin/users/${userId}/roles`, { data: { roleName } });
};

export const deleteRole = async (roleId: number): Promise<number> => {
  const response = await apiClient.delete<{ message: string }>(`/admin/roles/${roleId}`);
  return response as unknown as number;
};

export const searchPatients = async (searchTerm: string): Promise<{ patientId: number; firstName: string; lastName: string }[]> => {
  return apiClient.get<{ patientId: number; firstName: string; lastName: string }[]>('/admin/patients/search', { params: { q: searchTerm } });
};

export const createRole = async (roleName: string): Promise<Role> => {
  return apiClient.post<Role>('/admin/roles', { roleName });
};

export const getUsersByRole = async (roleName: string): Promise<User[]> => {
  return apiClient.get<User[]>(`/admin/users/role/${roleName}`);
};

export const getUsersCountByRoles = async (roles: string[]): Promise<{ [role: string]: number }> => {
  return apiClient.get<{ [role: string]: number }>('/admin/users/count-by-roles', {
    params: { roles: roles.join(',') },
  });
};

export const getLoggedInUsers = async (): Promise<PaginatedLoggedInUsers> => {
  return apiClient.get<PaginatedLoggedInUsers>('/admin/logged-in-users');
};

export const resetPassword = async (userId: number, newPassword: string): Promise<{ message: string }> => {
  return apiClient.post<{ message: string }>(`/admin/users/${userId}/reset-password`, { newPassword });
};
