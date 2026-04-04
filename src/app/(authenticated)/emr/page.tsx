"use client";
import {
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Alert,
  Box,
  Button,
  Input,
  TextField,
  Autocomplete,
  Paper,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import withAuth from '@/components/auth/withAuth';
import { MedicalRecord, Diagnosis, Prescription, Document } from '@/types/emr';
import { useMedicalRecords, useUploadDocument, useGetDocumentUrl } from '@/hooks/useApi';
import { ContentSkeleton } from '@/components/ui/skeletons';

function EMRPage() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  // Admin-specific state (simplified for now)
  const [isAdmin] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{ patientId: number; firstName: string; lastName: string } | null>(null);

  // React Query hooks
  const patientIdForQuery = isAdmin ? selectedPatient?.patientId : user?.patientId;
  const { data: medicalRecords, isLoading, error } = useMedicalRecords(
    { patientId: patientIdForQuery!, page: 1, pageSize: 10 },
    { enabled: !!patientIdForQuery }
  );
  
  const uploadMutation = useUploadDocument();
  const getDocumentUrlMutation = useGetDocumentUrl();

  const records = medicalRecords || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (recordId: string) => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }
    if (!patientIdForQuery) return;

    setUploading(prev => ({ ...prev, [recordId]: true }));
    try {
      await uploadMutation.mutateAsync({
        recordId: Number(recordId),
        file: selectedFile,
      });
      alert('File uploaded successfully!');
      setSelectedFile(null);
    } catch (err) {
      alert('Failed to upload file.');
      console.error(err);
    } finally {
      setUploading(prev => ({ ...prev, [recordId]: false }));
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      const { url, fileName } = await getDocumentUrlMutation.mutateAsync(Number(documentId));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download file.');
      console.error(err);
    }
  };

  if (!patientIdForQuery) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Medical Records
        </Typography>
        <Alert severity="info">Please ensure you have a patient profile to view medical records.</Alert>
      </Box>
    );
  }

  if (isLoading) {
    return <ContentSkeleton title listItems={5} />;
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        {isAdmin ? 'EMR - Search and View Records' : 'My Medical Records'}
      </Typography>

      {error && <Alert severity="error">{String(error)}</Alert>}
      
      {!isLoading && records.length === 0 && (
        <Typography sx={{ mt: 2 }}>
          {selectedPatient ? 'No medical records found for this patient.' : 'You have no medical records.'}
        </Typography>
      )}

      {!isLoading && records.length > 0 && (
        <List>
          {records.map((record) => (
            <Box
              key={record.recordId}
              sx={{ mb: 2, border: '1px solid #ccc', borderRadius: '4px', p: 2 }}        
            >
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="h6">{`Record from ${new Date(record.visitDate).toLocaleDateString()}`}</Typography>
                  }
                />
              </ListItem>
              {record.diagnoses && record.diagnoses.length > 0 && (
                <Box sx={{ ml: 2, mt: 1 }}>
                  <Typography variant="subtitle1">Diagnoses:</Typography>
                  <List dense>
                    {record.diagnoses.map((diagnosis: Diagnosis) => (
                      <ListItem key={diagnosis.diagnosisId}>
                        <ListItemText
                          primary={`${diagnosis.code}: ${diagnosis.description}`}
                          secondary={`Date: ${new Date(diagnosis.createdAt).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              {record.prescriptions && record.prescriptions.length > 0 && (
                <Box sx={{ ml: 2, mt: 1 }}>
                  <Typography variant="subtitle1">Prescriptions:</Typography>
                  <List dense>
                    {record.prescriptions.map((prescription: Prescription) => (
                      <ListItem key={prescription.prescriptionId}>
                        <ListItemText
                          primary={`${prescription.medicationName} (${prescription.dosage}, ${prescription.frequency})`}
                          secondary={`From: ${new Date(prescription.createdAt).toLocaleDateString()} to ${prescription.endDate ? new Date(prescription.endDate).toLocaleDateString() : 'N/A'}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              {record.documents && record.documents.length > 0 && (
                <Box sx={{ ml: 2, mt: 1 }}>
                  <Typography variant="subtitle1">Documents:</Typography>
                  <List dense>
                    {record.documents.map((doc: Document) => (
                      <ListItem key={doc.id} disablePadding>
                        <ListItemButton onClick={() => handleDownload(String(doc.id))}>
                          <ListItemText
                            primary={doc.fileName}
                            secondary={`Uploaded on: ${new Date(doc.uploadDate).toLocaleDateString()}`}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              <Box sx={{ ml: 2, mt: 2 }}>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  sx={{ mr: 2 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleUpload(String(record.recordId))}
                  disabled={!selectedFile || uploading[record.recordId] || uploadMutation.isPending}
                >
                  {(uploading[record.recordId] || uploadMutation.isPending) ? 'Uploading...' : 'Upload'}
                </Button>
              </Box>
            </Box>
          ))}
        </List>
      )}
    </div>
  );
}

export default withAuth(EMRPage, ['Admin', 'Doctor', 'Patient']);
