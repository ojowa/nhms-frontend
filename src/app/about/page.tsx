import Link from 'next/link';
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="text-lg font-semibold text-emerald-800">Nigeria Immigration Service</div>
            <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-700">
              <Link href="/" className="hover:text-emerald-700">
                Home
              </Link>
              <Link href="/about" className="text-emerald-700">
                About
              </Link>
              <Link href="/login" className="rounded-md bg-emerald-700 px-3 py-1.5 text-white hover:bg-emerald-800">
                Login
              </Link>
              <Link href="/patient-login" className="rounded-md bg-emerald-700 px-3 py-1.5 text-white hover:bg-emerald-800">
                Patient Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-4xl font-bold text-center text-blue-800 mb-8">About NHMS</h1>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">Nigeria Immigration Service (NIS)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Nigeria Immigration Service (NIS) is a key federal government agency responsible for border security,
              migration management, and national identity documentation. Its mandate includes ensuring the integrity
              of Nigeria&apos;s borders, controlling entry and exit of persons, and issuing travel documents and resident permits.
              The NIS plays a crucial role in national security and economic development by regulating immigration activities
              and contributing to global security efforts.
            </p>
            <p className="text-gray-700 leading-relaxed">
              For more detailed and up-to-date information, please refer to the official Nigeria Immigration Service website.
              (Specific details about NIS operations and history would typically be sourced from official NIS publications.)
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">Healthcare Services via NHMS</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              The NIS Healthcare Management System (NHMS) is an internal, dedicated platform designed to provide
              comprehensive and secure medical services to NIS officers, staff, their registered family members,
              and other authorized patients. Built with modern technology and strict adherence to privacy standards,
              NHMS aims to ensure efficient and high-quality healthcare delivery.
            </p>

            <h3 className="text-xl font-medium text-blue-600 mb-3">Key Services Offered:</h3>
            <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
              <li>
                <strong>Telemedicine Consultations:</strong> Connect with healthcare professionals remotely through
                secure video, audio, and chat functionalities, ensuring timely access to medical advice and support.
              </li>
              <li>
                <strong>Electronic Medical Records (EMR):</strong> Securely manage and access patient medical histories,
                diagnoses, treatments, and prescriptions, leading to better coordinated care.
              </li>
              <li>
                <strong>Appointment Management:</strong> Easily book, view, and manage medical appointments with various
                departments and specialists within the NIS healthcare network.
              </li>
              <li>
                <strong>Lab Services:</strong> Facilitate lab test requests, track their status, and securely
                access lab results.
              </li>
              <li>
                <strong>Medication Administration & Prescriptions:</strong> Efficiently manage medication records,
                prescriptions, and administration details for comprehensive patient care.
              </li>
              <li>
                <strong>Vital Signs Tracking:</strong> Record and monitor essential patient vital signs, assisting
                healthcare providers in assessing and tracking patient health.
              </li>
              <li>
                <strong>Family Member Management:</strong> Officers can manage the healthcare profiles and appointments
                of their registered family members/dependents.
              </li>
              <li>
                <strong>Administrative & Reporting Tools:</strong> Empower healthcare administrators with tools for
                user management, departmental oversight, and generating essential healthcare reports.
              </li>
            </ul>

            <p className="text-gray-700 leading-relaxed mt-6">
              NHMS is committed to safeguarding patient data through robust security measures, including
              Role-Based Access Control (RBAC) and Row-Level Security (RLS), ensuring that healthcare information
              remains confidential and accessible only to authorized personnel.
            </p>
          </section>
        </div>
      </main>

      <footer className="bg-emerald-900 py-4 text-center text-sm text-white">
        <p>&copy; {new Date().getFullYear()} Nigeria Immigration Service - Healthcare Management Service</p>
      </footer>
    </div>
  );
};

export default AboutPage;
