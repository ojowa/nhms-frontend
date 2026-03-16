// nhms-frontend/src/components/lab/PatientLabResultsList.tsx
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
    Chip,
    Button
} from '@mui/material';
import { LabResult } from '@/types/labResult'; // Assuming LabResult type is available
import { getLabResultsByPatientIdWithAuth } from '@/services/labResultService'; // Client-side service
import { useAuth } from '@/contexts/AuthContext';
import { DocumentScannerOutlined } from '@mui/icons-material';

interface PatientLabResultsListProps {
    patientId: number;
}

const PatientLabResultsList: React.FC<PatientLabResultsListProps> = ({ patientId }) => {
    const { user } = useAuth();
    const [labResults, setLabResults] = useState<LabResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLabResults = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // Assuming getLabResultsByPatientIdWithAuth handles pagination internally or we pass defaults
                const results = await getLabResultsByPatientIdWithAuth(patientId, user, 1, 100); // Fetching first 100 results for now
                if (results) {
                    setLabResults(results.data);
                } else {
                    setLabResults([]);
                }
            } catch (err: any) {
                console.error("Failed to fetch lab results:", err);
                setError(err.message || 'Failed to fetch lab results.');
            } finally {
                setLoading(false);
            }
        };

        fetchLabResults();
    }, [patientId, user]);

    if (loading) {
        return <CircularProgress size={20} />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (labResults.length === 0) {
        return <Typography variant="body2">No lab results found for this patient.</Typography>;
    }

    return (
        <TableContainer component={Paper}>
            <Table size="small" aria-label="lab results table">
                <TableHead>
                    <TableRow>
                        <TableCell>Test Name</TableCell>
                        <TableCell>Result</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Notes</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {labResults.map((result) => (
                        <TableRow key={result.labResultId}>
                            <TableCell>{result.testName}</TableCell>
                            <TableCell>{result.resultValue} {result.unit}</TableCell>
                            <TableCell>
                                <Chip
                                    label={result.status}
                                    color={
                                        result.status === 'APPROVED' || result.status === 'FINAL' ? 'success' :
                                        result.status === 'REJECTED' ? 'error' :
                                        'info'
                                    }
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>{new Date(result.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{result.notes}</TableCell>
                            <TableCell align="center">
                                {result.fileAttachmentUrl && (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<DocumentScannerOutlined />}
                                        href={result.fileAttachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View File
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PatientLabResultsList;
