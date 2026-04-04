'use client';
import React from 'react';
import {
    Box,
    Typography,
    Alert,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    Paper,
    Button,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { useAdmittedPatients } from '@/hooks/useApi';
import { ListSkeleton } from '@/components/ui/skeletons';
import { useAuth } from '@/contexts/AuthContext';

interface AdmittedPatientsListProps {
    onSelectPatient: (patientId: string, admissionId: string) => void;
}

const AdmittedPatientsList: React.FC<AdmittedPatientsListProps> = ({ onSelectPatient }) => {
    const { user } = useAuth();
    const { data: admissions, isLoading, error } = useAdmittedPatients({
        enabled: !!user?.userId,
    });

    if (isLoading) return <ListSkeleton count={5} />;
    if (error) return <Alert severity="error">{error.message}</Alert>;

    if (!admissions || admissions.length === 0) {
        return <Alert severity="info">No admitted patients found.</Alert>;
    }

    return (
        <Paper elevation={3} sx={{ p: 2, m: 2, maxWidth: 400 }}>
            <Typography variant="h6" gutterBottom>Admitted Patients</Typography>
            <List>
                {admissions.map((admission) => (
                    <React.Fragment key={admission.admissionId}>
                        <ListItem disablePadding>
                          <ListItemButton onClick={() => onSelectPatient(admission.patientId, admission.admissionId)}>
                            <ListItemAvatar>
                              <Avatar>
                                <PersonIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={`${admission.patientFirstName} ${admission.patientLastName}`}
                              secondary={`Admitted: ${new Date(admission.admissionDate).toLocaleDateString()} by Dr. ${admission.doctorLastName}`}
                            />
                            <Button variant="outlined" size="small">View</Button>
                          </ListItemButton>
                        </ListItem>
                        <Divider variant="inset" component="li" />
                    </React.Fragment>
                ))}
            </List>
        </Paper>
    );
};

export default AdmittedPatientsList;
