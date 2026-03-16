
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Paper, Box, CircularProgress, Alert, TablePagination } from '@mui/material';
import withAuth from '@/components/auth/withAuth';
import DepartmentToolbar from '@/components/departments/DepartmentToolbar';
import DepartmentList from '@/components/departments/DepartmentList';
import DepartmentForm from '@/components/departments/DepartmentForm';
import ManageDepartmentStaffDialog from '@/components/departments/ManageDepartmentStaffDialog';
import { useSnackbar } from '@/contexts/SnackbarContext';

import * as departmentService from '@/services/departmentService';
import { Department, CreateDepartmentPayload, UpdateDepartmentPayload } from '@/types/department';

const DepartmentsPage: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [isStaffManagerOpen, setIsStaffManagerOpen] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const { departments: fetchedDepartments, total: totalCount } = await departmentService.getDepartments(page + 1, rowsPerPage, searchTerm);
      setDepartments(fetchedDepartments);
      setTotal(totalCount);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch departments.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

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
    setFormSubmitting(true);
    setFormError(null);
    try {
            if (isEditMode && selectedDepartment) {
              await departmentService.updateDepartment(selectedDepartment.departmentId, values as UpdateDepartmentPayload);
              showSnackbar('Department updated successfully!', 'success');
            } else {
              await departmentService.createDepartment(values as CreateDepartmentPayload);
              showSnackbar('Department created successfully!', 'success');
            }      setIsFormOpen(false);
      fetchDepartments();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDepartment) return;
    if (window.confirm(`Are you sure you want to delete "${selectedDepartment.name}"?`)) {
      try {
        await departmentService.deleteDepartment(selectedDepartment.departmentId);
        showSnackbar('Department deleted successfully!', 'success');
        setSelectedDepartment(null);
        fetchDepartments();
      } catch (err: any) {
        showSnackbar(err.message, 'error');
      }
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
          onAssignHOD={() => setIsStaffManagerOpen(true)} // Can use the same dialog
          isDepartmentSelected={!!selectedDepartment}
        />

        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        
        {!loading && !error && (
          <>
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
          </>
        )}

        <DepartmentForm
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={isEditMode ? selectedDepartment : null}
          isEditMode={isEditMode}
          submitting={formSubmitting}
          error={formError}
        />

        {selectedDepartment && (
          <ManageDepartmentStaffDialog
            open={isStaffManagerOpen}
            onClose={() => setIsStaffManagerOpen(false)}
            department={selectedDepartment}
            onStaffUpdated={() => {
              // Optionally refresh HOD info
              fetchDepartments();
            }}
          />
        )}
      </Paper>
    </Container>
  );
};

export default withAuth(DepartmentsPage, ['Admin', 'RecordStaff']);
