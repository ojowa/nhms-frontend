'use client';
import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    List,
    ListItem,
    ListItemText,
    Button,
    TextField,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import { medicationAdministrationService } from '@/services/medicationAdministrationService';
import { MedicationAdministration, CreateMedicationAdministrationPayload } from '@/types/medication';
import { useAuth } from '@/contexts/AuthContext';
import { Prescription } from '@/types/emr'; // Assuming Prescription type is available here or from another type file
import { getPrescriptionsByPatientIdAndAdmissionId } from '@/services/emrService'; // Assuming EMR service can fetch prescriptions

interface MedicationAdministrationDetailProps {
    patientId: string;
    admissionId: string;
}

const MedicationAdministrationDetail: React.FC<MedicationAdministrationDetailProps> = ({ patientId, admissionId }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [administrations, setAdministrations] = useState<MedicationAdministration[]>([]);
    const [activePrescriptions, setActivePrescriptions] = useState<Prescription[]>([]);
    const [openAdminDialog, setOpenAdminDialog] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [adminForm, setAdminForm] = useState<Partial<CreateMedicationAdministrationPayload>>({
        dosageGiven: '',
        route: '',
        notes: '',
        status: 'Administered',
    });

    const fetchMedicationData = async () => {
        if (!user?.userId) {
            setError('User not authenticated.');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const [fetchedAdministrations, fetchedPrescriptions] = await Promise.all([
                medicationAdministrationService.getMedicationAdministrations({ admissionId }),
                // Now using the admission-specific prescription fetching
                getPrescriptionsByPatientIdAndAdmissionId(Number(patientId), Number(admissionId)) 
            ]);
            setAdministrations(fetchedAdministrations);
            // Filter prescriptions that are active and not yet fully administered (this logic might be complex)
            setActivePrescriptions(fetchedPrescriptions.filter(p => !p.endDate || new Date(p.endDate) >= new Date()));
        } catch (err: any) {
            setError(err.message || 'Failed to fetch medication data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicationData();
    }, [patientId, admissionId, user]);

    const handleOpenAdminDialog = (prescription: Prescription) => {
        setSelectedPrescription(prescription);
        setAdminForm(prev => ({ ...prev, prescriptionId: prescription.prescriptionId, patientId, admissionId }));
        setOpenAdminDialog(true);
    };

    const handleCloseAdminDialog = () => {
        setOpenAdminDialog(false);
        setSelectedPrescription(null);
        setAdminForm({ dosageGiven: '', route: '', notes: '', status: 'Administered' });
    };

    const handleChangeAdminForm = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setAdminForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitAdministration = async () => {
        if (!selectedPrescription || !user?.userId) return;

        try {
            setLoading(true);
            const payload: CreateMedicationAdministrationPayload = {
                prescriptionId: selectedPrescription.prescriptionId.toString(), // Ensure string type
                admissionId: admissionId,
                patientId: patientId,
                administeringNurseId: user.userId!,
                dosageGiven: adminForm.dosageGiven,
                route: adminForm.route,
                notes: adminForm.notes,
                status: adminForm.status,
            };
            await medicationAdministrationService.createMedicationAdministration(payload);
            handleCloseAdminDialog();
            fetchMedicationData(); // Refresh data
        } catch (err: any) {
            setError(err.message || 'Failed to record administration.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Medication Administration</Typography>
            <Typography variant="subtitle1">Patient: {patientId} | Admission: {admissionId}</Typography>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
                <Typography variant="h6">Active Prescriptions</Typography>
                {activePrescriptions.length > 0 ? (
                    <List>
                        {activePrescriptions.map((prescription) => (
                            <ListItem key={prescription.prescriptionId}>
                                <ListItemText
                                    primary={`${prescription.medicationName} - ${prescription.dosage} (${prescription.frequency})`}
                                    secondary={`Prescribed by: Dr. ${prescription.doctorLastName} | Notes: ${prescription.notes}`}
                                />
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleOpenAdminDialog(prescription)}
                                >
                                    Administer
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography>No active prescriptions for this patient in this admission.</Typography>
                )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
                <Typography variant="h6">Administration History</Typography>
                {administrations.length > 0 ? (
                    <List>
                        {administrations.map((admin) => (
                            <ListItem key={admin.administrationId}>
                                <ListItemText
                                    primary={`${admin.medicationName || 'N/A'} - ${admin.dosageGiven} (${admin.route})`}
                                    secondary={`Administered by: ${admin.nurseFirstName} ${admin.nurseLastName} on ${new Date(admin.administrationTime).toLocaleString()} - Status: ${admin.status}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography>No medication administration history for this admission.</Typography>
                )}
            </Box>

            {/* Administration Dialog */}
            <Dialog open={openAdminDialog} onClose={handleCloseAdminDialog}>
                <DialogTitle>Administer Medication: {selectedPrescription?.medicationName}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        Prescription: {selectedPrescription?.dosage} ({selectedPrescription?.frequency})
                    </Typography>
                    <TextField
                        margin="dense"
                        name="dosageGiven"
                        label="Dosage Given"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={adminForm.dosageGiven}
                        onChange={handleChangeAdminForm}
                        sx={{ mt: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="route"
                        label="Route"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={adminForm.route}
                        onChange={handleChangeAdminForm}
                        sx={{ mt: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="notes"
                        label="Notes (e.g., patient reaction)"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={adminForm.notes}
                        onChange={handleChangeAdminForm}
                        sx={{ mt: 2 }}
                    />
                    <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            name="status"
                            value={adminForm.status}
                            label="Status"
                            onChange={handleChangeAdminForm}
                        >
                            <MenuItem value={'Administered'}>Administered</MenuItem>
                            <MenuItem value={'Missed'}>Missed</MenuItem>
                            <MenuItem value={'Refused'}>Refused</MenuItem>
                            <MenuItem value={'Held'}>Held</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAdminDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmitAdministration} color="primary" variant="contained" disabled={loading}>
                        Record Administration
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default MedicationAdministrationDetail;
