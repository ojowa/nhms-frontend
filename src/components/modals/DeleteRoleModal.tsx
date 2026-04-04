// nhms-frontend/src/components/admin/DeleteRoleModal.tsx
import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface DeleteRoleModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  roleName: string;
}

const DeleteRoleModal: React.FC<DeleteRoleModalProps> = ({ open, onClose, onConfirm, roleName }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{"Confirm Role Deletion"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you sure you want to delete the role "{roleName}"? This action cannot be undone.
          All users assigned to this role will lose it.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteRoleModal;
