'use client';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Box,
  TablePagination,
  TextField,
  Button,
  Autocomplete,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import withAuth from '@/components/auth/withAuth';
import { useEffect, useState } from 'react';
import { LabResult } from '@/types/labResult';
import { getLabResultsByPatientIdWithAuth, PaginatedPatientLabResults } from '@/services/labResultService';
import { searchPatients } from '@/services/userAdminService';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

interface PatientSearchResult {
  patientId: number;
  firstName: string;
  lastName: string;
}

function LabResultsPage() {
  const { user } = useAuth();
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultNameSearch, setResultNameSearch] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalResults, setTotalResults] = useState(0);

  // Admin patient search states
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [searchedPatients, setSearchedPatients] = useState<PatientSearchResult[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);

  const isAdmin = user?.roles.includes(UserRole.Admin);

  useEffect(() => {
    const fetchLabResults = async () => {
      const patientId = isAdmin ? selectedPatient?.patientId : user?.patientId;

      if (patientId) {
        try {
          setLoading(true);
          const response = await getLabResultsByPatientIdWithAuth(
            patientId,
            user!, // Pass user for authorization
            page + 1,
            rowsPerPage,
            resultNameSearch,
            startDate ? startDate.toISOString() : undefined,
            endDate ? endDate.toISOString() : undefined
          );
          if (response) {
            setLabResults(response.data);
            setTotalResults(response.total);
          } else {
            setLabResults([]);
            setTotalResults(0);
          }
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch lab results.';
          setError(errorMessage);
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else if (!isAdmin) {
        setLoading(false);
      }
    };

    fetchLabResults();
  }, [user, page, rowsPerPage, resultNameSearch, startDate, endDate, selectedPatient, isAdmin]);

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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearch = () => {
    setPage(0);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Lab Results
      </Typography>

      {isAdmin && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
          <Autocomplete
            options={searchedPatients}
            getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
            isOptionEqualToValue={(option, value) => option.patientId === value.patientId}
            onChange={(event, newValue) => setSelectedPatient(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search for a patient"
                variant="outlined"
                onChange={(e) => setPatientSearchTerm(e.target.value)}
                sx={{ width: 300 }}
              />
            )}
          />
          <Button variant="contained" onClick={handlePatientSearch}>
            Search Patients
          </Button>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="Search by Test Name"
          variant="outlined"
          value={resultNameSearch}
          onChange={(e) => setResultNameSearch(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue ? (newValue instanceof Date ? newValue : newValue.toDate()) : null)}
            slotProps={{ textField: { variant: 'outlined', sx: { minWidth: 200 } } }}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue ? (newValue instanceof Date ? newValue : newValue.toDate()) : null)}
            slotProps={{ textField: { variant: 'outlined', sx: { minWidth: 200 } } }}
          />
        </LocalizationProvider>
        <Button variant="contained" onClick={handleSearch}>
          Search Results
        </Button>
      </Box>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <>
          <List>
            {labResults.map((result) => (
              <ListItem key={result.labResultId} divider>
                <ListItemText
                  primary={`${result.testName}: ${result.resultValue} ${result.unit ? result.unit : ''} (${result.status})`}
                  secondary={`Date: ${new Date(result.createdAt).toLocaleDateString()} | Reference Range: ${result.referenceRange ? result.referenceRange : 'N/A'}`}
                />
              </ListItem>
            ))}
          </List>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalResults}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Box>
  );
}

export default withAuth(LabResultsPage, ['LabStaff', 'Doctor', 'Patient', 'Officer', 'Family Member', 'Admin']);
