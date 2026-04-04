# Frontend-Backend API Alignment Guide

**Date:** 2026-04-03  
**Purpose:** Ensure seamless communication between frontend and backend

---

## Overview

This guide documents the alignment between the NHMS frontend and backend APIs, ensuring consistent data formats, error handling, and type safety.

---

## Architecture

```
Frontend (React/Next.js)
    ↓
API Client (axios with interceptors)
    ↓
Backend API (Next.js)
    ↓
Database (SQL Server)
```

---

## API Client Configuration

### Location
`nhms-frontend/src/utils/api-client.ts`

### Features
- Automatic JWT token attachment
- Standardized response handling
- Centralized error handling
- Type-safe requests
- Timeout configuration (30s)

### Usage

```typescript
import { apiClient } from '@/utils/api-client';

// GET request
const data = await apiClient.get<User[]>('/users');

// POST request
const user = await apiClient.post<User>('/users', userData);

// File upload
const result = await apiClient.upload('/upload', formData);

// File download
const blob = await apiClient.download('/report.pdf');
```

---

## Response Format Alignment

### Backend Response Format

All backend responses now follow this standardized format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2026-04-03T10:00:00.000Z",
  "requestId": "1234567890-abcdef"
}
```

### Error Response Format

```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Password must be 8+ characters" }
  ],
  "timestamp": "2026-04-03T10:00:00.000Z",
  "requestId": "1234567890-abcdef"
}
```

### Frontend Handling

The API client automatically:
1. Extracts `data` from successful responses
2. Throws `ApiError` for failed responses
3. Preserves validation errors for form handling

```typescript
try {
  const user = await apiClient.post('/auth/register', userData);
  console.log(user); // Direct access to data
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.status); // HTTP status code
    console.log(error.errors); // Validation errors
    console.log(error.message); // Error message
  }
}
```

---

## Type Alignment

### Authentication Types

**Backend:** `nhms-backend/src/modules/auth/auth.service.ts`  
**Frontend:** `nhms-frontend/src/types/auth.ts`

```typescript
// Both sides use identical types
export interface User {
  userId: number;
  uuid: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  // ...
}
```

### Appointment Types

**Backend:** `nhms-backend/src/modules/appointment/appointment.types.ts`  
**Frontend:** `nhms-frontend/src/types/appointment.ts`

```typescript
// Status enums must match exactly
export type AppointmentStatus =
  | 'PENDING'
  | 'SCHEDULED'
  | 'ASSIGNED'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NOSHOW';
```

---

## Validation Alignment

### Backend Validation Schemas

Location: `nhms-backend/src/utils/validation.ts`

Example:
```typescript
export const registerSchema = z.object({
  nisNumber: z.string().min(6),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
});
```

### Frontend Validation

Frontend should validate before sending to backend:

```typescript
import { z } from 'zod';

const registerSchema = z.object({
  nisNumber: z.string().min(6, 'NIS number must be at least 6 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
});

// Validate before API call
const validation = registerSchema.safeParse(formData);
if (!validation.success) {
  // Show validation errors to user
  return;
}

// Send to backend
await authService.register(validation.data);
```

---

## Service Alignment

### Authentication Service

**Backend Routes:** `nhms-backend/src/server/auth/dispatcher.ts`  
**Frontend Service:** `nhms-frontend/src/services/authService.ts`

| Endpoint | Method | Frontend Function | Validation |
|----------|--------|-------------------|------------|
| `/auth/login` | POST | `login()` | loginSchema |
| `/auth/register` | POST | `register()` | registerSchema |
| `/auth/refresh-token` | POST | `refreshAccessToken()` | refreshTokenSchema |
| `/auth/forgot-password` | POST | `requestPasswordReset()` | forgotPasswordSchema |
| `/auth/reset-password` | POST | `resetPassword()` | resetPasswordSchema |
| `/auth/logout` | DELETE | `logout()` | - |

### Appointment Service

**Backend Routes:** `nhms-backend/src/server/appointments/dispatcher.ts`  
**Frontend Service:** `nhms-frontend/src/services/appointmentService.ts`

| Endpoint | Method | Frontend Function | Validation |
|----------|--------|-------------------|------------|
| `/appointments` | POST | `bookAppointment()` | bookAppointmentSchema |
| `/appointments` | GET | `getAppointmentsByStatus()` | - |
| `/appointments/combined` | GET | `getCombinedAppointments()` | - |
| `/appointments/{id}` | GET | `getAppointment()` | - |
| `/appointments/{id}/assign-doctor` | POST | `assignDoctorToAppointment()` | assignDoctorSchema |
| `/appointments/{id}/status` | PUT | `updateAppointmentStatus()` | updateAppointmentStatusSchema |

---

## Error Handling

### Frontend Error Handling

```typescript
import { ApiError, handleValidationError } from '@/utils/api-client';

// In a form submission handler
const handleSubmit = async (data: FormData) => {
  try {
    await authService.register(data);
    // Success - redirect or show success message
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.isValidationError()) {
        // Handle field-specific errors
        error.errors?.forEach((err) => {
          setFieldError(err.field, err.message);
        });
      } else if (error.status === 401) {
        // Handle authentication error
        redirectToLogin();
      } else if (error.status === 403) {
        // Handle permission error
        showPermissionDenied();
      } else if (error.status === 404) {
        // Handle not found
        showNotFound();
      } else {
        // Generic error
        showError(error.message);
      }
    }
  }
};
```

### Backend Error Handling

Backend automatically returns standardized errors:

```typescript
// In dispatcher
if (!validation.success) {
  return NextResponse.json(
    { message: 'Validation failed', errors: validation.errors },
    { status: 400 }
  );
}
```

---

## Token Management

### Storage

```typescript
// Store tokens after login
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// Retrieve tokens
const accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');

// Clear tokens on logout
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
```

### Automatic Token Refresh

```typescript
// In API client interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { accessToken } = await refreshAccessToken({ refreshToken });
          localStorage.setItem('accessToken', accessToken);
          // Retry original request
          return api.request(error.config);
        } catch {
          // Refresh failed - redirect to login
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

---

## File Upload/Download

### Upload

```typescript
// Frontend
const formData = new FormData();
formData.append('document', file);
formData.append('recordId', recordId.toString());

const result = await apiClient.upload(`/emr/${recordId}/documents`, formData);
```

### Download

```typescript
// Frontend
const blob = await apiClient.download(`/discharge/discharge-summary/${summaryId}/pdf`);

// Create download link
const url = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = `discharge_summary_${summaryId}.pdf`;
link.click();
window.URL.revokeObjectURL(url);
```

---

## Pagination

### Backend Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Frontend Usage

```typescript
const { data, pagination } = await appointmentService.getAppointmentsByStatus(
  'SCHEDULED',
  { page: 1, limit: 10 }
);

console.log(`Showing ${data.length} of ${pagination.total} appointments`);
console.log(`Page ${pagination.page} of ${pagination.totalPages}`);
```

---

## Best Practices

### 1. Always Use Type-Safe Clients

```typescript
// ✅ Good
const user = await apiClient.get<User>('/profile/me');

// ❌ Bad - no type safety
const user = await api.get('/profile/me');
```

### 2. Handle Errors Gracefully

```typescript
// ✅ Good
try {
  await authService.login(credentials);
} catch (error) {
  if (error instanceof ApiError) {
    showFieldErrors(error.errors);
  }
}

// ❌ Bad - no error handling
await authService.login(credentials);
```

### 3. Validate Before Sending

```typescript
// ✅ Good - validate client-side first
const validation = schema.safeParse(data);
if (!validation.success) {
  showErrors(validation.errors);
  return;
}
await apiClient.post('/endpoint', validation.data);

// ❌ Bad - rely only on backend validation
await apiClient.post('/endpoint', data);
```

### 4. Use Service Layer

```typescript
// ✅ Good - use service
await appointmentService.bookAppointment(payload);

// ❌ Bad - direct API calls in components
await apiClient.post('/appointments', payload);
```

### 5. Handle Loading States

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (data: FormData) => {
  setLoading(true);
  setError(null);
  
  try {
    await authService.register(data);
    // Success
  } catch (err) {
    setError(err instanceof ApiError ? err.message : 'An error occurred');
  } finally {
    setLoading(false);
  }
};
```

---

## Testing

### Mock API Responses

```typescript
// In tests
import { apiClient } from '@/utils/api-client';

jest.mock('@/utils/api-client', () => ({
  apiClient: {
    post: jest.fn().mockResolvedValue({
      success: true,
      data: { user: { id: 1, email: 'test@example.com' } },
      timestamp: new Date().toISOString(),
    }),
  },
}));
```

### Test Validation Errors

```typescript
it('should handle validation errors', async () => {
  apiClient.post.mockRejectedValueOnce(
    new ApiError('Validation failed', 400, [
      { field: 'email', message: 'Invalid email' },
    ])
  );

  await expect(authService.register(invalidData)).rejects.toThrow(ApiError);
});
```

---

## Migration Checklist

### For New Endpoints

- [ ] Create backend route handler
- [ ] Create validation schema
- [ ] Create/update service types
- [ ] Create/update frontend service
- [ ] Update API documentation
- [ ] Add OpenAPI spec
- [ ] Test with frontend

### For Existing Endpoints

- [ ] Verify response format matches standard
- [ ] Check type alignment
- [ ] Update frontend service if needed
- [ ] Test error handling
- [ ] Update documentation

---

## Support

For questions about API alignment:
- Check `API_DOCUMENTATION.md` in backend
- Check `openapi.yaml` for OpenAPI spec
- Review type definitions in both frontend and backend
- Contact the development team

---

**Last Updated:** 2026-04-03  
**Version:** 1.0.0
