'use client';
import { useState, useEffect, useCallback } from 'react';
import withAuth from '@/components/auth/withAuth';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Search, Clear, Add, Edit, Delete } from '@mui/icons-material';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '@/services/departmentService';
import {
  Department,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from '@/types/department';

function DepartmentManagementPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination and search
  const [page, setPage] = useState(0); // 0-indexed for Mui TablePagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');

  // Dialog for Create/Edit
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [dialogPayload, setDialogPayload] = useState<CreateDepartmentPayload | UpdateDepartmentPayload>({ name: '', description: '' });

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDepartments(page + 1, rowsPerPage, currentSearchTerm);
      setDepartments(response.departments);
      setTotalDepartments(response.total);
    } catch (err: any) {
      setError('Failed to fetch departments: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, currentSearchTerm]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Pagination Handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
  };

  // Search Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    setCurrentSearchTerm(searchTerm);
    setPage(0); // Reset to first page on new search
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentSearchTerm('');
    setPage(0); // Reset to first page on clear
  };

  // Dialog Handlers
  const handleOpenCreateDialog = () => {
    setIsEditMode(false);
    setCurrentDepartment(null);
    setDialogPayload({ name: '', description: '', isActive: true });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (department: Department) => {
    setIsEditMode(true);
    setCurrentDepartment(department);
    setDialogPayload({
      name: department.name,
      description: department.description,
      isActive: department.isActive,
      headUserId: department.headUserId,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null); // Clear any dialog-specific errors
  };

  const handleDialogChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target;
    setDialogPayload(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveDepartment = async () => {
    try {
      if (isEditMode && currentDepartment) {
        await updateDepartment(currentDepartment.departmentId, dialogPayload);
      } else {
        await createDepartment(dialogPayload as CreateDepartmentPayload);
      }
      fetchDepartments(); // Refresh list
      handleCloseDialog();
    } catch (err: any) {
      setError('Failed to save department: ' + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  const handleDeleteDepartment = async (departmentId: number) => {
    if (window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      try {
        await deleteDepartment(departmentId);
        fetchDepartments(); // Refresh list
      } catch (err: any) {
        setError('Failed to delete department: ' + (err.response?.data?.message || err.message));
        console.error(err);
      }
    }
  };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Department Management
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            label="Search Departments"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={(e) => { if (e.key === 'Enter') handleSearchSubmit(); }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {searchTerm && (
                    <IconButton onClick={handleClearSearch} edge="end" size="small">
                      <Clear />
                    </IconButton>
                  )}
                  <IconButton onClick={handleSearchSubmit} edge="end" size="small">
                    <Search />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreateDialog}>
            Create Department
          </Button>
        </Box>

        <TableContainer>
          <Table stickyHeader aria-label="departments table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Head of Department</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No departments found.
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((department) => (
                  <TableRow key={department.departmentId}>
                    <TableCell>{department.departmentId}</TableCell>
                    <TableCell>{department.name}</TableCell>
                    <TableCell>{department.description || 'N/A'}</TableCell>
                    <TableCell>{department.headFirstName || 'N/A'} {department.headLastName || ''}</TableCell>
                    <TableCell>{department.isActive ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenEditDialog(department)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteDepartment(department.departmentId)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalDepartments}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Create/Edit Department Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit Department' : 'Create New Department'}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Department Name"
            type="text"
            fullWidth
            variant="outlined"
            value={dialogPayload.name || ''}
            onChange={handleDialogChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={dialogPayload.description || ''}
            onChange={handleDialogChange}
            sx={{ mb: 2 }}
          />
          {isEditMode && (
            <FormControlLabel
              control={
                <Switch
                  checked={(dialogPayload as UpdateDepartmentPayload).isActive || false}
                  onChange={handleDialogChange}
                  name="isActive"
                  color="primary"
                />
              }
              label="Is Active"
            />
          )}
          {/* TODO: Add Head of Department selection once user search/selection is available */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveDepartment} variant="contained" color="primary">
            {isEditMode ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default withAuth(DepartmentManagementPage, ['RecordStaff', 'Admin']);