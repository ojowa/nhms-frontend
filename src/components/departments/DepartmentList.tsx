// nhms-frontend/src/components/departments/DepartmentList.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import { Department } from '@/types/department';

interface DepartmentListProps {
  departments: Department[];
  onSelectDepartment: (department: Department) => void;
  selectedDepartment: Department | null;
}

const DepartmentList: React.FC<DepartmentListProps> = ({
  departments,
  onSelectDepartment,
  selectedDepartment,
}) => {
  return (
    <TableContainer component={Paper}>
      <Table stickyHeader aria-label="department list table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Head of Department</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {departments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography>No departments found.</Typography>
              </TableCell>
            </TableRow>
          ) : (
            departments.map((dept) => (
              <TableRow
                key={dept.departmentId}
                onClick={() => onSelectDepartment(dept)}
                selected={selectedDepartment?.departmentId === dept.departmentId}
                hover
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{dept.name}</TableCell>
                <TableCell>{dept.description || 'N/A'}</TableCell>
                <TableCell>{dept.isActive ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>
                  {dept.headFirstName && dept.headLastName
                    ? `${dept.headFirstName} ${dept.headLastName}`
                    : 'N/A'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DepartmentList;