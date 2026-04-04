'use client';
import { Typography, Box, Paper, List, ListItem, ListItemText, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress, Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import { EmergencyContact } from '@/types/userProfile';
import { getEmergencyContacts, addEmergencyContact, updateEmergencyContact, deleteEmergencyContact } from '@/services/userProfileService';
import { useAuth } from '@/contexts/AuthContext';

function EmergencyContacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<Partial<EmergencyContact> | null>(null);

  useEffect(() => {
    if (user?.userId) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    if (user?.userId) {
      try {
        setLoading(true);
        const data = await getEmergencyContacts(user.userId);
        setContacts(data);
      } catch (err) {
        setError('Failed to fetch emergency contacts.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClickOpen = (contact: Partial<EmergencyContact> | null = null) => {
    setCurrentContact(contact || { name: '', phone: '', relationship: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentContact(null);
  };

  const handleSave = async () => {
    if (user?.userId && currentContact) {
      try {
        if ('contactId' in currentContact) {
          await updateEmergencyContact(user.userId, currentContact.contactId as number, currentContact);
        } else {
          await addEmergencyContact(user.userId, currentContact);
        }
        fetchContacts();
        handleClose();
      } catch (err) {
        setError('Failed to save emergency contact.');
      }
    }
  };

  const handleDelete = async (contactId: number) => {
    if (user?.userId) {
      try {
        await deleteEmergencyContact(user.userId, contactId);
        fetchContacts();
      } catch (err) {
        setError('Failed to delete emergency contact.');
      }
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Emergency Contacts
      </Typography>
      <Button variant="contained" onClick={() => handleClickOpen()}>
        Add Contact
      </Button>
      <Paper sx={{ mt: 2 }}>
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        <List>
          {contacts.map((contact) => (
            <ListItem key={contact.contactId} secondaryAction={
              <Box>
                <Button onClick={() => handleClickOpen(contact)}>Edit</Button>
                <Button onClick={() => handleDelete(contact.contactId)}>Delete</Button>
              </Box>
            }>
              <ListItemText primary={contact.name} secondary={`${contact.relationship} - ${contact.phone}`} />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{currentContact?.contactId ? 'Edit' : 'Add'} Emergency Contact</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={currentContact?.name || ''}
            onChange={(e) => setCurrentContact({ ...currentContact, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Phone"
            fullWidth
            value={currentContact?.phone || ''}
            onChange={(e) => setCurrentContact({ ...currentContact, phone: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Relationship"
            fullWidth
            value={currentContact?.relationship || ''}
            onChange={(e) => setCurrentContact({ ...currentContact, relationship: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EmergencyContacts;
