
import React from 'react';
import { Box, Button } from '@mui/material';
import { Add, Edit, Delete, GroupAdd, Person } from '@mui/icons-material';

interface DepartmentToolbarProps {
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onManageStaff: () => void;
  onAssignHOD: () => void;
  isDepartmentSelected: boolean;
}

const DepartmentToolbar: React.FC<DepartmentToolbarProps> = ({
  onAdd,
  onEdit,
  onDelete,
  onManageStaff,
  onAssignHOD,
  isDepartmentSelected,
}) => {
  return (
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Button variant="contained" startIcon={<Add />} onClick={onAdd}>
        Create Department
      </Button>
      <Box>
        <Button
          variant="outlined"
          startIcon={<Edit />}
          onClick={onEdit}
          disabled={!isDepartmentSelected}
          sx={{ mr: 1 }}
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          startIcon={<GroupAdd />}
          onClick={onManageStaff}
          disabled={!isDepartmentSelected}
          sx={{ mr: 1 }}
        >
          Manage Staff
        </Button>
        <Button
          variant="outlined"
          startIcon={<Person />}
          onClick={onAssignHOD}
          disabled={!isDepartmentSelected}
          sx={{ mr: 1 }}
        >
          Assign HOD
        </Button>
        <Button
          variant="outlined"
          startIcon={<Delete />}
          color="error"
          onClick={onDelete}
          disabled={!isDepartmentSelected}
        >
          Delete
        </Button>
      </Box>
    </Box>
  );
};

export default DepartmentToolbar;
