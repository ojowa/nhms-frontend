import { User } from "@/types/auth";

export const getDashboardPath = (user: User | null): string => {
  if (!user) {
    return "/";
  }

  const role = user.roles?.[0]; // Assuming the first role is the primary one

  switch (role) {
    case "Admin":
      return "/admin/dashboard";
    case "Doctor":
      return "/doctor/dashboard";
    case "Patient":
      return "/patient/dashboard";
    case "Officer":
      return "/officer/dashboard";
    case "LabStaff":
      return "/LabStaff/dashboard";
    case "RecordStaff":
      return "/recordstaff/dashboard";
    case "FamilyMember":
      return "/familymember/dashboard";
    case "Nurse":
      return "/nurse/dashboard";
    case "Pharmacist":
      return "/pharmacist/dashboard";
    default:
      return "/";
  }
};
