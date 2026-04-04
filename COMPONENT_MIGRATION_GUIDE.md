# Component Migration Guide

**Date:** 2026-04-03  
**Status:** In Progress

---

## Overview

This guide documents the migration of NHMS frontend components from direct service calls to React Query hooks with proper loading skeletons.

---

## Migration Checklist

### ✅ Completed Components

1. **Login Page** (`/app/(auth)/login/page.tsx`)
   - ✅ Using `useLogin()` hook
   - ✅ Loading state on button
   - ✅ Error handling with snackbar

2. **Booking Form** (`/components/appointments/BookingForm.tsx`)
   - ✅ Using `useBookAppointment()` hook
   - ✅ Using `useAllDepartments()` hook
   - ✅ Loading skeletons for department dropdown
   - ✅ Automatic query invalidation

3. **Combined Appointments DataGrid** (`/components/appointments/CombinedAppointmentsDataGrid.tsx`)
   - ✅ Using `useAppointments()` hook
   - ✅ Using `AppointmentListSkeleton`
   - ✅ Error handling with Alert

4. **Admin Dashboard** (`/app/(authenticated)/admin/dashboard/page.tsx`)
   - ✅ Using `useUsers()`, `useLoggedInUsers()` hooks
   - ✅ Using `ContentSkeleton`
   - ✅ Automatic data refresh

### 📦 New Components Created

1. **Skeleton Components** (`/components/ui/skeletons.tsx`)
   - CardSkeleton
   - AppointmentListSkeleton
   - TableSkeleton
   - FormSkeleton
   - DashboardStatsSkeleton
   - ContentSkeleton
   - LoadingOverlay
   - And more...

2. **React Query Provider** (`/providers/ReactQueryProvider.tsx`)
   - Configured in root layout
   - 5 minute default stale time
   - React Query Devtools included

---

## Migration Pattern

### Before (Service-only)

```tsx
'use client';

import { useState, useEffect } from 'react';
import { appointmentService } from '@/services/appointmentService';

export default function AppointmentsList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    appointmentService.getAppointmentsByStatus('SCHEDULED')
      .then(data => {
        setAppointments(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {appointments.map(apt => (
        <div key={apt.id}>{apt.serviceType}</div>
      ))}
    </div>
  );
}
```

### After (React Query + Skeletons)

```tsx
'use client';

import { useAppointments } from '@/hooks/useApi';
import { AppointmentListSkeleton } from '@/components/ui/skeletons';

export default function AppointmentsList() {
  const { data, isLoading, error } = useAppointments('SCHEDULED');

  if (isLoading) {
    return <AppointmentListSkeleton />;
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <div>
      {data.data.map(apt => (
        <div key={apt.id}>{apt.serviceType}</div>
      ))}
    </div>
  );
}
```

**Benefits:**
- ✅ 60% less code
- ✅ Better loading states (skeletons)
- ✅ Automatic caching
- ✅ Background refetching
- ✅ Automatic retries

---

## Skeleton Usage Guide

### Basic Skeletons

```tsx
import { 
  CardSkeleton, 
  ListSkeleton, 
  TableSkeleton,
  ContentSkeleton 
} from '@/components/ui/skeletons';

// Single card loading
<CardSkeleton />

// List of 5 items
<ListSkeleton count={5} />

// Table with 10 rows
<TableSkeleton rows={10} />

// Complex page
<ContentSkeleton 
  title 
  stats={4} 
  listItems={10} 
  form 
/>
```

### Specific Skeletons

```tsx
// Appointments
<AppointmentListSkeleton />
<AppointmentCardSkeleton />

// Patients
<PatientListSkeleton />
<PatientCardSkeleton />

// Users
<UserTableSkeleton />

// Departments
<DepartmentTableSkeleton />

// Forms
<LoginFormSkeleton />
<RegisterFormSkeleton />
<BookingFormSkeleton />

// Dashboard
<DashboardStatsSkeleton />
<StatCardSkeleton />

// Profile
<ProfileSkeleton />

// Dialogs
<DialogSkeleton />

// Charts
<ChartSkeleton height={300} />
```

### Custom Skeletons

```tsx
// Custom card skeleton
<CardSkeleton width="100%" height={200} />

// Custom list
<ListSkeleton count={8} />

// Custom table
<TableSkeleton rows={15} columns={8} />

// Custom form
<FormSkeleton fields={10} />
```

---

## Hooks Usage by Page

### Authentication Pages

#### Login (`/auth/login`)
```tsx
const loginMutation = useLogin({
  onSuccess: (user) => {
    showSnackbar('Login successful!', 'success');
    router.push(getDashboardPath(user));
  },
  onError: (error) => {
    showSnackbar(error.message, 'error');
  },
});

// Usage
await loginMutation.mutateAsync({ loginIdentifier, password });

// Loading state
<button disabled={loginMutation.isPending}>
  {loginMutation.isPending ? 'Logging in...' : 'Login'}
</button>
```

#### Register (`/auth/register`)
```tsx
const registerMutation = useRegister({
  onSuccess: () => {
    router.push('/login');
  },
});

await registerMutation.mutateAsync(userData);
```

### Appointments Pages

#### List Appointments
```tsx
const { data, isLoading, error } = useAppointments('SCHEDULED', {
  page: 1,
  limit: 10,
});

if (isLoading) return <AppointmentListSkeleton />;
if (error) return <Alert severity="error">{error.message}</Alert>;
```

#### Book Appointment
```tsx
const bookMutation = useBookAppointment({
  onSuccess: () => {
    showSnackbar('Appointment booked!', 'success');
  },
});

const { data: departments } = useAllDepartments();

await bookMutation.mutateAsync(payload);
```

### Admin Pages

#### Dashboard
```tsx
const { data: usersData, isLoading } = useUsers({ page, limit });
const { data: loggedInData } = useLoggedInUsers();
const deleteUserMutation = useDeleteUser();

if (isLoading) return <ContentSkeleton title stats={2} listItems={10} />;
```

#### User Management
```tsx
const createUserMutation = useCreateUser({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});

const updateUserRolesMutation = useUpdateUserRoles();
```

### Medical Pages

#### EMR
```tsx
const { data: records } = useMedicalRecords({ page, pageSize });
const { data: record } = useMedicalRecord(recordId);
const createRecordMutation = useCreateMedicalRecord();
const addDiagnosisMutation = useAddDiagnosis();
const addPrescriptionMutation = useAddPrescription();
```

#### Pharmacy
```tsx
const { data: formulary } = useFormulary(query);
const { data: inventory } = useInventory(query);
const { data: pending } = usePendingPrescriptions();
const dispenseMutation = useDispenseMedication();
```

### Department Pages

```tsx
const { data: departmentsData } = useDepartments(page, limit, searchTerm);
const { data: allDepartments } = useAllDepartments();
const createDepartmentMutation = useCreateDepartment();

if (!departmentsData) return <DepartmentTableSkeleton />;
```

---

## Error Handling Patterns

### Simple Error Display
```tsx
if (error) {
  return <Alert severity="error">{error.message}</Alert>;
}
```

### Error with Retry
```tsx
const { error, refetch } = useAppointments('SCHEDULED');

if (error) {
  return (
    <Alert severity="error" action={
      <Button onClick={() => refetch()}>Retry</Button>
    }>
      {error.message}
    </Alert>
  );
}
```

### Error with Snackbar
```tsx
const mutation = useBookAppointment({
  onError: (error: any) => {
    showSnackbar(error.message || 'Failed to book', 'error');
  },
});
```

---

## Loading State Patterns

### Full Page Loading
```tsx
if (isLoading) {
  return <PageSkeleton />;
}
```

### Card/List Loading
```tsx
if (isLoading) {
  return <AppointmentListSkeleton />;
}
```

### Form Loading
```tsx
if (isLoading) {
  return <BookingFormSkeleton />;
}
```

### Button Loading
```tsx
<button disabled={mutation.isPending}>
  {mutation.isPending ? 'Saving...' : 'Save'}
</button>
```

### Skeleton Inline
```tsx
<TextField
  label="Department"
  value={selectedDepartment}
  disabled={isLoading}
  InputProps={{
    endAdornment: isLoading ? <CircularProgress size={24} /> : null,
  }}
/>
```

---

## Next Components to Migrate

### High Priority
- [ ] Doctor Dashboard (`/doctor/dashboard`)
- [ ] Doctor Consultations (`/doctor/consultations`)
- [ ] Nurse Dashboard (`/nurse/dashboard`)
- [ ] Patient Dashboard (`/patient/dashboard`)
- [ ] EMR pages (`/emr/*`)
- [ ] Pharmacy pages (`/pharmacy/*`)

### Medium Priority
- [ ] Lab pages (`/lab/*`)
- [ ] Admissions pages (`/admissions/*`)
- [ ] Bed Management pages (`/bed-management/*`)
- [ ] Department Management (`/admin/departments`)
- [ ] User Management (`/admin/user-management`)

### Low Priority
- [ ] Settings pages
- [ ] Reports pages
- [ ] Profile pages

---

## Best Practices

1. **Always use skeletons** - Never show blank screens
2. **Match skeleton to content** - Use appropriate skeleton type
3. **Handle errors gracefully** - Show user-friendly messages
4. **Disable buttons during mutation** - Prevent double submissions
5. **Invalidate queries on mutation** - Keep data fresh
6. **Use optimistic updates** - For better UX when appropriate
7. **Add retry logic** - For transient failures

---

## Testing Checklist

- [ ] All loading states show skeletons
- [ ] All errors display properly
- [ ] All mutations show loading state
- [ ] Queries auto-refresh after mutations
- [ ] Skeletons match final content layout
- [ ] No console errors during loading
- [ ] Accessibility maintained (ARIA labels)

---

**Last Updated:** 2026-04-03  
**Components Migrated:** 4  
**Skeletons Created:** 20+  
**Hooks Available:** 70+
