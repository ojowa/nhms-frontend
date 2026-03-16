'use client';

import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import withAuth from '@/components/auth/withAuth';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getLabResultsByPatientId } from '@/services/labService';
import { LabResult } from '@/types/labResult';
import { Document, MedicalRecord } from '@/types/emr';
import {
  PatientVitalsTrendPoint,
  searchMedicalRecords,
  getMedicalRecordById,
  getDiagnosesByMedicalRecordId,
  getPrescriptionsByMedicalRecordId,
  getDocumentsForRecord,
  getDocumentUrl,
  getPatientVitalsHistory,
} from '@/services/emrService';
import VitalsTrendChart from '@/components/emr/VitalsTrendChart';

function DoctorEMRPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [vitalsHistory, setVitalsHistory] = useState<PatientVitalsTrendPoint[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchContext = async () => {
      if (!patientId || !user || !user.userId) {
        setError('Patient ID not found or user not authenticated.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [recordsData, labData, trendData] = await Promise.all([
          searchMedicalRecords(Number(patientId), user.userId, undefined, undefined, undefined, 100, 0),
          getLabResultsByPatientId(Number(patientId), user.userId),
          getPatientVitalsHistory(Number(patientId), { limit: 50 }),
        ]);

        const normalizedRecords = Array.isArray(recordsData) ? recordsData : [];
        setMedicalRecords(normalizedRecords);
        setLabResults(Array.isArray(labData) ? labData : []);
        setVitalsHistory(Array.isArray(trendData) ? trendData : []);

        if (normalizedRecords.length > 0) {
          const latest = [...normalizedRecords].sort(
            (a, b) => new Date(b.visitDate || b.createdAt).getTime() - new Date(a.visitDate || a.createdAt).getTime()
          )[0];
          setSelectedRecordId(Number(latest.recordId));
        } else {
          setSelectedRecordId(null);
          setSelectedRecord(null);
        }
      } catch (err: any) {
        console.error('Error fetching lab results for EMR:', err);
        setError(err.response?.data?.message || 'Failed to fetch patient EMR.');
      } finally {
        setLoading(false);
      }
    };

    fetchContext();
  }, [patientId, user]);

  useEffect(() => {
    const fetchSelectedRecordDetails = async () => {
      if (!selectedRecordId) {
        setSelectedRecord(null);
        return;
      }

      try {
        const [recordData, diagnosesData, prescriptionsData, documentsData] = await Promise.all([
          getMedicalRecordById(selectedRecordId),
          getDiagnosesByMedicalRecordId(String(selectedRecordId)),
          getPrescriptionsByMedicalRecordId(String(selectedRecordId)),
          getDocumentsForRecord(selectedRecordId),
        ]);

        const mergedRecord: MedicalRecord = {
          ...(recordData || {}),
          diagnoses: Array.isArray(diagnosesData) ? diagnosesData : [],
          prescriptions: Array.isArray(prescriptionsData) ? prescriptionsData : [],
          documents: Array.isArray(documentsData) ? documentsData : [],
        } as MedicalRecord;

        setSelectedRecord(mergedRecord);
      } catch {
        const fallback = medicalRecords.find((r) => Number(r.recordId) === selectedRecordId) || null;
        setSelectedRecord(fallback);
      }
    };

    fetchSelectedRecordDetails();
  }, [selectedRecordId, medicalRecords]);

  const sortedRecords = useMemo(
    () =>
      [...medicalRecords].sort(
        (a, b) => new Date(b.visitDate || b.createdAt).getTime() - new Date(a.visitDate || a.createdAt).getTime()
      ),
    [medicalRecords]
  );

  const handleDocumentDownload = async (doc: Document) => {
    try {
      const result = await getDocumentUrl(Number((doc as any).id || (doc as any).documentId));
      const link = document.createElement('a');
      link.href = result.url;
      link.setAttribute('download', result.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError('Failed to download document.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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
        Doctor EMR Workspace - Patient {patientId}
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Paper sx={{ width: { xs: '100%', md: 320 }, p: 1.5 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Medical Record Visits
          </Typography>
          {sortedRecords.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No medical records found.
            </Typography>
          ) : (
            <List dense>
              {sortedRecords.map((record) => {
                const recordId = Number(record.recordId);
                const selected = selectedRecordId === recordId;
                return (
                  <ListItem key={recordId} disablePadding>
                    <ListItemButton selected={selected} onClick={() => setSelectedRecordId(recordId)}>
                      <ListItemText
                        primary={`Record #${record.recordId}`}
                        secondary={new Date(record.visitDate || record.createdAt).toLocaleString()}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Paper>

        <Paper sx={{ flex: 1, p: 2 }}>
          <Tabs value={activeTab} onChange={(_e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
            <Tab label="Overview Notes" />
            <Tab label="Diagnoses" />
            <Tab label="Prescriptions" />
            <Tab label="Vitals Trend" />
            <Tab label="Documents" />
            <Tab label="Lab Results" />
          </Tabs>

          {activeTab === 0 && (
            <Stack spacing={1.5}>
              <Typography variant="h6">Clinical Notes</Typography>
              <Typography variant="body2"><strong>Chief Complaint:</strong> {selectedRecord?.chiefComplaint || 'N/A'}</Typography>
              <Typography variant="body2"><strong>Assessment:</strong> {selectedRecord?.assessment || 'N/A'}</Typography>
              <Typography variant="body2"><strong>Plan:</strong> {selectedRecord?.plan || 'N/A'}</Typography>
              <Typography variant="body2"><strong>Notes:</strong> {selectedRecord?.notes || 'N/A'}</Typography>
            </Stack>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Diagnoses</Typography>
              {(selectedRecord?.diagnoses || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">No diagnoses found for this record.</Typography>
              ) : (
                <List>
                  {(selectedRecord?.diagnoses || []).map((diagnosis: any, index: number) => (
                    <React.Fragment key={`${diagnosis?.diagnosisId || diagnosis?.id || index}`}>
                      <ListItem>
                        <ListItemText
                          primary={`${diagnosis?.code || diagnosis?.diagnosisCode || 'N/A'}: ${diagnosis?.description || 'N/A'}`}
                          secondary={`Date: ${new Date(diagnosis?.diagnosisDate || diagnosis?.createdAt || Date.now()).toLocaleString()}`}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Prescriptions</Typography>
              {(selectedRecord?.prescriptions || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">No prescriptions found for this record.</Typography>
              ) : (
                <List>
                  {(selectedRecord?.prescriptions || []).map((prescription: any, index: number) => (
                    <React.Fragment key={`${prescription?.prescriptionId || prescription?.id || index}`}>
                      <ListItem>
                        <ListItemText
                          primary={`${prescription?.medicationName || prescription?.medication || 'N/A'} (${prescription?.dosage || 'N/A'}, ${prescription?.frequency || 'N/A'})`}
                          secondary={`Start: ${prescription?.startDate ? new Date(prescription.startDate).toLocaleDateString() : 'N/A'} | End: ${prescription?.endDate ? new Date(prescription.endDate).toLocaleDateString() : 'N/A'}`}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Vitals Trend</Typography>
              {vitalsHistory.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No vitals trend data available.</Typography>
              ) : (
                <VitalsTrendChart data={vitalsHistory} />
              )}
            </Box>
          )}

          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>Documents</Typography>
              {(selectedRecord?.documents || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">No documents for this record.</Typography>
              ) : (
                <List>
                  {(selectedRecord?.documents || []).map((doc: any, index: number) => (
                    <ListItem key={`${doc?.id || index}`} disablePadding>
                      <ListItemButton onClick={() => handleDocumentDownload(doc)}>
                        <ListItemText
                          primary={doc?.fileName || 'Document'}
                          secondary={`Uploaded: ${doc?.uploadDate ? new Date(doc.uploadDate).toLocaleString() : 'N/A'}`}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}

          {activeTab === 5 && (
            <Box>
              <Typography variant="h6" gutterBottom>Lab Results</Typography>
              {labResults.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No lab results found for this patient.</Typography>
              ) : (
                <List>
                  {labResults.map((result: any) => (
                    <React.Fragment key={result.labResultId}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={`${result.testName} - ${result.resultValue || 'N/A'} ${result.unit || ''}`}
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="body2">Reference: {result.referenceRange || 'N/A'}</Typography>
                              <Typography variant="body2">Notes: {result.notes || 'N/A'}</Typography>
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                Status:
                                <Chip
                                  label={result.status}
                                  size="small"
                                  color={
                                    result.status === 'FINAL' || result.status === 'APPROVED'
                                      ? 'success'
                                      : result.status === 'PRELIMINARY' || result.status === 'PENDING_APPROVAL'
                                        ? 'warning'
                                        : 'default'
                                  }
                                />
                              </Typography>
                              <Typography variant="body2">
                                Date: {result.createdAt ? new Date(result.createdAt).toLocaleString() : 'N/A'}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}
        </Paper>
      </Stack>
    </Box>
  );
}

export default withAuth(DoctorEMRPage, ['Doctor']);
