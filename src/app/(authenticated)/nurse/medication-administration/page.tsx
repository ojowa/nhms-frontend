'use client';
import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import AdmittedPatientsList from '@/components/nurse/AdmittedPatientsList';
import MedicationAdministrationDetail from '@/components/nurse/MedicationAdministrationDetail';
import withAuth from '@/components/auth/withAuth';
import { UserRole } from '@/types/auth';

function MedicationAdministrationPage() {
    const [selectedAdmission, setSelectedAdmission] = useState<{ patientId: string; admissionId: string } | null>(null);

    const handleSelectPatient = (patientId: string, admissionId: string) => {
        setSelectedAdmission({ patientId, admissionId });
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                Medication Administration
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ height: '100%' }}>
                        <AdmittedPatientsList onSelectPatient={handleSelectPatient} />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Paper elevation={2} sx={{ height: '100%', p: 2 }}>
                        {selectedAdmission ? (
                            <MedicationAdministrationDetail
                                patientId={selectedAdmission.patientId}
                                admissionId={selectedAdmission.admissionId}
                            />
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%',
                                    minHeight: 300,
                                }}
                            >
                                <Typography variant="h6" color="text.secondary">
                                    Select a patient to view medication details.
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default withAuth(MedicationAdministrationPage, [UserRole.Nurse, UserRole.Admin]);

