'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Chip,
    Stack,
    Tabs,
    Tab,
} from '@mui/material';
import Link from 'next/link';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointmentsByStatus } from '@/services/appointmentService';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { ArrowForward } from '@mui/icons-material';
import { admissionService } from '@/services/admissionService';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { fetchAllDepartments } from '@/services/departmentService';
import { fetchDoctors } from '@/services/userService';
import { Department } from '@/types/department';
import { Doctor } from '@/types/user';
import ReferralWorkflowDialog, { ReferralWorkflowPayload } from '@/components/admissions/ReferralWorkflowDialog';

function DoctorConsultationsPage() {
    const { user, loading: userLoading } = useAuth();
    const { showSnackbar } = useSnackbar();
    const [consultations, setConsultations] = useState<Appointment[]>([]);
    const [admittedConsultations, setAdmittedConsultations] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [admissionIdByPatient, setAdmissionIdByPatient] = useState<Record<number, string>>({});
    const [departments, setDepartments] = useState<Department[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [referralDialogOpen, setReferralDialogOpen] = useState(false);
    const [selectedReferralAdmissionId, setSelectedReferralAdmissionId] = useState<string | null>(null);
    const [submittingReferral, setSubmittingReferral] = useState(false);

    useEffect(() => {
        const fetchConsultations = async () => {
            if (!user || userLoading) return;

            setLoading(true);
            try {
                // Fetch appointments that are either Scheduled, Approved (for telemedicine), or In Consultation
                const statusesToFetch: AppointmentStatus[] = ['SCHEDULED', 'ASSIGNED', 'IN_CONSULTATION'];
                let allConsultations: Appointment[] = [];

                // Fetch for each status and combine (or modify backend to get multiple statuses)
                for (const status of statusesToFetch) {
                    const fetched = await getAppointmentsByStatus(status);
                    allConsultations = [...allConsultations, ...fetched.data];
                }

                // Filter to include only doctor/telemedicine consultations
                const doctorConsults = allConsultations.filter(appt => 
                    appt.serviceType === 'Doctor Consultation' || appt.serviceType === 'Telemedicine Consultation'
                );

                // Sort by appointment date/time
                doctorConsults.sort((a, b) => {
                    const dateA = a.dateTime ? new Date(a.dateTime).getTime() : Number.MAX_SAFE_INTEGER;
                    const dateB = b.dateTime ? new Date(b.dateTime).getTime() : Number.MAX_SAFE_INTEGER;
                    return dateA - dateB;
                });
                
                setConsultations(doctorConsults);

                const uniquePatientIds = Array.from(
                    new Set(doctorConsults.map((c) => c.patientId).filter(Boolean))
                );

                const admissionMap: Record<number, string> = {};
                const admittedPatientSet = new Set<number>();
                try {
                    const activeAdmissions = await admissionService.getActiveAdmissionsByPatientIds(uniquePatientIds);
                    activeAdmissions.forEach((entry) => {
                        admittedPatientSet.add(Number(entry.patientId));
                        admissionMap[Number(entry.patientId)] = String(entry.admissionId);
                    });
                } catch (admissionError) {
                    console.error('Failed to resolve active admissions map:', admissionError);
                }
                setAdmissionIdByPatient(admissionMap);

                setAdmittedConsultations(
                    doctorConsults.filter((consultation) => admittedPatientSet.has(consultation.patientId))
                );

                const [departmentList, doctorList] = await Promise.all([
                    fetchAllDepartments(),
                    fetchDoctors(),
                ]);
                setDepartments(departmentList);
                setDoctors(doctorList);
            } catch (err: any) {
                console.error("Failed to fetch doctor consultations:", err);
                setError(err.message || 'Failed to fetch consultations.');
            } finally {
                setLoading(false);
            }
        };

        fetchConsultations();
    }, [user, userLoading]);

    const openQuickReferral = (admissionId: string) => {
        setSelectedReferralAdmissionId(admissionId);
        setReferralDialogOpen(true);
    };

    const handleQuickReferralSubmit = async (payload: ReferralWorkflowPayload) => {
        if (!selectedReferralAdmissionId) return;
        try {
            setSubmittingReferral(true);
            const reasonWithUrgency = `[${payload.urgency}] ${payload.reason}`;
            await admissionService.createInpatientClinicalNote(selectedReferralAdmissionId, {
                noteType: 'Referral',
                noteText: reasonWithUrgency,
                dispositionAction: 'Refer to Specialist',
            });
            await admissionService.createInpatientCareTransition(selectedReferralAdmissionId, {
                transitionType: 'Referral',
                reason: reasonWithUrgency,
                targetDepartmentId: payload.targetDepartmentId ?? null,
                targetDoctorId: payload.targetDoctorId ?? null,
            });
            showSnackbar('Referral submitted successfully.', 'success');
            setReferralDialogOpen(false);
            setSelectedReferralAdmissionId(null);
        } catch (err: any) {
            showSnackbar(err?.response?.data?.message || err?.message || 'Failed to submit referral.', 'error');
        } finally {
            setSubmittingReferral(false);
        }
    };

    if (userLoading || loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                My Consultations
            </Typography>

            <Tabs
                value={activeTab}
                onChange={(_event, value) => setActiveTab(value)}
                sx={{ mb: 2 }}
            >
                <Tab label="All Consultations" />
                <Tab label="Admitted Patients" />
            </Tabs>

            {activeTab === 0 && (consultations.length === 0 ? (
                <Alert severity="info">No active or upcoming consultations found.</Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table aria-label="doctor consultations table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Patient Name</TableCell>
                                <TableCell>Appointment Date & Time</TableCell>
                                <TableCell>Service Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Reason</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {consultations.map((consultation) => (
                                <TableRow key={consultation.id}>
                                    <TableCell>{consultation.patientFirstName} {consultation.patientLastName}</TableCell>
                                    <TableCell>{consultation.dateTime ? new Date(consultation.dateTime).toLocaleString() : 'N/A'}</TableCell>
                                    <TableCell>{consultation.serviceType}</TableCell>
                                    <TableCell>
                                    <Chip 
                                            label={consultation.status} 
                                            color={
                                                consultation.status === 'COMPLETED' ? 'success' :
                                                consultation.status === 'CANCELLED' ? 'error' :
                                                consultation.status === 'IN_CONSULTATION' ? 'warning' :
                                                'info'
                                            } 
                                        />
                                    </TableCell>
                                    <TableCell>{consultation.reason}</TableCell>
                                    <TableCell align="right">
                                        <Link href={`/doctor/consultation/${consultation.id}`} passHref>
                                            <Button variant="outlined" endIcon={<ArrowForward />}>
                                                View/Start Consultation
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ))}

            {activeTab === 1 && (admittedConsultations.length === 0 ? (
                <Alert severity="info">No admitted patient consultations found.</Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table aria-label="admitted consultations table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Patient Name</TableCell>
                                <TableCell>Appointment Date & Time</TableCell>
                                <TableCell>Service Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Reason</TableCell>
                                <TableCell align="right">Referral / Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {admittedConsultations.map((consultation) => (
                                <TableRow key={`admitted-${consultation.id}`}>
                                    <TableCell>{consultation.patientFirstName} {consultation.patientLastName}</TableCell>
                                    <TableCell>{consultation.dateTime ? new Date(consultation.dateTime).toLocaleString() : 'N/A'}</TableCell>
                                    <TableCell>{consultation.serviceType}</TableCell>
                                    <TableCell>
                                        <Chip label="Admitted" color="warning" />
                                    </TableCell>
                                    <TableCell>{consultation.reason}</TableCell>
                                    <TableCell align="right">
                                        {admissionIdByPatient[consultation.patientId] ? (
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => openQuickReferral(admissionIdByPatient[consultation.patientId])}
                                                >
                                                    Quick Refer
                                                </Button>
                                                <Link href={`/doctor/inpatient/${admissionIdByPatient[consultation.patientId]}`} passHref>
                                                    <Button variant="contained" endIcon={<ArrowForward />}>
                                                        Continue
                                                    </Button>
                                                </Link>
                                            </Stack>
                                        ) : (
                                            <Button variant="outlined" disabled>
                                                Admission Not Linked
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ))}

            <ReferralWorkflowDialog
                open={referralDialogOpen}
                onClose={() => {
                    if (submittingReferral) return;
                    setReferralDialogOpen(false);
                    setSelectedReferralAdmissionId(null);
                }}
                onSubmit={handleQuickReferralSubmit}
                loading={submittingReferral}
                departments={departments}
                doctors={doctors}
                title="Quick Referral"
            />
        </Box>
    );
}

export default withAuth(DoctorConsultationsPage, ['Doctor']);
