'use client';
import {
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Alert,
  Box,
  Button,
  Input,
  TextField,
  Autocomplete,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, ChangeEvent } from 'react';
import withAuth from '@/components/auth/withAuth'; // Added this import
import { MedicalRecord, Diagnosis, Prescription, Document } from '@/types/emr';
import { searchMedicalRecords, uploadDocument, getDocumentUrl } from '@/services/emrService';
import { searchPatients } from '@/services/userAdminService'; // New import

interface PatientSearchResult {
  patientId: number;
  firstName: string;
  lastName: string;
}

function EMRPage() {
  const { user } = useAuth();
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  // Admin-specific state
  const [isAdmin, setIsAdmin] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [searchedPatients, setSearchedPatients] = useState<PatientSearchResult[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);


    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async (recordId: string) => {
        if (!selectedFile) {
            alert('Please select a file to upload.');
            return;
        }
        const patientIdForRefresh = isAdmin ? selectedPatient?.patientId : user?.patientId;
        if (!patientIdForRefresh) return;

        setUploading(prev => ({ ...prev, [recordId]: true }));
        try {
            await uploadDocument(Number(recordId), selectedFile);
            alert('File uploaded successfully!');
            setSelectedFile(null);
          const data = await searchMedicalRecords(patientIdForRefresh);
            setMedicalRecords(data);
        } catch (err) {
            alert('Failed to upload file.');
            console.error(err);
        } finally {
            setUploading(prev => ({ ...prev, [recordId]: false }));
        }
    };

    const handleDownload = async (documentId: string) => {
        try {
            const { url, fileName } = await getDocumentUrl(Number(documentId));
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

    useEffect(() => {
    if (user) {
      const adminRole = user.roles.includes('Admin');
      setIsAdmin(adminRole);

      if (!adminRole && user.patientId) {
        setLoading(true);
        searchMedicalRecords(user.patientId)
          .then(data => setMedicalRecords(data))
          .catch(err => {
            setError('Failed to fetch medical records.');
            console.error(err);
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (selectedPatient) {
      setLoading(true);
      searchMedicalRecords(selectedPatient.patientId)
        .then(data => setMedicalRecords(data))
        .catch(err => {
          setError(`Failed to fetch records for ${selectedPatient.firstName} ${selectedPatient.lastName}.`);
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedPatient]);

  const handlePatientSearch = async () => {
    if (patientSearchTerm.trim()) {
      try {
        const results = await searchPatients(patientSearchTerm);
        setSearchedPatients(results);
      } catch (err) {
        setError('Failed to search for patients.');
      }
    }
  };


  return (
    <div>
      <Typography variant="h4" gutterBottom>
        {isAdmin ? 'EMR - Search and View Records' : 'My Medical Records'}
      </Typography>

      {isAdmin && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
          <Autocomplete
            options={searchedPatients}
            getOptionLabel={(option) => `${option.firstName} ${option.lastName} (ID: ${option.patientId})`}
            isOptionEqualToValue={(option, value) => option.patientId === value.patientId}
            onChange={(event, newValue) => setSelectedPatient(newValue)}
            onInputChange={(event, newInputValue) => {
              setPatientSearchTerm(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search for a patient by name or ID"
                variant="outlined"
                sx={{ width: 400 }}
              />
            )}
          />
          <Button variant="contained" onClick={handlePatientSearch}>
            Search Patients
          </Button>
        </Box>
      )}

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      
      {!loading && medicalRecords.length === 0 && (
        <Typography sx={{ mt: 2 }}>
          {isAdmin ? (selectedPatient ? 'No medical records found for this patient.' : 'Search for a patient to view their records.') : 'You have no medical records.'}
        </Typography>
      )}

      {!loading && medicalRecords.length > 0 && (
        <List>
          {medicalRecords.map((record) => (
                        <Box
                          key={record.recordId}
                          sx={{ mb: 2, border: '1px solid #ccc', borderRadius: '4px', p: 2 }}        
                        >
                          <ListItem>
                            <ListItemText
                              primary={
                                                                  <Typography variant="h6">{`Record from ${new Date(record.visitDate).toLocaleDateString()}`}</Typography>                              }
                            />
                          </ListItem>
                          {record.diagnoses && record.diagnoses.length > 0 && (
                            <Box sx={{ ml: 2, mt: 1 }}>
                              <Typography variant="subtitle1">Diagnoses:</Typography>
                              <List dense>
                                {record.diagnoses.map((diagnosis: Diagnosis) => (
                                                                      <ListItem key={diagnosis.diagnosisId}>                                    <ListItemText
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
                                                                      <ListItem key={prescription.prescriptionId}>                                    <ListItemText
                                                                             primary={`${prescription.medicationName} (${prescription.dosage}, ${prescription.frequency})`}                                                                             secondary={`From: ${new Date(prescription.createdAt).toLocaleDateString()} to ${prescription.endDate ? new Date(prescription.endDate).toLocaleDateString() : 'N/A'}`}                                    />
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
                                  disabled={!selectedFile || uploading[record.recordId]}
                              >
                                  {uploading[record.recordId] ? <CircularProgress size={24} /> : 'Upload'}
                              </Button>
                          </Box>
                        </Box>
                      ))}
                    </List>
                  )}
                </div>
              );
            }
export default withAuth(EMRPage, ['Patient', 'Officer', 'Family Member', 'Doctor', 'Nurse', 'RecordStaff', 'Admin']);
