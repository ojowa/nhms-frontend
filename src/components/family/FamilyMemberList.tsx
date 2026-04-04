import { FamilyMember } from '@/types/family';
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';

interface FamilyMemberListProps {
  familyMembers: FamilyMember[];
  onEdit: (familyMember: FamilyMember) => void;
  onDelete: (familyId: number) => void;
  onResetPassword: (familyId: number) => void; // Added
  disabled?: boolean;
}

const FamilyMemberList: React.FC<FamilyMemberListProps> = ({ familyMembers, onEdit, onDelete, onResetPassword, disabled }) => {
  // ... (empty state)

  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table sx={{ minWidth: 650 }} aria-label="family members table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Relationship</TableCell>
            <TableCell>Date of Birth</TableCell>
            <TableCell>User Account</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {familyMembers.map((member) => (
            <TableRow key={member.familyId}>
              <TableCell>
                {`${member.firstName} ${member.middleName ? member.middleName + ' ' : ''}${member.lastName}`}
              </TableCell>
              <TableCell>{member.relationship}</TableCell>
              <TableCell>{new Date(member.dateOfBirth).toLocaleDateString()}</TableCell>
              <TableCell>{member.userId ? 'Yes' : 'No'}</TableCell>
              <TableCell align="right">
                <IconButton color="primary" onClick={() => onEdit(member)} disabled={disabled}>
                  <EditIcon />
                </IconButton>
                <IconButton color="secondary" onClick={() => onDelete(member.familyId)} disabled={disabled}>
                  <DeleteIcon />
                </IconButton>
                {member.userId && ( // Only show reset password if a user account exists
                  <IconButton 
                    color="info" 
                    onClick={() => onResetPassword(member.familyId)} 
                    disabled={disabled}
                  >
                    <LockResetIcon />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FamilyMemberList;
