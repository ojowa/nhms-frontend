import api from '../utils/api';
import axios from 'axios';
import {
  LabTestVolume,
  LabTurnaroundTime,
  LabResultDistribution,
  LabStaffPerformance,
} from '../types/labResult'; // Assuming types are defined here

const isNotFound = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 404;

// Function to fetch lab test volumes
export const getLabTestVolumes = async (
  startDate: string,
  endDate: string,
  interval: string,
  testType: string | null,
  departmentId: number | null
): Promise<LabTestVolume[]> => {
  try {
    const response = await api.get('/lab/analytics/test-volumes', {
      params: {
        startDate,
        endDate,
        interval,
        testType,
        departmentId,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (isNotFound(error)) {
      return [];
    }
    throw error;
  }
};

// Function to fetch lab turnaround times
export const getLabTurnaroundTimes = async (
  startDate: string,
  endDate: string,
  testType: string | null,
  departmentId: number | null
): Promise<LabTurnaroundTime[]> => {
  try {
    const response = await api.get('/lab/analytics/turnaround-times', {
      params: {
        startDate,
        endDate,
        testType,
        departmentId,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (isNotFound(error)) {
      return [];
    }
    throw error;
  }
};

// Function to fetch lab result distribution
export const getLabResultDistribution = async (
  startDate: string,
  endDate: string,
  testType: string | null,
  departmentId: number | null
): Promise<LabResultDistribution[]> => {
  try {
    const response = await api.get('/lab/analytics/result-distribution', {
      params: {
        startDate,
        endDate,
        testType,
        departmentId,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (isNotFound(error)) {
      return [];
    }
    throw error;
  }
};

// Function to fetch lab staff performance metrics
export const getLabStaffPerformanceMetrics = async (
  startDate: string,
  endDate: string,
  testType: string | null
): Promise<LabStaffPerformance[]> => {
  try {
    const response = await api.get('/lab/analytics/performance-metrics', {
      params: {
        startDate,
        endDate,
        testType,
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (isNotFound(error)) {
      return [];
    }
    throw error;
  }
};
