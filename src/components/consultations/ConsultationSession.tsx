
import React from 'react';
import { Button } from '@/components/ui/button';
import { admissionService } from '@/services/admissionService';

interface ConsultationSessionProps {
  patientId: number;
  // TODO: Add other props like doctorId, consultationId, etc.
}

export const ConsultationSession: React.FC<ConsultationSessionProps> = ({ patientId }) => {
  const handleAdmitPatient = async () => {
    try {
      // TODO: Get doctorId and departmentId from component state or props
      const admittingDoctorId = 1; // Replace with actual doctor ID
      const departmentId = 1; // Replace with actual department ID

      await admissionService.createAdmission({
        patientId: String(patientId),
        admittingDoctorId,
        departmentId,
      });
      // TODO: Add success notification
      alert('Patient admitted successfully');
    } catch (error) {
      // TODO: Add error notification
      alert('Failed to admit patient');
      console.error(error);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Consultation Session</h2>
      {/* Other consultation details go here */}
      <Button onClick={handleAdmitPatient}>Admit Patient</Button>
    </div>
  );
};
