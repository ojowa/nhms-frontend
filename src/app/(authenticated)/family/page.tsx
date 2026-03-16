'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { FamilyMember, AddFamilyMemberPayload } from '@/types/family';
import { addFamilyMember, getFamilyMembersByOfficerId, updateFamilyMember, deleteFamilyMember, resetFamilyMemberPassword } from '@/services/familyService';
import FamilyMemberList from '@/components/family/FamilyMemberList';
import FamilyMemberForm from '@/components/family/FamilyMemberForm';
import ResetPasswordForm from '@/components/forms/ResetPasswordForm';
import withAuth from '@/components/auth/withAuth'; // Added this import

function FamilyMembersPage() {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFamilyMember, setEditingFamilyMember] = useState<FamilyMember | null>(null);
  const [isResetPasswordFormOpen, setIsResetPasswordFormOpen] = useState(false);
  const [selectedFamilyMemberForPasswordReset, setSelectedFamilyMemberForPasswordReset] = useState<number | null>(null);

  const fetchFamilyMembers = useCallback(async () => {
    if (!user?.userId) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getFamilyMembersByOfficerId();
      setFamilyMembers(data);
    } catch (err) {
      console.error('Error fetching family members:', err);
      setError('Failed to load family members.');
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    fetchFamilyMembers();
  }, [fetchFamilyMembers]);

    const handleAddFamilyMember = async (familyMemberData: AddFamilyMemberPayload) => {

      if (!user?.userId) {

        setError('User not authenticated.');

        return;

      }

      setSubmitting(true);

      setError(null);

  

      // Optimistic update

      const newFamilyMember: FamilyMember = { 

          ...familyMemberData, 

          familyId: 0, // Temporary ID for optimistic update

          officerUserId: user.userId, // Include officerUserId

          userId: undefined, // Temporary userId (now number | undefined)

          patientId: undefined, // Temporary patientId

      };

      setFamilyMembers(prev => [...prev, newFamilyMember]);

      setIsFormOpen(false);

  

      try {

        const addedMember = await addFamilyMember(user.userId, familyMemberData);

        // Replace temporary member with actual member from API

        setFamilyMembers(prev => prev.map(member => member.familyId === newFamilyMember.familyId ? addedMember : member));

      } catch (err) {

        console.error('Error adding family member:', err);

        setError('Failed to add family member. Please try again.');

        // Revert optimistic update

        setFamilyMembers(prev => prev.filter(member => member.familyId !== newFamilyMember.familyId));

      } finally {

        setSubmitting(false);

      }

    };

  

    const handleUpdateFamilyMember = async (familyMemberData: Partial<FamilyMember>) => {

      if (!editingFamilyMember) return;

  

      setSubmitting(true);

      setError(null);

  

      const originalFamilyMembers = [...familyMembers];

      const updatedFamilyMembers = familyMembers.map(member =>

        member.familyId === editingFamilyMember.familyId ? { ...editingFamilyMember, ...familyMemberData } : member

      );

      setFamilyMembers(updatedFamilyMembers);

      setIsFormOpen(false);

      setEditingFamilyMember(null);

  

      try {

        await updateFamilyMember(editingFamilyMember.familyId, familyMemberData);

      } catch (err) {

        console.error('Error updating family member:', err);

        setError('Failed to update family member. Please try again.');

        // Revert optimistic update

        setFamilyMembers(originalFamilyMembers);

      } finally {

        setSubmitting(false);

      }

    };

  

    const handleDeleteFamilyMember = async (familyId: number) => {

      setSubmitting(true);

      setError(null);

  

      const originalFamilyMembers = [...familyMembers];

      const updatedFamilyMembers = familyMembers.filter(member => member.familyId !== familyId);

      setFamilyMembers(updatedFamilyMembers);

  

      try {

        await deleteFamilyMember(familyId);

      } catch (err) {

        console.error('Error deleting family member:', err);

        setError('Failed to delete family member. Please try again.');

        // Revert optimistic update

        setFamilyMembers(originalFamilyMembers);

      } finally {

        setSubmitting(false);

      }

    };

  

    const handleFormSubmit = async (data: AddFamilyMemberPayload | Partial<FamilyMember>) => {

      if (editingFamilyMember) {

        await handleUpdateFamilyMember(data as Partial<FamilyMember>);

      } else {

        await handleAddFamilyMember(data as AddFamilyMemberPayload);

      }

    };

  const handleEditClick = (familyMember: FamilyMember) => {
    setEditingFamilyMember(familyMember);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingFamilyMember(null);
  };

  const handleOpenResetPasswordForm = (familyId: number) => {
    setSelectedFamilyMemberForPasswordReset(familyId);
    setIsResetPasswordFormOpen(true);
  };

  const handleCloseResetPasswordForm = () => {
    setIsResetPasswordFormOpen(false);
    setSelectedFamilyMemberForPasswordReset(null);
  };

  const handleResetPasswordSubmit = async (newPassword: string) => {
    if (!selectedFamilyMemberForPasswordReset || !user?.userId) return;

    setSubmitting(true);
    setError(null);

    try {
      await resetFamilyMemberPassword(user.userId, selectedFamilyMemberForPasswordReset, newPassword);
      alert('Password reset successfully!');
      handleCloseResetPasswordForm();
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Manage Family Members
      </Typography>

      <Button variant="contained" onClick={() => setIsFormOpen(true)} sx={{ mb: 2 }} disabled={submitting}>
        Add Family Member
      </Button>

      {isFormOpen && (
        <FamilyMemberForm
          initialData={editingFamilyMember}
          onSubmit={handleFormSubmit}
          onClose={handleCloseForm}
        />
      )}

      {selectedFamilyMemberForPasswordReset && isResetPasswordFormOpen && (
        <ResetPasswordForm
          onReset={handleResetPasswordSubmit}
          onClose={handleCloseResetPasswordForm}
        />
      )}

      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      {!loading && !error && familyMembers.length === 0 && (
        <Typography sx={{ mt: 2 }}>No family members found. Add one above!</Typography>
      )}

      {!loading && !error && familyMembers.length > 0 && (
        <FamilyMemberList
          familyMembers={familyMembers}
          onEdit={handleEditClick}
          onDelete={handleDeleteFamilyMember}
          onResetPassword={handleOpenResetPasswordForm}
          disabled={submitting}
        />
      )}
    </Box>
  );
}

export default withAuth(FamilyMembersPage, ['Officer']);