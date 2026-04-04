// nhms-frontend/src/components/lab/OrderLabTestModal.tsx
import React, { useState } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useSnackbar } from '@/contexts/SnackbarContext'; // Assuming a SnackbarContext for feedback
import * as labRequestService from '@/services/labRequestService'; // Client-side service
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

interface OrderLabTestModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: number;
    appointmentId: number;
    doctorId: number;
    onLabRequestCreated: () => void; // Callback to refresh data after creation
}

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const OrderLabTestModal: React.FC<OrderLabTestModalProps> = ({
    isOpen,
    onClose,
    patientId,
    appointmentId,
    doctorId,
    onLabRequestCreated,
}) => {
    const { user } = useAuth(); // Get user from AuthContext
    const [testType, setTestType] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showSnackbar } = useSnackbar();

    // Check if the current user has 'Patient' or 'Officer' roles
    const isPatientOrOfficer = user?.roles?.some(
        (role) => role === 'Patient' || role === 'Officer'
    );

    // If the user is a Patient or Officer, do not render the modal
    if (isPatientOrOfficer) {
        // Optionally, you might want to show a message or log here,
        // but for removal of UI, simply returning null is sufficient.
        return null;
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await labRequestService.createLabRequest({
                appointment_id: appointmentId,
                patient_id: patientId,
                doctor_id: doctorId,
                test_type: testType,
                reason: reason,
            });
            showSnackbar('Lab request created successfully!', 'success');
            onLabRequestCreated(); // Notify parent to refresh data
            onClose(); // Close modal
            setTestType(''); // Clear form
            setReason('');
        } catch (err: any) {
            console.error('Full error details:', err);
            console.error('Error response:', err.response);
            console.error('Error status:', err.response?.status);
            console.error('Error data:', err.response?.data);

            let userFriendlyMessage = 'Failed to create lab request.';
            if (err.response) {
                const status = err.response.status;
                if (status === 403) {
                    userFriendlyMessage = 'Permission denied: You do not have permission to order lab tests.';
                } else if (status === 400) {
                    userFriendlyMessage = err.response.data?.message || 'Invalid data: Please check the test type and reason.';
                } else if (status === 401) {
                    userFriendlyMessage = 'Unauthorized: Please log in again.';
                } else if (status === 500) {
                    userFriendlyMessage = 'Server error: Please try again later or contact support.';
                } else {
                    userFriendlyMessage = err.response.data?.message || userFriendlyMessage;
                }
            } else {
                userFriendlyMessage = err.message || userFriendlyMessage;
            }

            setError(userFriendlyMessage);
            showSnackbar(userFriendlyMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            aria-labelledby="order-lab-test-modal-title"
            aria-describedby="order-lab-test-modal-description"
        >
            <Box sx={style} component="form" onSubmit={handleSubmit}>
                <Typography id="order-lab-test-modal-title" variant="h6" component="h2" gutterBottom>
                    Order Lab Test
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                    label="Test Type"
                    fullWidth
                    required
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                    margin="normal"
                    disabled={loading}
                />
                <TextField
                    label="Reason for Test"
                    fullWidth
                    multiline
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    margin="normal"
                    disabled={loading}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                    <Button variant="outlined" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : null}>
                        {loading ? 'Ordering...' : 'Order Test'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default OrderLabTestModal;