// nhms-frontend/src/app/(authenticated)/recordstaff/appointments/view/__tests__/page.test.tsx

import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecordStaffAppointmentsPage from '../page';
import { AuthContext } from '@/contexts/AuthContext';
import * as AppointmentService from '@/services/appointmentService';
import * as UserService from '@/services/userService';

// Mock the AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      user_id: 1,
      roles: ['RecordStaff'],
      patient_id: null,
      profile: { email: 'recordstaff@example.com' },
    },
    loading: false,
  }),
}));

// Mock service functions
jest.mock('@/services/appointmentService');
jest.mock('@/services/userService');

const mockAllAppointments = [
  {
    id: 1,
    patientFirstName: 'John',
    patientLastName: 'Doe',
    serviceType: 'General Consultation',
    doctor: { id: '101', fullName: 'Dr. Smith' },
    department: { id: 1, name: 'General Medicine' },
    appointmentDateTime: '2026-03-01T10:00:00Z',
    status: 'Scheduled',
  },
  {
    id: 2,
    patientFirstName: 'Jane',
    patientLastName: 'Smith',
    serviceType: 'Pediatric Checkup',
    doctor: null, // No doctor assigned yet
    department: { id: 2, name: 'Pediatrics' },
    appointmentDateTime: '2026-03-02T11:00:00Z',
    status: 'Pending',
  },
];

const mockUnassignedAppointments = [
  {
    id: 2,
    patientFirstName: 'Jane',
    patientLastName: 'Smith',
    serviceType: 'Pediatric Checkup',
    doctor: null, // No doctor assigned yet
    department: { id: 2, name: 'Pediatrics' },
    appointmentDateTime: '2026-03-02T11:00:00Z',
    status: 'Pending',
  },
  {
    id: 3,
    patientFirstName: 'Peter',
    patientLastName: 'Jones',
    serviceType: 'Dental Checkup',
    doctor: null,
    department: { id: 3, name: 'Dentistry' },
    appointmentDateTime: '2026-03-03T12:00:00Z',
    status: 'Scheduled',
  },
];

const mockDoctors = [
  { id: '101', fullName: 'Dr. Smith' },
  { id: '102', fullName: 'Dr. Johnson' },
  { id: '103', fullName: 'Dr. Williams' },
];

describe('RecordStaffAppointmentsPage', () => {
  beforeEach(() => {
    (AppointmentService.getAllAppointmentsForRecordStaff as jest.Mock).mockResolvedValue(mockAllAppointments);
    (AppointmentService.getUnassignedAppointmentsForRecordStaff as jest.Mock).mockResolvedValue(mockUnassignedAppointments);
    (UserService.searchDoctors as jest.Mock).mockImplementation((searchTerm: string) => {
      if (!searchTerm) return [];
      return mockDoctors.filter(d => d.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    });
    (AppointmentService.assignDoctorToAppointment as jest.Mock).mockResolvedValue(undefined);
  });

  it('renders both tabs and displays all appointments by default', async () => {
    await act(async () => {
      render(<RecordStaffAppointmentsPage />);
    });

    // Verify tabs are present
    expect(screen.getByRole('tab', { name: /all appointments/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /unassigned appointments/i })).toBeInTheDocument();

    // Verify "All Appointments" content is displayed by default
    expect(screen.getByText('All Appointments')).toBeInTheDocument(); // Title inside the component
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    
    // Verify assignment status for John Doe (assigned)
    const johnDoeRow = screen.getByText('John Doe').closest('.MuiDataGrid-row');
    expect(johnDoeRow).toHaveTextContent('Assigned');

    // Verify assignment status for Jane Smith (unassigned)
    const janeSmithRow = screen.getByText('Jane Smith').closest('.MuiDataGrid-row');
    expect(janeSmithRow).toHaveTextContent('Unassigned');

    // "Unassigned Appointments" content should not be visible initially
    expect(screen.queryByText('Unassigned Appointments')).not.toBeVisible();
  });

  it('switches to unassigned appointments tab and allows doctor assignment', async () => {
    await act(async () => {
      render(<RecordStaffAppointmentsPage />);
    });

    // Click on "Unassigned Appointments" tab
    const unassignedTab = screen.getByRole('tab', { name: /unassigned appointments/i });
    await act(async () => {
      fireEvent.click(unassignedTab);
    });

    // Verify "Unassigned Appointments" content is displayed
    expect(screen.getByText('Unassigned Appointments')).toBeInTheDocument(); // Title inside the component
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Peter Jones')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Assign' })).toHaveLength(2);


    // Simulate assigning a doctor to an unassigned appointment (Jane Smith)
    const assignButtons = screen.getAllByRole('button', { name: 'Assign' });
    const janeSmithRow = assignButtons[0].closest('.MuiDataGrid-row'); // Assuming first button is for Jane Smith
    
    expect(janeSmithRow).toBeInTheDocument();

    if (janeSmithRow) {
      const searchDoctorInput = janeSmithRow.querySelector('input[aria-label="Search Doctor"]');
      expect(searchDoctorInput).toBeInTheDocument();

      await act(async () => {
        fireEvent.change(searchDoctorInput!, { target: { value: 'Dr. Will' } });
      });

      await waitFor(() => expect(screen.getByText('Dr. Williams')).toBeInTheDocument());

      await act(async () => {
        fireEvent.click(screen.getByText('Dr. Williams'));
      });

      await act(async () => {
        fireEvent.click(assignButtons[0]);
      });

      // Verify assignDoctorToAppointment was called
      expect(AppointmentService.assignDoctorToAppointment).toHaveBeenCalledWith(
        mockUnassignedAppointments[0].id,
        '103'
      );

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText('Doctor assigned successfully!')).toBeInTheDocument();
      });
    }
  });

  it('displays error if all appointments fail to load', async () => {
    (AppointmentService.getAllAppointmentsForRecordStaff as jest.Mock).mockRejectedValue(new Error('All Appointments API Error'));

    await act(async () => {
      render(<RecordStaffAppointmentsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch appointments.')).toBeInTheDocument();
    });
  });

  it('displays error if unassigned appointments fail to load', async () => {
    (AppointmentService.getUnassignedAppointmentsForRecordStaff as jest.Mock).mockRejectedValue(new Error('Unassigned Appointments API Error'));

    await act(async () => {
      render(<RecordStaffAppointmentsPage />);
    });

    // Click on "Unassigned Appointments" tab
    const unassignedTab = screen.getByRole('tab', { name: /unassigned appointments/i });
    await act(async () => {
      fireEvent.click(unassignedTab);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch unassigned appointments.')).toBeInTheDocument();
    });
  });

  it('displays error if doctor assignment fails on unassigned tab', async () => {
    (AppointmentService.assignDoctorToAppointment as jest.Mock).mockRejectedValue(new Error('Assignment Error'));

    await act(async () => {
      render(<RecordStaffAppointmentsPage />);
    });

    // Click on "Unassigned Appointments" tab
    const unassignedTab = screen.getByRole('tab', { name: /unassigned appointments/i });
    await act(async () => {
      fireEvent.click(unassignedTab);
    });

    // Simulate assigning a doctor
    const assignButtons = screen.getAllByRole('button', { name: 'Assign' });
    const janeSmithRow = assignButtons[0].closest('.MuiDataGrid-row'); // Assuming first button is for Jane Smith
    
    expect(janeSmithRow).toBeInTheDocument();

    if (janeSmithRow) {
      const searchDoctorInput = janeSmithRow.querySelector('input[aria-label="Search Doctor"]');
      expect(searchDoctorInput).toBeInTheDocument();

      await act(async () => {
        fireEvent.change(searchDoctorInput!, { target: { value: 'Dr. John' } });
      });

      await waitFor(() => expect(screen.getByText('Dr. Johnson')).toBeInTheDocument());

      await act(async () => {
        fireEvent.click(screen.getByText('Dr. Johnson'));
      });

      await act(async () => {
        fireEvent.click(assignButtons[0]);
      });

      // Verify error message
      await waitFor(() => {
        expect(screen.getByText('Failed to assign doctor.')).toBeInTheDocument();
      });
    }
  });
});
