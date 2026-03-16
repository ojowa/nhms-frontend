'use client';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
    Alert,
    Chip,
    Divider,
    Avatar,
    IconButton,
    Tooltip,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
    Person as PersonIcon,
    MedicalServices as MedicalIcon,
    Event as EventIcon,
    Description as DescriptionIcon,
    Send as SendIcon,
    Refresh as RefreshIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
} from '@mui/icons-material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUsers } from '@/services/userAdminService';
import { getDepartments } from '@/services/departmentService';
import { bookAppointment } from '@/services/appointmentService';
import { User } from '@/types/admin';
import { UserRole } from '@/types/auth';
import { Department } from '@/types/department';
import { BookAppointmentPayload, AppointmentType } from '@/types/appointment';


const RecordStaffPhysicalConsultationForm: React.FC = () => {
    const { user } = useAuth();
    const currentUserId = user?.userId;
    const [patientId, setPatientId] = useState<number | null>(null);
    const [departmentId, setDepartmentId] = useState<number | null>(null);

    const [appointmentDateTime, setAppointmentDateTime] = useState<Date | null>(new Date());
    const [reason, setReason] = useState('');
    const appointmentType: AppointmentType = 'Doctor Consultation'; // Fixed for physical consultation

    const [patients, setPatients] = useState<User[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);


    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true); // For initial data fetch
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setPageLoading(true);
                const [patientsRes, departmentsRes] = await Promise.all([
                    getAllUsers(1, 1000, '', `${UserRole.Patient},${UserRole.Officer}`),
                    getDepartments(1, 1000, ''),
                ]);

                // Filter users to only include those with a patientId and ensure patientId is a number
                setPatients(patientsRes.users.filter(p => p.patientId != null && p.patientId !== undefined).map(p => ({ ...p, patientId: Number(p.patientId) })));
                setDepartments(departmentsRes.departments);

            } catch (err) {
                setError('Failed to fetch necessary data. Please refresh the page.');
            } finally {
                setPageLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // --- Validation ---
        if (!appointmentDateTime) {
            setError('Appointment date and time are required.');
            setLoading(false);
            return;
        }

        if (new Date(appointmentDateTime) <= new Date()) {
            setError('Appointment date and time must be in the future.');
            setLoading(false);
            return;
        }

        if (patientId === null) {
            setError('Please select a patient.');
            setLoading(false);
            return;
        }

        if (departmentId === null) {
            setError('Please select a department.');
            setLoading(false);
            return;
        }

        if (!reason.trim() || reason.trim().length < 10) {
            setError('Reason for visit is required and must be at least 10 characters long.');
            setLoading(false);
            return;
        }

        if (!currentUserId) {
            setError('User not authenticated. Please log in again.');
            setLoading(false);
            return;
        }
        // --- End Validation ---

        const appointmentData: BookAppointmentPayload = {
            patientId: patientId,
            departmentId: departmentId,
            appointmentDateTime,
            reason,
            appointmentType,
        };

        try {
            await bookAppointment(appointmentData);
            setSuccess('Physical consultation appointment created successfully!');
            // Reset form
            setPatientId(null);
            setDepartmentId(null);

            setAppointmentDateTime(new Date());
            setReason('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create physical consultation appointment.');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container maxWidth="lg">
                <Box sx={{ py: 4 }}>
                    {/* Header Section */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                            <MedicalIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                            Schedule Physical Consultation
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Create a new appointment for patient consultation
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {/* Patient Selection Card */}
                        <Grid item xs={12} md={6}>
                            <Card elevation={3} sx={{ height: '100%' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                                            <PersonIcon />
                                        </Avatar>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            Patient Information
                                        </Typography>
                                    </Box>
                                    <FormControl fullWidth required>
                                        <InputLabel id="patient-select-label">Select Patient</InputLabel>
                                        <Select
                                            labelId="patient-select-label"
                                            value={patientId === null ? '' : String(patientId)}
                                            label="Select Patient"
                                            onChange={(e) => {
                                                const value = e.target.value as string;
                                                if (value === '') {
                                                    setPatientId(null);
                                                } else {
                                                    const parsedValue = parseInt(value, 10);
                                                    setPatientId(isNaN(parsedValue) ? null : parsedValue);
                                                }
                                            }}
                                            sx={{ mb: 2 }}
                                        >
                                            {patients.map((p) => (
                                                <MenuItem key={p.userId} value={p.patientId === null ? '' : String(p.patientId)}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Avatar sx={{ width: 24, height: 24, mr: 2, bgcolor: 'secondary.main' }}>
                                                            {p.firstName.charAt(0)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {`${p.firstName} ${p.middleName ? p.middleName + ' ' : ''}${p.lastName}`}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {p.roles.join(', ')}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    {patientId && (
                                        <Chip
                                            label={`Patient ID: ${patientId}`}
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Department Selection Card */}
                        <Grid item xs={12} md={6}>
                            <Card elevation={3} sx={{ height: '100%' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                                            <MedicalIcon />
                                        </Avatar>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            Department & Doctor
                                        </Typography>
                                    </Box>
                                    <FormControl fullWidth required sx={{ mb: 3 }}>
                                        <InputLabel id="department-select-label">Select Department</InputLabel>
                                        <Select
                                            labelId="department-select-label"
                                            value={departmentId === null ? '' : String(departmentId)}
                                            label="Select Department"
                                            onChange={(e) => {
                                                const value = e.target.value as string;
                                                if (value === '') {
                                                    setDepartmentId(null);
                                                } else {
                                                    const parsedValue = parseInt(value, 10);
                                                    setDepartmentId(isNaN(parsedValue) ? null : parsedValue);
                                                }
                                            }}
                                        >
                                            {departments.map((d) => (
                                                <MenuItem key={d.departmentId} value={String(d.departmentId)}>
                                                    {d.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Appointment Details Card */}
                        <Grid item xs={12}>
                            <Card elevation={3}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                                            <EventIcon />
                                        </Avatar>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            Appointment Details
                                        </Typography>
                                    </Box>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Appointment Type"
                                                value="Doctor Consultation (Physical)"
                                                fullWidth
                                                InputProps={{
                                                    readOnly: true,
                                                }}
                                                sx={{ mb: 2 }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <DateTimePicker
                                                label="Appointment Date & Time"
                                                value={appointmentDateTime}
                                                onChange={(value) => setAppointmentDateTime(value ? new Date(value.toString()) : null)}
                                                slotProps={{
                                                    textField: { fullWidth: true, required: true }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Reason for Visit"
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                fullWidth
                                                multiline
                                                rows={4}
                                                required
                                                placeholder="Please provide a detailed description of the reason for this consultation..."
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        '& fieldset': {
                                                            borderColor: 'primary.main',
                                                        },
                                                    },
                                                }}
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                Minimum 10 characters required
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Action Section */}
                        <Grid item xs={12}>
                            <Card elevation={2} sx={{ bgcolor: 'grey.50' }}>
                                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                    <form onSubmit={handleSubmit}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            disabled={loading}
                                            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                                            sx={{
                                                px: 6,
                                                py: 1.5,
                                                fontSize: '1.1rem',
                                                fontWeight: 600,
                                                borderRadius: 2,
                                                boxShadow: 3,
                                                '&:hover': {
                                                    boxShadow: 6,
                                                },
                                            }}
                                        >
                                            {loading ? 'Scheduling...' : 'Schedule Consultation'}
                                        </Button>
                                    </form>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                        Click to create the appointment and notify the patient
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Alerts */}
                        {error && (
                            <Grid item xs={12}>
                                <Alert
                                    severity="error"
                                    icon={<ErrorIcon />}
                                    onClose={() => setError(null)}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {error}
                                </Alert>
                            </Grid>
                        )}
                        {success && (
                            <Grid item xs={12}>
                                <Alert
                                    severity="success"
                                    icon={<SuccessIcon />}
                                    onClose={() => setSuccess(null)}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {success}
                                </Alert>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </Container>
        </LocalizationProvider>
    );
};

export default RecordStaffPhysicalConsultationForm;

