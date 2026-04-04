// nhms-frontend/src/components/modals/DischargeWorkflowModal.tsx

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { dischargePatient, createDischargeSummary } from '@/services/dischargeService';
import { getAdmittedPatients } from '@/services/admissionService'; // Need a service to fetch admitted patients
import { Admission } from '@/types/admission'; // Use Admission instead of AdmittedPatient
import { DischargeSummaryPayload } from '@/types/discharge'; // Import types

interface DischargeWorkflowModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800, // Increased width for the form
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh', // Limit height
  overflowY: 'auto', // Enable scrolling
} as const;

const steps = ['Select Patient', 'Create Discharge Summary', 'Confirm Discharge'];

const DischargeWorkflowModal: React.FC<DischargeWorkflowModalProps> = ({ open, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [admittedPatients, setAdmittedPatients] = useState<Admission[]>([]);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);

  // Discharge Summary Form State
  const [diagnosisAtDischarge, setDiagnosisAtDischarge] = useState('');
  const [proceduresPerformed, setProceduresPerformed] = useState('');
  const [medicationOnDischarge, setMedicationOnDischarge] = useState('');
  const [followUpInstructions, setFollowUpInstructions] = useState('');

  useEffect(() => {
    if (open && user?.userId) {
      const fetchAdmittedPatients = async () => {
        setLoading(true);
        try {
          // Assuming getAdmittedPatients now takes requestingUserId
          const patients = await getAdmittedPatients();
          setAdmittedPatients(patients);
        } catch (err: any) {
          setError(err.message || 'Failed to fetch admitted patients.');
          showSnackbar(err.message || 'Failed to fetch admitted patients.', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchAdmittedPatients();
    } else if (!open) {
      // Reset state when modal is closed
      setActiveStep(0);
      setSelectedAdmission(null);
      setDiagnosisAtDischarge('');
      setProceduresPerformed('');
      setMedicationOnDischarge('');
      setFollowUpInstructions('');
      setError(null);
    }
  }, [open, user?.userId, showSnackbar]);

  const handleNext = () => {
    if (activeStep === 0 && !selectedAdmission) {
      setError('Please select a patient admission to proceed.');
      return;
    }
    if (activeStep === 1 && !diagnosisAtDischarge) {
      setError('Diagnosis at discharge is required.');
      return;
    }
    setError(null);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFinalDischarge = async () => {
    if (!user || !user.userId || !user.patientId) { // Doctor should have a user_id
      showSnackbar('User information is missing.', 'error');
      return;
    }
    if (!selectedAdmission) {
      showSnackbar('No patient admission selected for discharge.', 'error');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create Discharge Summary
      const dischargeSummaryPayload: DischargeSummaryPayload = {
        admissionId: Number(selectedAdmission.admissionId),
        patientId: Number(selectedAdmission.patientId),
        doctorId: user.userId, // Assuming the discharging user is the doctor
        admissionDate: new Date(selectedAdmission.admissionDate),
        dischargeDate: new Date(), // Current date as discharge date
        diagnosisAtDischarge,
        proceduresPerformed,
        medicationOnDischarge,
        followUpInstructions,
      };

      await createDischargeSummary(dischargeSummaryPayload);
      showSnackbar('Discharge summary created successfully!', 'success');

      // 2. Discharge Patient (updates admission status)
      await dischargePatient(Number(selectedAdmission.admissionId));
      showSnackbar('Patient discharged successfully!', 'success');

      onSuccess(); // Trigger parent's success handler (e.g., refresh patient list)
      onClose();
    } catch (err: any) {
      console.error('Error during patient discharge workflow:', err);
      setError(err.message || 'Failed to complete discharge process.');
      showSnackbar(err.message || 'Failed to complete discharge process.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Select Patient Admission</Typography>
            <TextField
              select
              label="Admitted Patient"
              fullWidth
              value={selectedAdmission?.admissionId || ''}
              onChange={(e) => setSelectedAdmission(admittedPatients.find(p => p.admissionId === e.target.value) || null)}
              helperText="Select an admitted patient to create a discharge summary for."
              disabled={loading}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {admittedPatients.map((patient) => (
                <MenuItem key={patient.admissionId} value={patient.admissionId}>
                  {`ID: ${patient.admissionId} - ${patient.patientFirstName} ${patient.patientLastName} (Admitted: ${new Date(patient.admissionDate).toLocaleDateString()})`}
                </MenuItem>
              ))}
            </TextField>
            {admittedPatients.length === 0 && !loading && (
              <Alert severity="info" sx={{ mt: 2 }}>No patients currently admitted.</Alert>
            )}
          </Box>
        );
      case 1:
        return (
          <Box component="form" sx={{ display: 'grid', gap: 2 }}>
            <Typography variant="h6" gutterBottom>Discharge Summary Details</Typography>
            {selectedAdmission && (
              <Alert severity="info">
                Discharging: {selectedAdmission.patientFirstName} {selectedAdmission.patientLastName} (Admission ID: {selectedAdmission.admissionId})
              </Alert>
            )}
            <TextField
              label="Diagnosis at Discharge"
              fullWidth
              multiline
              rows={3}
              value={diagnosisAtDischarge}
              onChange={(e) => setDiagnosisAtDischarge(e.target.value)}
              required
            />
            <TextField
              label="Procedures Performed (Optional)"
              fullWidth
              multiline
              rows={2}
              value={proceduresPerformed}
              onChange={(e) => setProceduresPerformed(e.target.value)}
            />
            <TextField
              label="Medication on Discharge (Optional)"
              fullWidth
              multiline
              rows={3}
              value={medicationOnDischarge}
              onChange={(e) => setMedicationOnDischarge(e.target.value)}
            />
            <TextField
              label="Follow-up Instructions (Optional)"
              fullWidth
              multiline
              rows={3}
              value={followUpInstructions}
              onChange={(e) => setFollowUpInstructions(e.target.value)}
            />
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Confirm Discharge</Typography>
            {selectedAdmission && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Confirming discharge for: {selectedAdmission.patientFirstName} {selectedAdmission.patientLastName} (Admission ID: {selectedAdmission.admissionId})
                <br />
                A discharge summary will be created and the patient's admission status will be updated.
              </Alert>
            )}
            <Typography variant="body1">
              **Diagnosis at Discharge:** {diagnosisAtDischarge || 'N/A'}
            </Typography>
            <Typography variant="body1">
              **Procedures Performed:** {proceduresPerformed || 'N/A'}
            </Typography>
            <Typography variant="body1">
              **Medication on Discharge:** {medicationOnDischarge || 'N/A'}
            </Typography>
            <Typography variant="body1">
              **Follow-up Instructions:** {followUpInstructions || 'N/A'}
            </Typography>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="discharge-workflow-modal-title">
      <Box sx={style}>
        <Typography id="discharge-workflow-modal-title" variant="h5" component="h2" gutterBottom>
          Discharge Patient Workflow
        </Typography>

        <Stepper activeStep={activeStep} sx={{ my: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <div>
          {getStepContent(activeStep)}
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={activeStep === steps.length - 1 ? handleFinalDischarge : handleNext} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : (activeStep === steps.length - 1 ? 'Finalize Discharge' : 'Next')}
            </Button>
          </Box>
        </div>
      </Box>
    </Modal>
  );
};

export default DischargeWorkflowModal;
