'use client';
import { Typography, TextField, Button, Box, CircularProgress, Alert } from '@mui/material';
import withAuth from '@/components/auth/withAuth';
import { useEffect, useState } from 'react';
import { UserProfile } from '@/types/userProfile';
import { getUserProfile, updateUserProfile } from '@/services/userProfileService';
import { useAuth } from '@/contexts/AuthContext';

import EmergencyContacts from '@/components/ui/EmergencyContacts';

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState(''); // Added middleName state
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressZipCode, setAddressZipCode] = useState('');
  const [preferredCommunicationMethod, setPreferredCommunicationMethod] = useState('');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState('');
  const [patientId, setPatientId] = useState<number | undefined>(undefined); // Changed from medicalId

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.userId) {
        try {
          const data = await getUserProfile(user.userId);
          setProfile(data);
          setPatientId(data.patientId); // Changed from medicalId
          setFirstName(data.firstName || '');
          setMiddleName(data.middleName || ''); // Set middleName from data
          setLastName(data.lastName || '');
          setEmail(data.email);
          setPhone(data.phone || '');
          setDateOfBirth(data.dateOfBirth ? new Date(data.dateOfBirth) : undefined);
          setAddressStreet(data.addressStreet || '');
          setAddressCity(data.addressCity || '');
          setAddressState(data.addressState || '');
          setAddressZipCode(data.addressZipCode || '');
          setPreferredCommunicationMethod(data.preferredCommunicationMethod || '');
          setAccessibilityNeeds(data.accessibilityNeeds || '');
        } catch (err) {
          setError('Failed to fetch profile data.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (user?.userId) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        await updateUserProfile(user.userId, {
          firstName: firstName,
          middleName: middleName, // Added middleName to payload
          lastName: lastName,
          phone,
          dateOfBirth: dateOfBirth,
          addressStreet: addressStreet,
          addressCity: addressCity,
          addressState: addressState,
          addressZipCode: addressZipCode,
          preferredCommunicationMethod: preferredCommunicationMethod,
          accessibilityNeeds: accessibilityNeeds,
        });
        setSuccess('Profile updated successfully!');
      } catch (err) {
        setError('Failed to update profile.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          fullWidth
          id="patientId"
          label="Patient ID"
          name="patientId"
          value={patientId || ''}
          disabled
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled // Email is typically not editable after registration
        />
        <TextField
          margin="normal"
          fullWidth
          id="firstName"
          label="First Name"
          name="firstName"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <TextField
          margin="normal"
          fullWidth
          id="middleName"
          label="Middle Name"
          name="middleName"
          autoComplete="additional-name"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
        />
        <TextField
          margin="normal"
          fullWidth
          id="lastName"
          label="Last Name"
          name="lastName"
          autoComplete="family-name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <TextField
          margin="normal"
          fullWidth
          id="phone"
          label="Phone Number"
          name="phone"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <TextField
          margin="normal"
          fullWidth
          id="dateOfBirth"
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          value={dateOfBirth ? new Date(dateOfBirth).toISOString().split('T')[0] : ''}
          onChange={(e) => setDateOfBirth(new Date(e.target.value))}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          margin="normal"
          fullWidth
          id="addressStreet"
          label="Street Address"
          name="addressStreet"
          autoComplete="street-address"
          value={addressStreet}
          onChange={(e) => setAddressStreet(e.target.value)}
        />
        <TextField
          margin="normal"
          fullWidth
          id="addressCity"
          label="City"
          name="addressCity"
          autoComplete="address-level2"
          value={addressCity}
          onChange={(e) => setAddressCity(e.target.value)}
        />
        <TextField
          margin="normal"
          fullWidth
          id="addressState"
          label="State"
          name="addressState"
          autoComplete="address-level1"
          value={addressState}
          onChange={(e) => setAddressState(e.target.value)}
        />
        <TextField
          margin="normal"
          fullWidth
          id="addressZipCode"
          label="Zip Code"
          name="addressZipCode"
          autoComplete="postal-code"
          value={addressZipCode}
          onChange={(e) => setAddressZipCode(e.target.value)}
        />
        <TextField
          margin="normal"
          fullWidth
          id="preferredCommunicationMethod"
          label="Preferred Communication Method"
          name="preferredCommunicationMethod"
          value={preferredCommunicationMethod}
          onChange={(e) => setPreferredCommunicationMethod(e.target.value)}
        />
        <TextField
          margin="normal"
          fullWidth
          id="accessibilityNeeds"
          label="Accessibility Needs"
          name="accessibilityNeeds"
          multiline
          rows={4}
          value={accessibilityNeeds}
          onChange={(e) => setAccessibilityNeeds(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </Box>
      <Box sx={{ mt: 4 }}>
        <EmergencyContacts />
      </Box>
    </div>
  );
}

export default withAuth(ProfilePage);
