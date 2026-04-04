// src/app/(authenticated)/nurse/vitals/[appointmentId]/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { Appointment } from '@/types/appointment';
import { CreateVitalSignPayload } from '@/types/vitals';
import { getAppointment } from '@/services/appointmentService';
import { createVitalSign } from '@/services/vitalsService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const VitalsInputPage = () => {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.appointmentId as string;
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vital Signs State
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState<number | ''>('');
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState<number | ''>('');
  const [temperature, setTemperature] = useState<number | ''>('');
  const [pulseRate, setPulseRate] = useState<number | ''>('');
  const [respirationRate, setRespirationRate] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [spo2, setSpo2] = useState<number | ''>('');

  useEffect(() => {
    const loadAppointment = async () => {
      if (!appointmentId) return;

      try {
        const appointmentData = await getAppointment(Number(appointmentId));
        setAppointment(appointmentData);
      } catch (err: any) {
        console.error('Failed to load appointment:', err);
        setError(err.message || 'Failed to load appointment details.');
        showSnackbar(err.message || 'Failed to load data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadAppointment();
  }, [appointmentId, showSnackbar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.userId || !appointment) {
      showSnackbar('User or appointment data is missing.', 'error');
      return;
    }

    // Basic validation
    if (!bloodPressureSystolic || !bloodPressureDiastolic || !temperature || !pulseRate || !respirationRate) {
      showSnackbar('Please fill in all required vital sign fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      const vitalsPayload: CreateVitalSignPayload = {
        patientId: appointment.patientId,
        appointmentId: Number(appointmentId),
        nurseUserId: user.userId,
        bloodPressureSystolic: Number(bloodPressureSystolic),
        bloodPressureDiastolic: Number(bloodPressureDiastolic),
        temperature: Number(temperature),
        pulseRate: Number(pulseRate),
        respirationRate: Number(respirationRate),
        weight: weight === '' ? undefined : Number(weight),
        height: height === '' ? undefined : Number(height),
        spo2: spo2 === '' ? undefined : Number(spo2),
        creatingUserId: user.userId,
      };

      // 1. Create Vital Sign
      await createVitalSign(vitalsPayload);

      showSnackbar('Vital signs recorded successfully.', 'success');
      router.push('/nurse/vitals'); // Redirect to nurse vitals queue
    } catch (err: any) {
      console.error('Failed to record vitals or update appointment:', err);
      showSnackbar(err.message || 'Failed to complete action.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user || (!user.roles.includes(UserRole.Admin) && !user.roles.includes(UserRole.Nurse))) {
    router.push('/dashboard'); // Redirect if not authorized
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Record Vital Signs</CardTitle>
          <CardDescription>
            Appointment ID: {appointment?.id} | Patient: {appointment?.patientFirstName} {appointment?.patientLastName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Blood Pressure */}
              <div className="grid gap-2">
                <Label htmlFor="bloodPressureSystolic">Blood Pressure (Systolic)</Label>
                <Input
                  id="bloodPressureSystolic"
                  type="number"
                  value={bloodPressureSystolic}
                  onChange={(e) => setBloodPressureSystolic(Number(e.target.value))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bloodPressureDiastolic">Blood Pressure (Diastolic)</Label>
                <Input
                  id="bloodPressureDiastolic"
                  type="number"
                  value={bloodPressureDiastolic}
                  onChange={(e) => setBloodPressureDiastolic(Number(e.target.value))}
                  required
                />
              </div>

              {/* Temperature */}
              <div className="grid gap-2">
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  required
                />
              </div>

              {/* Pulse Rate */}
              <div className="grid gap-2">
                <Label htmlFor="pulseRate">Pulse Rate (bpm)</Label>
                <Input
                  id="pulseRate"
                  type="number"
                  value={pulseRate}
                  onChange={(e) => setPulseRate(Number(e.target.value))}
                  required
                />
              </div>

              {/* Respiration Rate */}
              <div className="grid gap-2">
                <Label htmlFor="respirationRate">Respiration Rate (breaths/min)</Label>
                <Input
                  id="respirationRate"
                  type="number"
                  value={respirationRate}
                  onChange={(e) => setRespirationRate(Number(e.target.value))}
                  required
                />
              </div>

              {/* Weight */}
              <div className="grid gap-2">
                <Label htmlFor="weight">Weight (kg) (Optional)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                />
              </div>

              {/* Height */}
              <div className="grid gap-2">
                <Label htmlFor="height">Height (cm) (Optional)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                />
              </div>

              {/* SpO2 */}
              <div className="grid gap-2">
                <Label htmlFor="spo2">SpO2 (%) (Optional)</Label>
                <Input
                  id="spo2"
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Submitting Vitals...' : 'Submit Vitals'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VitalsInputPage;
