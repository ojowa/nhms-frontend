import api from '@/utils/api';
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

  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const { data } = await api.post<User>('/admin/users', payload);
  return data;
};

export const updateUser = async (userId: number, data: Partial<User>): Promise<User> => {
  const response = await api.put(`/admin/users/${userId}`, data);
  return response.data;
};

export const setUserPortalAccess = async (userId: number, isActive: boolean): Promise<{ message: string }> => {
  const response = await api.patch(`/admin/users/${userId}/access`, { isActive });
  return response.data;
};

export const updateUserRoles = async (userId: number, roles: string[]): Promise<User> => {
  const response = await api.put(`/admin/users/${userId}/roles`, { roles });
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/admin/users/${id}`);
};

export const getAllRoles = async (page: number = 1, limit: number = 10, searchTerm: string = ''): Promise<PaginatedRoles> => {
  const response = await api.get('/admin/roles', {
    params: { page, limit, searchTerm },
  });
  return response.data;
};

export const assignRoleToUser = async (userId: number, roleName: string): Promise<{ message: string }> => {
  const response = await api.post(`/admin/users/${userId}/roles`, { roleName });
  return response.data;
};

export const removeRoleFromUser = async (userId: number, roleName: string): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/users/${userId}/roles`, { data: { roleName } });
  return response.data;
};

export const deleteRole = async (roleId: number): Promise<number> => {
  const response = await api.delete(`/admin/roles/${roleId}`);
  return response.data;
};

export const searchPatients = async (searchTerm: string): Promise<{ patientId: number, firstName: string, lastName: string }[]> => {
    const response = await api.get('/admin/patients/search', { params: { q: searchTerm } });
    return response.data;
};

export const createRole = async (roleName: string): Promise<Role> => {
  const response = await api.post('/admin/roles', { roleName });
  return response.data;
};



export const getUsersByRole = async (roleName: string): Promise<User[]> => {

  const response = await api.get(`/admin/users/role/${roleName}`);

  return response.data;

};

export const getUsersCountByRoles = async (roles: string[]): Promise<{ [role: string]: number }> => {
  const response = await api.get('/admin/users/count-by-roles', {
    params: { roles: roles.join(',') },
  });
  return response.data;
};

export const getLoggedInUsers = async (): Promise<PaginatedLoggedInUsers> => {
  const response = await api.get('/admin/logged-in-users');
  return response.data;
};



export const resetPassword = async (userId: number, newPassword: string): Promise<{ message: string }> => {



  const response = await api.post(`/admin/users/${userId}/reset-password`, { newPassword });



  return response.data;



};
