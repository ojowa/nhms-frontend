# React Query Hooks Guide

**Date:** 2026-04-03  
**Status:** ✅ Complete

---

## Overview

The NHMS frontend now includes comprehensive React Query hooks for all API operations, providing:

- ✅ Automatic caching and background refetching
- ✅ Loading and error states
- ✅ Optimistic updates
- ✅ Automatic query invalidation
- ✅ Type-safe API calls

---

## Installation

React Query has been installed:

```bash
npm install @tanstack/react-query
```

---

## Setup

The `ReactQueryProvider` has been added to the root layout:

```tsx
// nhms-frontend/src/app/layout.tsx
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
```

---

## Usage Examples

### Authentication

#### Login

```tsx
'use client';

import { useLogin } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin({
    onSuccess: (data) => {
      // User is logged in
      router.push('/dashboard');
    },
    onError: (error) => {
      // Show error message
      console.error('Login failed:', error.message);
    },
  });

  const handleSubmit = async (credentials: LoginRequest) => {
    await loginMutation.mutateAsync(credentials);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="loginIdentifier" placeholder="Email or NIS Number" />
      <input name="password" type="password" placeholder="Password" />
      <button 
        type="submit" 
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

#### Register

```tsx
'use client';

import { useRegister } from '@/hooks/useApi';

export default function RegisterForm() {
  const registerMutation = useRegister({
    onSuccess: () => {
      // Redirect to login or auto-login
      router.push('/login');
    },
  });

  const handleSubmit = async (data: RegisterRequest) => {
    await registerMutation.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={registerMutation.isPending}>
        {registerMutation.isPending ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
```

---

### Appointments

#### List Appointments

```tsx
'use client';

import { useAppointments } from '@/hooks/useApi';
import { AppointmentStatus } from '@/types/appointment';

export default function AppointmentsList() {
  const { data, isLoading, error } = useAppointments('SCHEDULED', {
    page: 1,
    limit: 10,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Appointments</h1>
      {data.data.map((apt) => (
        <div key={apt.id}>
          <h3>{apt.serviceType}</h3>
          <p>{apt.dateTime}</p>
          <p>Status: {apt.status}</p>
        </div>
      ))}
      <p>Total: {data.total}</p>
    </div>
  );
}
```

#### Book Appointment

```tsx
'use client';

import { useBookAppointment } from '@/hooks/useApi';

export default function BookAppointmentForm() {
  const bookMutation = useBookAppointment({
    onSuccess: () => {
      // Show success message
      alert('Appointment booked successfully!');
      // The appointments list will automatically refresh
    },
  });

  const handleSubmit = async (payload: BookAppointmentPayload) => {
    await bookMutation.mutateAsync(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={bookMutation.isPending}>
        {bookMutation.isPending ? 'Booking...' : 'Book Appointment'}
      </button>
    </form>
  );
}
```

#### Update Appointment Status

```tsx
'use client';

import { useUpdateAppointmentStatus } from '@/hooks/useApi';
import { AppointmentStatus } from '@/types/appointment';

export default function AppointmentActions({ appointmentId }: { appointmentId: number }) {
  const updateMutation = useUpdateAppointmentStatus();

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    await updateMutation.mutateAsync({
      appointmentId,
      payload: { newStatus },
    });
  };

  return (
    <div>
      <button onClick={() => handleStatusChange('ASSIGNED')}>
        Assign
      </button>
      <button onClick={() => handleStatusChange('CANCELLED')}>
        Cancel
      </button>
      {updateMutation.isPending && <span>Updating...</span>}
    </div>
  );
}
```

---

### Patients

#### Search Patients

```tsx
'use client';

import { usePatientSearch } from '@/hooks/useApi';
import { useState } from 'react';

export default function PatientSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading } = usePatientSearch(searchTerm);

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search patients..."
      />
      {isLoading && <div>Searching...</div>}
      {data && (
        <ul>
          {data.map((patient) => (
            <li key={patient.patientId}>
              {patient.firstName} {patient.lastName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

### Pharmacy

#### Formulary Search

```tsx
'use client';

import { useFormulary } from '@/hooks/useApi';
import { useState } from 'react';

export default function FormularySearch() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useFormulary(query);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search drugs..."
      />
      {isLoading && <div>Loading...</div>}
      {data && (
        <ul>
          {data.map((drug) => (
            <li key={drug.drugId}>
              {drug.name} - {drug.genericName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

#### Dispense Medication

```tsx
'use client';

import { useDispenseMedication, usePendingPrescriptions } from '@/hooks/useApi';

export default function DispenseMedication() {
  const { data: prescriptions } = usePendingPrescriptions();
  const dispenseMutation = useDispenseMedication({
    onSuccess: () => {
      // Both pending prescriptions and inventory will auto-refresh
      alert('Medication dispensed!');
    },
  });

  const handleDispense = async (prescriptionId: number, inventoryId: number) => {
    await dispenseMutation.mutateAsync({
      prescriptionId,
      inventoryId,
      quantityDispensed: 30,
    });
  };

  return (
    <div>
      {prescriptions?.map((rx) => (
        <button
          key={rx.prescriptionId}
          onClick={() => handleDispense(rx.prescriptionId, rx.drugId)}
        >
          Dispense {rx.medicationName}
        </button>
      ))}
    </div>
  );
}
```

---

### Notifications

#### Real-time Notifications

```tsx
'use client';

import { useUnreadNotifications, useMarkNotificationAsRead } from '@/hooks/useApi';

export default function NotificationBell() {
  const { data: notifications } = useUnreadNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();

  const handleMarkAsRead = async (notificationId: number) => {
    await markAsReadMutation.mutateAsync(notificationId);
  };

  return (
    <div>
      {notifications?.length > 0 && (
        <span className="badge">{notifications.length}</span>
      )}
      {notifications?.map((notification) => (
        <div
          key={notification.id}
          onClick={() => handleMarkAsRead(notification.id)}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
}
```

**Note:** Notifications auto-refresh every 30 seconds!

---

### EMR

#### ICD-10 Code Search

```tsx
'use client';

import { useICD10Search } from '@/hooks/useApi';
import { useState } from 'react';

export default function ICD10Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading } = useICD10Search(searchTerm);

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search ICD-10 codes..."
      />
      {isLoading && <div>Searching...</div>}
      {data && (
        <ul>
          {data.map((code) => (
            <li key={code.code}>
              {code.code}: {code.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

### Bed Management

#### Ward and Bed Selection

```tsx
'use client';

import { useWards, useBedsInWard, useAssignBed } from '@/hooks/useApi';
import { useState } from 'react';

export default function BedAssignment() {
  const [selectedWard, setSelectedWard] = useState<number | null>(null);
  const { data: wards } = useWards();
  const { data: beds } = useBedsInWard(selectedWard || 0);
  const assignMutation = useAssignBed();

  const handleAssign = async (admissionId: number, bedId: number) => {
    await assignMutation.mutateAsync({ admissionId, bedId });
  };

  return (
    <div>
      <select onChange={(e) => setSelectedWard(Number(e.target.value))}>
        <option value="">Select Ward</option>
        {wards?.map((ward) => (
          <option key={ward.wardId} value={ward.wardId}>
            {ward.name}
          </option>
        ))}
      </select>

      {beds?.map((bed) => (
        <button
          key={bed.bedId}
          onClick={() => handleAssign(admissionId, bed.bedId)}
          disabled={bed.status !== 'Available'}
        >
          Bed {bed.bedNumber} - {bed.status}
        </button>
      ))}
    </div>
  );
}
```

---

## Advanced Patterns

### Optimistic Updates

```tsx
const markAsReadMutation = useMarkNotificationAsRead({
  onMutate: async (notificationId) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['unreadNotifications'] });

    // Snapshot the previous value
    const previousNotifications = queryClient.getQueryData(['unreadNotifications']);

    // Optimistically update
    queryClient.setQueryData(['unreadNotifications'], (old: any) => ({
      ...old,
      data: old.data.filter((n: any) => n.id !== notificationId),
    }));

    return { previousNotifications };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(
      ['unreadNotifications'],
      context?.previousNotifications
    );
  },
  onSettled: () => {
    // Always refetch after mutation
    queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
  },
});
```

### Conditional Queries

```tsx
// Only fetch if user has permission
const { data } = useAppointment(appointmentId, {
  enabled: userHasPermission,
});

// Only fetch if searchTerm is long enough
const { data } = usePatientSearch(searchTerm, {
  enabled: searchTerm.length >= 2,
});
```

### Dependent Queries

```tsx
// Fetch appointment first, then fetch vitals
const { data: appointment } = useAppointment(appointmentId);
const { data: vitals } = useVitalSignsByAppointment(appointmentId, {
  enabled: !!appointment, // Only fetch if appointment exists
});
```

---

## Query Configuration

### Default Settings

```tsx
// nhms-frontend/src/providers/ReactQueryProvider.tsx
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### Override Per Query

```tsx
const { data } = useAppointments('SCHEDULED', {}, {
  staleTime: 1000 * 60 * 1, // 1 minute
  retry: 3,
  refetchOnWindowFocus: true,
});
```

---

## Available Hooks

### Authentication
- `useLogin()`
- `useRegister()`
- `useForgotPassword()`
- `useResetPassword()`
- `useLogout()`
- `useGetCurrentUser()`

### Appointments
- `useAppointments()`
- `useCombinedAppointments()`
- `useAppointment()`
- `useBookAppointment()`
- `useUpdateAppointmentStatus()`
- `useAssignDoctorToAppointment()`

### Patients
- `usePatientSearch()`

### EMR
- `useMedicalRecords()`
- `useMedicalRecord()`
- `useCreateMedicalRecord()`
- `useAddDiagnosis()`
- `useAddPrescription()`
- `useICD10Search()`

### Pharmacy
- `useFormulary()`
- `useInventory()`
- `usePendingPrescriptions()`
- `useDispenseMedication()`

### Admissions
- `useAdmittedPatients()`
- `useAdmission()`
- `useCreateAdmission()`

### Departments
- `useDepartments()`
- `useAllDepartments()`
- `useCreateDepartment()`

### Notifications
- `useUnreadNotifications()`
- `useMarkNotificationAsRead()`

### User Profile
- `useUserProfile()`
- `useDoctors()`
- `useUpdateUserProfile()`

### Family
- `useFamilyMembers()`
- `useAddFamilyMember()`

### Bed Management
- `useWards()`
- `useBedsInWard()`
- `usePendingAdmissions()`
- `useAssignBed()`

### Lab
- `usePendingLabRequests()`
- `useCreateLabRequest()`

### Vitals
- `useVitalSignsByAppointment()`
- `useCreateVitalSign()`

### Consultations
- `useConsultations()`
- `useConsultation()`
- `useSaveConsultationNotes()`

### Discharge
- `useCreateDischargeSummary()`
- `useDischargePatient()`

### Medication Administration
- `useMedicationAdministrations()`
- `usePendingMedicationAdministrations()`
- `useCreateMedicationAdministration()`

### Admin
- `useUsers()`
- `useRoles()`
- `useCreateUser()`
- `useUpdateUserRoles()`

---

## Migration from Services

### Before (Service-only)

```tsx
import { appointmentService } from '@/services/appointmentService';
import { useState, useEffect } from 'react';

export default function AppointmentsList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    appointmentService.getAppointmentsByStatus('SCHEDULED')
      .then(setAppointments)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{/* Render appointments */}</div>;
}
```

### After (React Query)

```tsx
import { useAppointments } from '@/hooks/useApi';

export default function AppointmentsList() {
  const { data, isLoading, error } = useAppointments('SCHEDULED');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render appointments */}</div>;
}
```

**Benefits:**
- ✅ 60% less code
- ✅ Automatic caching
- ✅ Background refetching
- ✅ Loading/error states
- ✅ Automatic invalidation on mutations

---

## Best Practices

1. **Always use hooks in components** - Don't call services directly
2. **Handle loading states** - Show skeletons or spinners
3. **Handle errors gracefully** - Show user-friendly messages
4. **Use optimistic updates** - For better UX on mutations
5. **Configure stale times appropriately** - Balance freshness and performance
6. **Invalidate queries on mutations** - Keep data in sync

---

## Debugging

Install React Query Devtools:

```bash
npm install @tanstack/react-query-devtools
```

The devtools are already included in the provider and can be opened with the keyboard shortcut.

---

**Last Updated:** 2026-04-03  
**Status:** ✅ Complete
