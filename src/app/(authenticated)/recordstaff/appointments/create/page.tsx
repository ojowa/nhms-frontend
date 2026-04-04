// src/app/(authenticated)/recordstaff/appointments/create/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { AppointmentType, AppointmentStatus } from '@/types/appointment'; // Adjust path as needed
import { UserRole } from '@/types/auth';
import { Department } from '@/types/department'; // Adjust path as needed
import { User } from '@/types/user'; // Adjust path as needed
import { bookAppointment } from '@/services/appointmentService'; // Adjust path as needed
import { fetchAllDepartments } from '@/services/departmentService'; // Adjust path as needed
import { fetchDoctors, searchDoctors } from '@/services/userService'; // Adjust path as needed
import { searchPatients } from '@/services/patientService'; // Adjust path as needed
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';

interface PatientSearchResult {
  patientId: number;
  firstName: string;
  lastName: string;
  email: string;
  nisNumber?: string;
}

const CreateAppointmentPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [patientId, setPatientId] = useState<number | null>(null);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState<PatientSearchResult[]>([]);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [appointmentDateTime, setAppointmentDateTime] = useState<Date | undefined>(undefined);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [doctorSearchResults, setDoctorSearchResults] = useState<User[]>([]);
  const [selectedDoctorName, setSelectedDoctorName] = useState('');
  const [reason, setReason] = useState('');
  const [serviceType, setServiceType] = useState<AppointmentType>('Doctor Consultation');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [departmentsData, doctorsData] = await Promise.all([
          fetchAllDepartments(),
          fetchDoctors(),
        ]);
        setDepartments(departmentsData);
        setDoctors(doctorsData);
      } catch (error) {
        showSnackbar('Failed to load initial data.', 'error');
      }
    };
    loadData();
  }, [showSnackbar]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (patientSearchTerm.length > 2) {
        try {
          const results = await searchPatients(patientSearchTerm);
          setPatientSearchResults(results);
        } catch (error) {
          showSnackbar('Failed to search patients.', 'error');
        }
      } else {
        setPatientSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [patientSearchTerm, showSnackbar]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (doctorSearchTerm.length > 2) {
        try {
          const results = await searchDoctors(doctorSearchTerm);
          setDoctorSearchResults(results);
        } catch (error) {
          showSnackbar('Failed to search doctors.', 'error');
        }
      } else {
        setDoctorSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [doctorSearchTerm, showSnackbar]);

  const handlePatientSelect = (patient: PatientSearchResult) => {
    setPatientId(patient.patientId);
    setSelectedPatientName(`${patient.firstName} ${patient.lastName} (${patient.nisNumber || patient.email})`);
    setPatientSearchTerm(''); // Clear search term after selection
    setPatientSearchResults([]); // Clear search results
  };

  const handleDoctorSelect = (doctor: User) => {
    setDoctorId(doctor.user_id);
    setSelectedDoctorName([doctor.first_name, doctor.middle_name, doctor.last_name].filter(Boolean).join(' '));
    setDoctorSearchTerm(''); // Clear search term after selection
    setDoctorSearchResults([]); // Clear search results
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !appointmentDateTime || !reason || !serviceType || !user?.userId) {
      showSnackbar('Please fill in all required fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      await bookAppointment({
        patientId,
        appointmentDateTime: appointmentDateTime.toISOString(),
        reason,
        appointmentType: serviceType, // Use appointmentType as expected by payload
        departmentId: departmentId || undefined,
        doctorId: doctorId || undefined,
        // The API automatically uses the authenticated user's ID as created_by_user_id
      });
      showSnackbar('Appointment created successfully!', 'success');
      router.push('/recordstaff/dashboard'); // Redirect to record staff dashboard
    } catch (error: any) {
      console.error('Failed to create appointment:', error);
      showSnackbar(error.message || 'Failed to create appointment.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user || (!user.roles.includes(UserRole.Admin) && !user.roles.includes(UserRole.RecordStaff))) {
    router.push('/dashboard'); // Redirect if not authorized
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Appointment</CardTitle>
          <CardDescription>
            Fill in the details below to schedule a new physical consultation appointment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            {/* Patient Search and Selection */}
            <div className="grid gap-2">
              <Label htmlFor="patientSearch">Search Patient</Label>
              <Input
                id="patientSearch"
                type="text"
                placeholder="Enter patient name, NIS number, or email"
                value={patientSearchTerm}
                onChange={(e) => {
                  setPatientSearchTerm(e.target.value);
                  setPatientId(null); // Clear selected patient if search term changes
                  setSelectedPatientName('');
                }}
              />
              {patientSearchResults.length > 0 && (
                <div className="border rounded-md mt-2 max-h-48 overflow-y-auto">
                  {patientSearchResults.map((patient) => (
                    <div
                      key={patient.patientId}
                      className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handlePatientSelect(patient)}
                    >
                      {patient.firstName} {patient.lastName} ({patient.nisNumber || patient.email})
                    </div>
                  ))}
                </div>
              )}
              {selectedPatientName && (
                <p className="text-sm text-green-600 dark:text-green-400">Selected Patient: {selectedPatientName}</p>
              )}
              {!patientId && patientSearchTerm.length > 2 && patientSearchResults.length === 0 && (
                <p className="text-sm text-red-500">No patients found. Please try a different search term or ensure the patient is registered.</p>
              )}
            </div>

            {/* Appointment Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="appointmentDate">Appointment Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !appointmentDateTime && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {appointmentDateTime ? format(appointmentDateTime, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={appointmentDateTime}
                      onSelect={setAppointmentDateTime}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="appointmentTime">Appointment Time</Label>
                <Input
                  id="appointmentTime"
                  type="time"
                  value={appointmentDateTime ? format(appointmentDateTime, "HH:mm") : ''}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    if (appointmentDateTime) {
                      const newDateTime = new Date(appointmentDateTime);
                      newDateTime.setHours(hours, minutes);
                      setAppointmentDateTime(newDateTime);
                    } else {
                      const now = new Date();
                      now.setHours(hours, minutes);
                      setAppointmentDateTime(now);
                    }
                  }}
                  required
                />
              </div>
            </div>

            {/* Service Type */}
            <div className="grid gap-2">
              <Label htmlFor="serviceType">Service Type</Label>
              <Select value={serviceType} onValueChange={(value: AppointmentType) => setServiceType(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Doctor Consultation">Doctor Consultation</SelectItem>
                  <SelectItem value="Telemedicine Consultation">Telemedicine Consultation</SelectItem>
                  {/* Add other service types as needed */}
                </SelectContent>
              </Select>
            </div>

            {/* Department Selection */}
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={departmentId !== null ? String(departmentId) : ''}
                onValueChange={(value) => setDepartmentId(Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Department (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.departmentId} value={String(dept.departmentId)}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Doctor Selection */}
            <div className="grid gap-2">
              <Label htmlFor="doctor">Assign Doctor (Optional)</Label>
              <Input
                id="doctor"
                type="text"
                placeholder="Search for doctor by name or email"
                value={doctorSearchTerm}
                onChange={(e) => {
                  setDoctorSearchTerm(e.target.value);
                  setDoctorId(null); // Clear selected doctor if search term changes
                  setSelectedDoctorName('');
                }}
              />
              {doctorSearchResults.length > 0 && (
                <div className="border rounded-md mt-2 max-h-48 overflow-y-auto">
                  {doctorSearchResults.map((doctor) => (
                    <div
                      key={doctor.user_id}
                      className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleDoctorSelect(doctor)}
                    >
                      {[doctor.first_name, doctor.middle_name, doctor.last_name].filter(Boolean).join(' ')} ({doctor.email})
                    </div>
                  ))}
                </div>
              )}
              {selectedDoctorName && (
                <p className="text-sm text-green-600 dark:text-green-400">Selected Doctor: {selectedDoctorName}</p>
              )}
              {!doctorId && doctorSearchTerm.length > 2 && doctorSearchResults.length === 0 && (
                <p className="text-sm text-red-500">No doctors found. Please try a different search term.</p>
              )}
            </div>

            {/* Reason for Appointment */}
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Appointment</Label>
              <Textarea
                id="reason"
                placeholder="Briefly describe the reason for the appointment"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Appointment...' : 'Create Appointment'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => router.back()}>
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateAppointmentPage;
