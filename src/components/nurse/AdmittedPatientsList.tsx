'use client';
import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
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
import { Person as PersonIcon, LocalHospital as LocalHospitalIcon } from '@mui/icons-material';
import { admissionService, getAdmittedPatients } from '@/services/admissionService';
import { Admission } from '@/types/admission';
import { useAuth } from '@/contexts/AuthContext';

interface AdmittedPatientsListProps {
    onSelectPatient: (patientId: string, admissionId: string) => void;
}

const AdmittedPatientsList: React.FC<AdmittedPatientsListProps> = ({ onSelectPatient }) => {
    const { user } = useAuth();
    const [admissions, setAdmissions] = useState<Admission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAdmittedPatients = async () => {
            if (!user?.userId) {
                setError('User not authenticated.');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const data = await getAdmittedPatients(user.userId);
                setAdmissions(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch admitted patients.');
            } finally {
                setLoading(false);
            }
        };

        fetchAdmittedPatients();
    }, [user]);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    if (admissions.length === 0) {
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
