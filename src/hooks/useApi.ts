/**
 * React Query Hooks
 * Type-safe data fetching hooks using @tanstack/react-query
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';

// ============ Auth Hooks ============

import * as authService from '@/services/authService';
import * as userAdminService from '@/services/userAdminService';
import type { LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest } from '@/types/auth';
import type { Document as EmrDocument } from '@/types/emr';

export const useLogin = (options?: UseMutationOptions<any, Error, LoginRequest>) => {
  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    ...options,
  });
};

export const useRegister = (options?: UseMutationOptions<any, Error, RegisterRequest>) => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    ...options,
  });
};

export const useForgotPassword = (options?: UseMutationOptions<any, Error, ForgotPasswordRequest>) => {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authService.requestPasswordReset(data),
    ...options,
  });
};

export const useResetPassword = (options?: UseMutationOptions<any, Error, ResetPasswordRequest>) => {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
    ...options,
  });
};

export const useAdminResetPassword = (options?: UseMutationOptions<any, Error, { userId: number; newPassword: string }>) => {
  return useMutation({
    mutationFn: ({ userId, newPassword }: { userId: number; newPassword: string }) => userAdminService.resetPassword(userId, newPassword),
    ...options,
  });
};

export const useLoggedInUsers = (options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['loggedInUsers'],
    queryFn: () => userAdminService.getLoggedInUsers(),
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
};

export const useDeleteUser = (options?: UseMutationOptions<void, Error, number>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: number) => userAdminService.deleteUser(userId),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useLogout = (options?: UseMutationOptions<void, Error, void>) => {
  return useMutation({
    mutationFn: async () => { await authService.logout(); },
    ...options,
  });
};

export const useGetCurrentUser = (options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// ============ Appointment Hooks ============

import * as appointmentService from '@/services/appointmentService';
import type { AppointmentStatus, AppointmentType, GetAppointmentsParams } from '@/types/appointment';

export const useAppointments = (
  status: AppointmentStatus | string,
  params?: Omit<GetAppointmentsParams, 'status'>,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['appointments', status, params],
    queryFn: () => appointmentService.getAppointmentsByStatus(status, params),
    enabled: options?.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCombinedAppointments = (
  params?: GetAppointmentsParams,
  options?: UseQueryOptions<any, Error>
) => {
  return useQuery({
    queryKey: ['combinedAppointments', params],
    queryFn: () => appointmentService.getCombinedAppointments(params),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

export const useAppointment = (appointmentId: number, options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => appointmentService.getAppointment(appointmentId),
    enabled: !!appointmentId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useBookAppointment = (options?: UseMutationOptions<any, Error, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: any) => appointmentService.bookAppointment(payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      // Invalidate appointments queries
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['combinedAppointments'] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useUpdateAppointmentStatus = (options?: UseMutationOptions<any, Error, { appointmentId: number; payload: any }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ appointmentId, payload }: { appointmentId: number; payload: any }) =>
      appointmentService.updateAppointmentStatus(appointmentId, payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useAssignDoctorToAppointment = (options?: UseMutationOptions<any, Error, { appointmentId: number; payload: any }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ appointmentId, payload }: { appointmentId: number; payload: any }) =>
      appointmentService.assignDoctorToAppointment(appointmentId, payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

// ============ Patient Hooks ============

import { searchPatients } from '@/services/patientService';

export const usePatientSearch = (searchTerm: string, options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['patients', 'search', searchTerm],
    queryFn: () => searchPatients(searchTerm),
    enabled: searchTerm.length >= 2, // Only search if at least 2 characters
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};

// ============ EMR Hooks ============

import * as emrService from '@/services/emrService';
import type { Prescription } from '@/types/emr';

export const useMedicalRecords = (params?: { page?: number; pageSize?: number; patientId?: number; doctorId?: number }, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['medicalRecords', params],
    queryFn: () => emrService.getMedicalRecords(),
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMedicalRecord = (recordId: number, options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['medicalRecord', recordId],
    queryFn: () => emrService.getMedicalRecordById(recordId),
    enabled: !!recordId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateMedicalRecord = (options?: UseMutationOptions<any, Error, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: any) => emrService.createMedicalRecord(payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecords'] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useAddDiagnosis = (options?: UseMutationOptions<any, Error, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: any) => emrService.addDiagnosisToMedicalRecord(payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecord'] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useAddPrescription = (options?: UseMutationOptions<any, Error, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: any) => emrService.addPrescriptionToMedicalRecord(payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecord'] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useUploadDocument = (options?: UseMutationOptions<EmrDocument, Error, { recordId: number; file: File }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ recordId, file }: { recordId: number; file: File }) =>
      emrService.uploadDocument(recordId, file),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecords'] });
      queryClient.invalidateQueries({ queryKey: ['medicalRecord', variables.recordId] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useGetDocumentUrl = (options?: UseMutationOptions<{ url: string; fileName: string }, Error, number>) => {
  return useMutation({
    mutationFn: (documentId: number) => emrService.getDocumentUrl(documentId),
    ...options,
  });
};

export const useICD10Search = (searchTerm: string, options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['icd10', searchTerm],
    queryFn: () => emrService.searchIcd10Codes(searchTerm),
    enabled: searchTerm.length >= 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const usePrescriptionsByAdmission = (
  params: { patientId: number; admissionId: number },
  options?: Omit<UseQueryOptions<Prescription[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Prescription[]>({
    queryKey: ['prescriptions', 'admission', params.admissionId],
    queryFn: () => emrService.getPrescriptionsByPatientIdAndAdmissionId(params.patientId, params.admissionId),
    enabled: !!params.patientId && !!params.admissionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// ============ Pharmacy Hooks ============

import * as pharmacyService from '@/services/pharmacyService';

export const useFormulary = (query?: string, options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['formulary', query],
    queryFn: () => pharmacyService.searchFormulary(query),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useInventory = (query?: string, options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['inventory', query],
    queryFn: () => pharmacyService.getInventory(query),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

export const usePendingPrescriptions = (options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['pendingPrescriptions'],
    queryFn: () => pharmacyService.getPendingPrescriptions(),
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

export const useDispenseMedication = (options?: UseMutationOptions<any, Error, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: any) => pharmacyService.dispenseMedication(payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['pendingPrescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

// ============ Admission Hooks ============

import { admissionService, getAdmittedPatients } from '@/services/admissionService';
import type { Admission } from '@/types/admission';

export const useAdmittedPatients = (options?: Omit<UseQueryOptions<Admission[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: ['admittedPatients'],
    queryFn: () => getAdmittedPatients(),
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

export const useAdmission = (admissionId: string, options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['admission', admissionId],
    queryFn: () => admissionService.getAdmissionById(admissionId),
    enabled: !!admissionId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateAdmission = (options?: UseMutationOptions<any, Error, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: any) => admissionService.createAdmission(payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['admittedPatients'] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

// ============ Department Hooks ============

import * as departmentService from '@/services/departmentService';

export const useDepartments = (page: number, limit: number, searchTerm: string = '', options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['departments', page, limit, searchTerm],
    queryFn: () => departmentService.getDepartments(page, limit, searchTerm),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useAllDepartments = (options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['allDepartments'],
    queryFn: () => departmentService.fetchAllDepartments(),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useCreateDepartment = (options?: UseMutationOptions<any, Error, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: any) => departmentService.createDepartment(payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['allDepartments'] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useUpdateDepartment = (options?: UseMutationOptions<any, Error, { id: number; data: any }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => departmentService.updateDepartment(id, data),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['allDepartments'] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useDeleteDepartment = (options?: UseMutationOptions<string, Error, number>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => departmentService.deleteDepartment(id),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['allDepartments'] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

// ============ Notification Hooks ============

import * as notificationService from '@/services/notificationService';

export const useUnreadNotifications = (options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: () => notificationService.getUnreadNotifications(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    ...options,
  });
};

export const useMarkNotificationAsRead = (options?: UseMutationOptions<void, Error, number>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: number) => notificationService.markNotificationAsRead(notificationId),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

// ============ User Profile Hooks ============

import * as userProfileService from '@/services/userProfileService';

export const useUserProfile = (userId: number, options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => userProfileService.getUserProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useDoctors = (options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: () => userProfileService.getDoctors(),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useUpdateUserProfile = (options?: UseMutationOptions<any, Error, { userId: number; data: any }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: any }) =>
      userProfileService.updateUserProfile(userId, data),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

// ============ Family Hooks ============

import * as familyService from '@/services/familyService';

export const useFamilyMembers = (options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => familyService.getFamilyMembersByOfficerId(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useAddFamilyMember = (options?: UseMutationOptions<any, Error, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: any) => familyService.addFamilyMember(0, payload), // officerUserId will be set by service
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['familyMembers'] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

// ============ Bed Management Hooks ============

import * as bedManagementService from '@/services/bedManagementService';

export const useWards = (options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['wards'],
    queryFn: () => bedManagementService.getWards(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useBedsInWard = (wardId: number, status?: any, options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['beds', wardId, status],
    queryFn: () => bedManagementService.getBedsInWard(wardId, status),
    enabled: !!wardId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

export const usePendingAdmissions = (options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['pendingAdmissions'],
    queryFn: () => bedManagementService.getPendingAdmissions(),
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

export const useAssignBed = (options?: UseMutationOptions<any, Error, { admissionId: number; bedId: number }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ admissionId, bedId }: { admissionId: number; bedId: number }) =>
      bedManagementService.assignBed(admissionId, bedId),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['pendingAdmissions'] });
      queryClient.invalidateQueries({ queryKey: ['beds'] });
      queryClient.invalidateQueries({ queryKey: ['wards'] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

// ============ Lab Hooks ============

import * as labService from '@/services/labService';

export const usePendingLabRequests = (doctorId: number, options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['pendingLabRequests', doctorId],
    queryFn: () => labService.getPendingLabRequestsForDoctor(doctorId),
    enabled: !!doctorId,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

export const useCreateLabRequest = (options?: UseMutationOptions<any, Error, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: any) => labService.createLabRequest(payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['pendingLabRequests'] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

// ============ Vitals Hooks ============

import * as vitalsService from '@/services/vitalsService';

export const useVitalSignsByAppointment = (appointmentId: number, options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['vitals', 'appointment', appointmentId],
    queryFn: () => vitalsService.getVitalSignsByAppointmentId(appointmentId),
    enabled: !!appointmentId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateVitalSign = (options?: UseMutationOptions<any, Error, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: any) => vitalsService.createVitalSign(payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['vitals'] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

// ============ Consultation Hooks ============

import * as consultationService from '@/services/consultationService';

export const useConsultations = (options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['consultations'],
    queryFn: () => consultationService.getConsultations(),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

export const useConsultation = (sessionId: string, options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['consultation', sessionId],
    queryFn: () => consultationService.getConsultationById(sessionId),
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useSaveConsultationNotes = (options?: UseMutationOptions<void, Error, { sessionId: string; doctorId: number; notesContent: string }>) => {
  return useMutation({
    mutationFn: ({ sessionId, doctorId, notesContent }: { sessionId: string; doctorId: number; notesContent: string }) =>
      consultationService.saveConsultationNotes(sessionId, doctorId, notesContent),
    ...options,
  });
};

// ============ Discharge Hooks ============

import * as dischargeService from '@/services/dischargeService';

export const useCreateDischargeSummary = (options?: UseMutationOptions<any, Error, any>) => {
  return useMutation({
    mutationFn: (payload: any) => dischargeService.createDischargeSummary(payload),
    ...options,
  });
};

export const useDischargePatient = (options?: UseMutationOptions<any, Error, number>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (admissionId: number) => dischargeService.dischargePatient(admissionId),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['admittedPatients'] });
      queryClient.invalidateQueries({ queryKey: ['admission', variables] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

// ============ Medication Administration Hooks ============

import { medicationAdministrationService } from '@/services/medicationAdministrationService';

export const useMedicationAdministrations = (
  filters: any,
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['medicationAdministrations', filters],
    queryFn: () => medicationAdministrationService.getMedicationAdministrations(filters),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

export const usePendingMedicationAdministrations = (nurseId: number, options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['pendingMedicationAdministrations', nurseId],
    queryFn: () => medicationAdministrationService.getPendingMedicationAdministrationsForNurse(nurseId),
    enabled: !!nurseId,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

export const useCreateMedicationAdministration = (options?: UseMutationOptions<any, Error, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: any) => medicationAdministrationService.createMedicationAdministration(payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['medicationAdministrations'] });
      queryClient.invalidateQueries({ queryKey: ['pendingMedicationAdministrations'] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

// ============ Admin Hooks ============

export const useUsers = (params?: { page?: number; limit?: number; searchTerm?: string; role?: string; includeInactive?: boolean }, options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userAdminService.getAllUsers(params?.page, params?.limit, params?.searchTerm, params?.role, params?.includeInactive),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

export const useRoles = (params?: { page?: number; limit?: number; searchTerm?: string }, options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => userAdminService.getAllRoles(params?.page, params?.limit, params?.searchTerm),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateUser = (options?: UseMutationOptions<any, Error, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: any) => userAdminService.createUser(payload),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};

export const useUpdateUserRoles = (options?: UseMutationOptions<any, Error, { userId: number; roles: string[] }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, roles }: { userId: number; roles: string[] }) =>
      userAdminService.updateUserRoles(userId, roles),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
};
