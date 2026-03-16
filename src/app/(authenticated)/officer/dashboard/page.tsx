// nhms-frontend/src/app/(authenticated)/patient/dashboard/page.tsx
'use client';

import { Typography, Box, CircularProgress, Alert, Paper, Button } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import withAuth from '@/components/auth/withAuth';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getLabResultsByPatientIdWithAuth } from '@/services/labResultService';
import { getPatientMedicalRecordsSummary } from '@/services/emrService'; // Assuming this service exists
import { getFamilyMembersByOfficerId } from '@/services/familyService'; // Assuming this service exists
import { getUnreadNotifications } from '@/services/notificationService'; // Assuming this service exists
import { LabResult } from '@/types/labResult';
import { FamilyMember } from '@/types/family';
import { Notification } from '@/types/notification';

import { useRouter } from 'next/navigation';

function OfficerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [recentLabResults, setRecentLabResults] = useState<LabResult[]>([]);
  const [medicalRecordsSummary, setMedicalRecordsSummary] = useState<any>(null); // Replace 'any' with actual type
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!user || !user.patientId) { // Ensure user and patientId exist
        setError("User not authenticated or patient ID not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch recent lab results
        console.log("Fetching lab results for patientId:", user.patientId); // Add this line
        const labResults = await getLabResultsByPatientIdWithAuth(user.patientId, user);
        if (labResults && labResults.data) {
            setRecentLabResults(labResults.data.slice(0, 3)); // Show only a few recent ones
        }

        // Fetch EMR summary
        const emrSummary = await getPatientMedicalRecordsSummary(user.patientId);
        setMedicalRecordsSummary(emrSummary);

        // Fetch family members (no patientId needed, backend handles logged-in user)
        const family = await getFamilyMembersByOfficerId();
        setFamilyMembers(family);

        // Fetch notifications (no patientId needed, backend handles logged-in user)
        const userNotifications = await getUnreadNotifications();
        setNotifications(userNotifications.slice(0, 5)); // Show 5 recent notifications

      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Officer Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Recent Lab Results */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Recent Lab Results</Typography>
            {recentLabResults.length === 0 ? (
              <Typography>No recent lab results.</Typography>
            ) : (
              <ul>
                {recentLabResults.map((result) => (
                  <li key={result.labResultId}>
                    {result.testName} - {result.createdAt ? new Date(result.createdAt).toLocaleDateString() : 'Unknown date'}
                  </li>
                ))}
              </ul>
            )}
          </Paper>
        </Grid>

        {/* EMR Summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Medical Records Summary</Typography>
            {medicalRecordsSummary ? (
              <Box>
                <Typography>Last Diagnosis: {medicalRecordsSummary.lastDiagnosis}</Typography>
                <Typography>Active Prescriptions: {medicalRecordsSummary.activePrescriptionsCount}</Typography>
                {/* Add more EMR summary details */}
              </Box>
            ) : (
              <Typography>No medical record summary available.</Typography>
            )}
          </Paper>
        </Grid>

        {/* Family Members */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Family Members</Typography>
            {familyMembers.length === 0 ? (
              <Typography>No family members linked.</Typography>
            ) : (
              <ul>
                {familyMembers.map((member) => (
                                     <li key={member.familyId}>{member.firstName} {member.lastName} ({member.relationship})</li>                ))}
              </ul>
            )}
          </Paper>
        </Grid>

        {/* Recent Notifications */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Recent Notifications</Typography>
            {notifications.length === 0 ? (
              <Typography>No new notifications.</Typography>
            ) : (
              <ul>
                {notifications.map((notif) => (
                  <li key={notif.notificationId} style={{ fontWeight: notif.isRead ? 'normal' : 'bold' }}>
                    {notif.message} - {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'N/A'}
                  </li>
                ))}
              </ul>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default withAuth(OfficerDashboardPage, ['Officer']);
