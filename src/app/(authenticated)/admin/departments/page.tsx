"use client";
import React, { useState } from 'react';
import { Container, Typography, Paper, Box, Alert, TablePagination } from '@mui/material';
import withAuth from '@/components/auth/withAuth';
import { UserRole } from '@/types/auth';
import DepartmentToolbar from '@/components/departments/DepartmentToolbar';
import DepartmentList from '@/components/departments/DepartmentList';
import DepartmentForm from '@/components/departments/DepartmentForm';
import ManageDepartmentStaffDialog from '@/components/departments/ManageDepartmentStaffDialog';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '@/hooks/useApi';
import { DepartmentTableSkeleton } from '@/components/ui/skeletons';
import { Department, CreateDepartmentPayload, UpdateDepartmentPayload } from '@/types/department';

const DepartmentsPage: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isStaffManagerOpen, setIsStaffManagerOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // React Query hooks
  const { data, isLoading, error } = useDepartments(page + 1, rowsPerPage, searchTerm);
  const createMutation = useCreateDepartment({
    onSuccess: () => {
      showSnackbar('Department created successfully!', 'success');
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      setFormError(err.message);
    },
  });
  const updateMutation = useUpdateDepartment({
    onSuccess: () => {
      showSnackbar('Department updated successfully!', 'success');
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      setFormError(err.message);
    },
  });
  const deleteMutation = useDeleteDepartment({
    onSuccess: () => {
      showSnackbar('Department deleted successfully!', 'success');
      setSelectedDepartment(null);
    },
    onError: (err: any) => {
      showSnackbar(err.message, 'error');
    },
  });

  const departments = data?.departments || [];
  const total = data?.total || 0;

  if (isLoading) {
    return <DepartmentTableSkeleton />;
  }

  const handleSelectDepartment = (department: Department) => {
    setSelectedDepartment(department.departmentId === selectedDepartment?.departmentId ? null : department);
  };

  const handleOpenForm = (editMode = false) => {
    setIsEditMode(editMode);
    if (!editMode) {
      setSelectedDepartment(null);
    }
    setIsFormOpen(true);
  };
  
  const handleFormSubmit = async (values: CreateDepartmentPayload | UpdateDepartmentPayload) => {
    if (isEditMode && selectedDepartment) {
      await updateMutation.mutateAsync({
        id: Number(selectedDepartment.departmentId),
        data: values as UpdateDepartmentPayload,
      });
    } else {
      await createMutation.mutateAsync(values as CreateDepartmentPayload);
    }
  };

  const handleDelete = async () => {
    if (!selectedDepartment) return;
    if (window.confirm(`Are you sure you want to delete "${selectedDepartment.name}"?`)) {
      await deleteMutation.mutateAsync(Number(selectedDepartment.departmentId));
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" gutterBottom>Department Management</Typography>
        
        <DepartmentToolbar
          onAdd={() => handleOpenForm(false)}
          onEdit={() => handleOpenForm(true)}
          onDelete={handleDelete}
          onManageStaff={() => setIsStaffManagerOpen(true)}
          onAssignHOD={() => setIsStaffManagerOpen(true)}
          isDepartmentSelected={!!selectedDepartment}
        />

        {error && <Alert severity="error">{error.message}</Alert>}
        
        <DepartmentList
          departments={departments}
          selectedDepartment={selectedDepartment}
          onSelectDepartment={handleSelectDepartment}
        />
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />

        <DepartmentForm
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={isEditMode ? selectedDepartment : null}
          isEditMode={isEditMode}
          submitting={createMutation.isPending || updateMutation.isPending}
          error={formError}
        />

        {selectedDepartment && (
          <ManageDepartmentStaffDialog
            open={isStaffManagerOpen}
            onClose={() => setIsStaffManagerOpen(false)}
            department={selectedDepartment}
            onStaffUpdated={() => {
              setIsStaffManagerOpen(false);
              showSnackbar('Staff updated successfully!', 'success');
            }}
          />
        )}
      </Paper>
    </Container>
  );
};

export default withAuth(DepartmentsPage, [UserRole.Admin]);
