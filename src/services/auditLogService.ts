import api from '../utils/api';

export interface AuditLog {
  log_id: number;
  userId: number;
  userEmail: string;
  action: string;
  log_time: string; // Keep as string for now, convert on frontend if needed
}

export interface PaginatedAuditLogs {
  logs: AuditLog[];
  total: number;
}

export const getAuditLogs = async (
  page: number,
  limit: number,
  searchTerm: string = ''
): Promise<PaginatedAuditLogs> => {
  try {
    const response = await api.get<PaginatedAuditLogs>('/admin/audit-logs', {
      params: { page, limit, searchTerm },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};
