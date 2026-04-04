import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CreateDepartmentPayload, UpdateDepartmentPayload, Department } from '@/types/department';

interface DepartmentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateDepartmentPayload | UpdateDepartmentPayload) => Promise<void>;
  initialData: Department | null;
  isEditMode: boolean;
  submitting: boolean;
  error: string | null;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .required('Department name is required'),
  description: Yup.string()
    .max(255, 'Description cannot exceed 255 characters')
    .nullable(),
});

const DepartmentForm: React.FC<DepartmentFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEditMode,
  submitting,
  error,
}) => {
  const formik = useFormik<CreateDepartmentPayload | UpdateDepartmentPayload>({
    initialValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      ...(isEditMode ? { isActive: initialData?.isActive ?? true } : {}),
      ...(isEditMode ? { headUserId: initialData?.headUserId || null } : {}),
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit(values);
    },
    enableReinitialize: true,
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit Department' : 'Create New Department'}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            fullWidth
            id="name"
            name="name"
            label="Department Name"
            variant="outlined"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            id="description"
            name="description"
            label="Description"
            variant="outlined"
            multiline
            rows={4}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
            sx={{ mb: 2 }}
          />
          {isEditMode && (
            <FormControlLabel
              control={
                <Switch
                  id="isActive"
                  name="isActive"
                  checked={(formik.values as UpdateDepartmentPayload).isActive}
                  onChange={formik.handleChange}
                />
              }
              label="Is Active"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : (isEditMode ? 'Save Changes' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DepartmentForm;