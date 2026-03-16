// nhms-frontend/src/app/(authenticated)/doctor/lab-request/[lab_request_id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    Chip,
    Button,
    Divider,
    Card,
    CardHeader,
    CardContent,
    TextField
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import * as labRequestService from '@/services/labRequestService';
import { LabRequest } from '@/types/labRequest';
import { Edit, Cancel } from '@mui/icons-material';

const LabRequestDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const labRequestId = Array.isArray(params.lab_request_id) ? params.lab_request_id[0] : params.lab_request_id;
    const parsedLabRequestId = labRequestId ? parseInt(labRequestId, 10) : undefined;

    const { user } = useAuth();
    const [labRequest, setLabRequest] = useState<LabRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editReason, setEditReason] = useState('');

    useEffect(() => {
        const fetchLabRequest = async () => {
            if (!parsedLabRequestId) return;
            setLoading(true);
            try {
                const request = await labRequestService.getLabRequestById(parsedLabRequestId);
                setLabRequest(request);
                setEditReason(request?.reason || '');
            } catch (err: any) {
                console.error("Failed to fetch lab request:", err);
                setError(err.message || 'Failed to fetch lab request details.');
            } finally {
                setLoading(false);
            }
        };

        fetchLabRequest();
    }, [parsedLabRequestId]);

    const handleCancelRequest = async () => {
        if (!labRequest) return;
        setLoading(true);
        try {
            await labRequestService.updateLabRequestStatus(labRequest.lab_request_id, 'CANCELLED');
            router.push('/doctor/pending-lab-requests');
        } catch (err: any) {
            setError(err.message || 'Failed to cancel lab request.');
            setLoading(false);
        }
    };

    const handleUpdateRequest = async () => {
        if (!labRequest) return;
        setLoading(true);
        try {
            await labRequestService.updateLabRequestReason(labRequest.lab_request_id, editReason);
            setIsEditing(false);
            // Refetch data
            const request = await labRequestService.getLabRequestById(labRequest.lab_request_id);
            setLabRequest(request);
        } catch (err: any) {
            setError(err.message || 'Failed to update lab request.');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!labRequest) {
        return <Alert severity="warning">Lab request not found.</Alert>;
    }

    const canBeModified = labRequest.status === 'PENDING';

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Lab Request Details
            </Typography>
            <Card>
                <CardHeader
                    title={`Request ID: ${labRequest.lab_request_id}`}
                    action={
                        <Chip label={labRequest.status} color={labRequest.status === 'PENDING' ? 'warning' : 'default'} />
                    }
                />
                <Divider />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6">Patient Information</Typography>
                            <Typography><strong>Name:</strong> {labRequest.patientFirstName} {labRequest.patientLastName}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6">Request Information</Typography>
                            <Typography><strong>Test Type:</strong> {labRequest.test_type}</Typography>
                            <Typography><strong>Requested By:</strong> Dr. {labRequest.doctorFirstName} {labRequest.doctorLastName}</Typography>
                            <Typography><strong>Requested Date:</strong> {new Date(labRequest.request_date).toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6">Reason for Request</Typography>
                            {isEditing ? (
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={editReason}
                                    onChange={(e) => setEditReason(e.target.value)}
                                />
                            ) : (
                                <Typography>{labRequest.reason || 'No reason provided.'}</Typography>
                            )}
                        </Grid>
                    </Grid>
                </CardContent>
                <Divider />
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    {isEditing ? (
                        <>
                            <Button onClick={() => setIsEditing(false)} sx={{ mr: 1 }}>Cancel</Button>
                            <Button variant="contained" onClick={handleUpdateRequest}>Save Changes</Button>
                        </>
                    ) : (
                        <>
                            {canBeModified && (
                                <>
                                    <Button onClick={() => setIsEditing(true)} startIcon={<Edit />} sx={{ mr: 1 }}>
                                        Edit Reason
                                    </Button>
                                    <Button variant="contained" color="error" onClick={handleCancelRequest} startIcon={<Cancel />}>
                                        Cancel Request
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </Box>
            </Card>
        </Box>
    );
};

export default withAuth(LabRequestDetailsPage, ['Doctor']);

