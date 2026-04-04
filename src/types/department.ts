// nhms-frontend/src/types/department.ts
export interface Department {
  departmentId: number;
  name: string;
  description: string | null;
  isActive: boolean;
  headUserId?: number; // Added
  headFirstName?: string; // Added
  headLastName?: string; // Added
}

export interface CreateDepartmentPayload {
  name: string;
  description?: string | null;
  // creatingUserId is passed from auth context, not payload
}

export interface UpdateDepartmentPayload { // Added
  name?: string;
  description?: string | null;
  isActive?: boolean;
  headUserId?: number | null;
}

export interface PaginatedDepartments { // Added
  departments: Department[];
  total: number;
}
