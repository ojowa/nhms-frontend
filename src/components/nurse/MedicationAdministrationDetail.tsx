'use client';
import React, { useState } from 'react';
import {
    Box,
    Typography,
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
    CircularProgress,
} from '@mui/material';
import { useMedicationAdministrations, useCreateMedicationAdministration, usePrescriptionsByAdmission } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { Prescription } from '@/types/emr';

interface MedicationAdministrationDetailProps {
    patientId: string;
    admissionId: string;
}

const MedicationAdministrationDetail: React.FC<MedicationAdministrationDetailProps> = ({ patientId, admissionId }) => {
    const { user } = useAuth();
    const [openAdminDialog, setOpenAdminDialog] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [adminForm, setAdminForm] = useState({
        dosageGiven: '',
        route: '',
        notes: '',
        status: 'Administered',
    });

    // React Query hooks
    const { data: administrations, isLoading: loadingAdmins } = useMedicationAdministrations(
        { admissionId },
        { enabled: !!admissionId }
    );
    
    const { data: prescriptions, isLoading: loadingPrescriptions } = usePrescriptionsByAdmission(
        { patientId: Number(patientId), admissionId: Number(admissionId) },
        { enabled: !!patientId && !!admissionId }
    );
    
    const createMutation = useCreateMedicationAdministration({
        onSuccess: () => {
            handleCloseAdminDialog();
        },
    });

    const activePrescriptions = prescriptions?.filter(p => !p.endDate || new Date(p.endDate) >= new Date()) || [];

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
            await createMutation.mutateAsync({
                ...adminForm,
                dosageGiven: Number(adminForm.dosageGiven),
                administeredBy: user.userId,
                prescriptionId: selectedPrescription.prescriptionId,
                patientId: Number(patientId),
                admissionId: Number(admissionId),
            } as any);
        } catch (err: any) {
            console.error('Error administering medication:', err);
        }
    };

    if (loadingAdmins || loadingPrescriptions) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Active Prescriptions</Typography>
            {activePrescriptions.length === 0 ? (
                <Alert severity="info">No active prescriptions for this patient.</Alert>
            ) : (
                <List>
                    {activePrescriptions.map((prescription) => (
                        <React.Fragment key={prescription.prescriptionId}>
                            <ListItem
                                secondaryAction={
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleOpenAdminDialog(prescription)}
                                    >
                                        Administer
                                    </Button>
                                }
                            >
                                <ListItemText
                                    primary={prescription.medicationName}
                                    secondary={`${prescription.dosage} - ${prescription.frequency}`}
                                />
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>
            )}

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Administration History</Typography>
            {administrations && administrations.length > 0 ? (
                <List>
                    {administrations.map((admin: any) => (
                        <React.Fragment key={admin.administrationId}>
                            <ListItem>
                                <ListItemText
                                    primary={`${admin.medicationName} - ${admin.dosageGiven}${admin.unit}`}
                                    secondary={`Given on ${new Date(admin.administrationDate).toLocaleString()} by Nurse ${admin.nurseName}`}
                                />
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>
            ) : (
                <Alert severity="info">No medication administrations recorded yet.</Alert>
            )}

            {/* Administration Dialog */}
            <Dialog open={openAdminDialog} onClose={handleCloseAdminDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Administer Medication</DialogTitle>
                <DialogContent dividers>
                    {selectedPrescription && (
                        <>
                            <Typography variant="subtitle2" gutterBottom>
                                {selectedPrescription.medicationName} ({selectedPrescription.dosage})
                            </Typography>
                            <TextField
                                label="Dosage Given"
                                name="dosageGiven"
                                type="number"
                                fullWidth
                                margin="normal"
                                value={adminForm.dosageGiven}
                                onChange={handleChangeAdminForm}
                            />
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Route</InputLabel>
                                <Select
                                    name="route"
                                    value={adminForm.route}
                                    label="Route"
                                    onChange={handleChangeAdminForm}
                                >
                                    <MenuItem value="Oral">Oral</MenuItem>
                                    <MenuItem value="IV">IV</MenuItem>
                                    <MenuItem value="IM">IM</MenuItem>
                                    <MenuItem value="Subcutaneous">Subcutaneous</MenuItem>
                                    <MenuItem value="Topical">Topical</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Notes"
                                name="notes"
                                multiline
                                rows={3}
                                fullWidth
                                margin="normal"
                                value={adminForm.notes}
                                onChange={handleChangeAdminForm}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAdminDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmitAdministration}
                        variant="contained"
                        disabled={createMutation.isPending || !adminForm.dosageGiven || !adminForm.route}
                    >
                        {createMutation.isPending ? 'Administering...' : 'Administer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MedicationAdministrationDetail;
