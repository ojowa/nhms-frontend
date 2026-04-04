"use client";
import React from 'react';
import { Modal, Box, Typography, Divider, Button } from '@mui/material';
import { Consultation } from '@/types/consultation';

interface ConsultationDetailsModalProps {
  open: boolean;
  onClose: () => void;
  consultation: Consultation | null;
}

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const ConsultationDetailsModal: React.FC<ConsultationDetailsModalProps> = ({ open, onClose, consultation }) => {
  if (!consultation) {
    return null;
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Consultation Details
        </Typography>
        <Typography variant="body1"><strong>Doctor:</strong> {consultation.doctorName}</Typography>
        <Typography variant="body1"><strong>Date:</strong> {new Date(consultation.startTime).toLocaleDateString()}</Typography>
        <Typography variant="body1"><strong>Time:</strong> {new Date(consultation.startTime).toLocaleTimeString()}</Typography>
        <Typography variant="body1"><strong>Type:</strong> {consultation.consultationType}</Typography>
        <Typography variant="body1"><strong>Status:</strong> {consultation.status}</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>Notes:</Typography>
        <Typography variant="body2">{consultation.notes || 'No notes available.'}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={onClose}>Close</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConsultationDetailsModal;
