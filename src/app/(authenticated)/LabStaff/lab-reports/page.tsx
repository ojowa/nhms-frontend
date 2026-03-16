'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { addDays, subDays, format } from 'date-fns';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import {
  getLabTestVolumes,
  getLabTurnaroundTimes,
  getLabResultDistribution,
  getLabStaffPerformanceMetrics,
} from '@/services/labAnalyticsService'; // Assuming this service will be created
import {
  LabTestVolume,
  LabTurnaroundTime,
  LabResultDistribution,
  LabStaffPerformance,
} from '@/types/labResult'; // Assuming types are in labResult.ts or a new analytics.ts
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';

const LabReportsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<Date | null>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [testTypeFilter, setTestTypeFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<number | ''>(''); // Assuming department IDs are numbers

  const [testVolumes, setTestVolumes] = useState<LabTestVolume[]>([]);
  const [turnaroundTimes, setTurnaroundTimes] = useState<LabTurnaroundTime[]>([]);
  const [resultDistribution, setResultDistribution] = useState<LabResultDistribution[]>([]);
  const [staffPerformance, setStaffPerformance] = useState<LabStaffPerformance[]>([]);

  // Dummy data for department and test types for filters - replace with actual API calls
  const [departments, setDepartments] = useState([{ id: 1, name: 'Pathology' }, { id: 2, name: 'Microbiology' }]);
  const [testTypes, setTestTypes] = useState(['Blood Test', 'Urine Test', 'X-Ray']);


  const fetchReportData = useCallback(async () => {
    if (!user || !startDate || !endDate) return;

    setLoading(true);
    setError(null);

    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');

    try {
      // Fetch Test Volumes
      const volumes = await getLabTestVolumes(
        formattedStartDate,
        formattedEndDate,
        'monthly', // Example interval
        testTypeFilter || null,
        departmentFilter || null
      );
      setTestVolumes(volumes);

      // Fetch Turnaround Times
      const tat = await getLabTurnaroundTimes(
        formattedStartDate,
        formattedEndDate,
        testTypeFilter || null,
        departmentFilter || null
      );
      setTurnaroundTimes(tat);

      // Fetch Result Distribution
      const distribution = await getLabResultDistribution(
        formattedStartDate,
        formattedEndDate,
        testTypeFilter || null,
        departmentFilter || null
      );
      setResultDistribution(distribution);

      // Fetch Staff Performance
      const performance = await getLabStaffPerformanceMetrics(
        formattedStartDate,
        formattedEndDate,
        testTypeFilter || null
      );
      setStaffPerformance(performance);

    } catch (err: any) {
      console.error('Error fetching lab report data:', err);
      setError(err.response?.data?.message || 'Failed to fetch report data.');
    } finally {
      setLoading(false);
    }
  }, [user, startDate, endDate, testTypeFilter, departmentFilter]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography>Loading user data...</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Lab Reports & Analytics
        </Typography>

        {/* Filters */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => {
                  if (newValue && 'toDate' in newValue) {
                    setStartDate(newValue.toDate());
                  } else {
                    setStartDate(newValue as Date | null);
                  }
                }}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => {
                  if (newValue && 'toDate' in newValue) {
                    setEndDate(newValue.toDate());
                  } else {
                    setEndDate(newValue as Date | null);
                  }
                }}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Test Type</InputLabel>
                <Select
                  value={testTypeFilter}
                  label="Test Type"
                  onChange={(e) => setTestTypeFilter(e.target.value as string)}
                >
                  <MenuItem value="">All</MenuItem>
                  {testTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={departmentFilter}
                  label="Department"
                  onChange={(e) => setDepartmentFilter(e.target.value as number | '')}
                >
                  <MenuItem value="">All</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={fetchReportData}
                disabled={loading || !startDate || !endDate}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Apply Filters'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
            <Typography>Loading reports...</Typography>
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={3}>
          {/* Test Volume Chart */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>Test Volumes Over Time</Typography>
              {testVolumes.length > 0 ? (
                <ResponsiveLine
                  data={[{
                    id: 'Test Volumes',
                    data: testVolumes.map(d => ({ x: d.Period, y: d.TotalTests }))
                  }]}
                  margin={{ top: 20, right: 50, bottom: 60, left: 70 }}
                  xScale={{ type: 'point' }}
                  yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: 'Period',
                    legendOffset: 50,
                    legendPosition: 'middle',
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Total Tests',
                    legendOffset: -60,
                    legendPosition: 'middle',
                  }}
                  pointSize={10}
                  pointColor={{ theme: 'background' }}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: 'serieColor' }}
                  pointLabelYOffset={-12}
                  useMesh={true}
                  legends={[
                    {
                      anchor: 'bottom-right',
                      direction: 'column',
                      justify: false,
                      translateX: 100,
                      translateY: 0,
                      itemsSpacing: 0,
                      itemDirection: 'left-to-right',
                      itemWidth: 80,
                      itemHeight: 20,
                      itemOpacity: 0.75,
                      symbolSize: 12,
                      symbolShape: 'circle',
                      symbolBorderColor: 'rgba(0, 0, 0, .5)',
                      effects: [
                        {
                          on: 'hover',
                          style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
                            itemOpacity: 1
                          }
                        }
                      ]
                    }
                  ]}
                />
              ) : (
                <Typography>No test volume data available for the selected criteria.</Typography>
              )}
            </Paper>
          </Grid>

          {/* Turnaround Time Chart */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>Average Turnaround Time (Hours)</Typography>
              {turnaroundTimes.length > 0 ? (
                <ResponsiveBar
                  data={turnaroundTimes.map(d => ({
                    TestType: d.TestType,
                    AverageTurnaroundTimeHours: d.AverageTurnaroundTimeHours,
                  }))}
                  keys={['AverageTurnaroundTimeHours']}
                  indexBy="TestType"
                  margin={{ top: 20, right: 30, bottom: 60, left: 90 }}
                  padding={0.3}
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  colors={{ scheme: 'nivo' }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: 'Test Type',
                    legendOffset: 50,
                    legendPosition: 'middle',
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Hours',
                    legendOffset: -80,
                    legendPosition: 'middle',
                  }}
                  enableLabel={false}
                  legends={[
                    {
                      dataFrom: 'keys',
                      anchor: 'bottom-right',
                      direction: 'column',
                      justify: false,
                      translateX: 120,
                      translateY: 0,
                      itemsSpacing: 2,
                      itemWidth: 100,
                      itemHeight: 20,
                      itemDirection: 'left-to-right',
                      itemOpacity: 0.85,
                      symbolSize: 20,
                      effects: [
                        {
                          on: 'hover',
                          style: {
                            itemOpacity: 1,
                          },
                        },
                      ],
                    },
                  ]}
                  role="application"
                  ariaLabel="Nivo bar chart demo"
                  barAriaLabel={(e) =>
                    e.id + ': ' + e.formattedValue + ' in country: ' + e.indexValue
                  }
                />
              ) : (
                <Typography>No turnaround time data available for the selected criteria.</Typography>
              )}
            </Paper>
          </Grid>

          {/* Result Distribution Chart */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>Result Status Distribution</Typography>
              {resultDistribution.length > 0 ? (
                <ResponsivePie
                  data={resultDistribution.map(d => ({ id: d.ResultStatus, value: d.Count, label: d.ResultStatus }))}
                  margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  colors={{ scheme: 'pastel1' }}
                  borderWidth={1}
                  borderColor={{
                    from: 'color',
                    modifiers: [['darker', 0.2]],
                  }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#333333"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{
                    from: 'color',
                    modifiers: [['darker', 2]],
                  }}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      justify: false,
                      translateX: 0,
                      translateY: 56,
                      itemsSpacing: 0,
                      itemWidth: 100,
                      itemHeight: 18,
                      itemTextColor: '#999',
                      itemDirection: 'left-to-right',
                      itemOpacity: 1,
                      symbolSize: 18,
                      symbolShape: 'circle',
                      effects: [
                        {
                          on: 'hover',
                          style: {
                            itemTextColor: '#000',
                          },
                        },
                      ],
                    },
                  ]}
                />
              ) : (
                <Typography>No result distribution data available for the selected criteria.</Typography>
              )}
            </Paper>
          </Grid>

          {/* Staff Performance Chart */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>Staff Performance (Tests Handled)</Typography>
              {staffPerformance.length > 0 ? (
                <ResponsiveBar
                  data={staffPerformance.map(d => ({ ...d, name: `${d.first_name} ${d.last_name}` }))}
                  keys={['TotalResultsHandled']}
                  indexBy="name"
                  margin={{ top: 20, right: 30, bottom: 60, left: 90 }}
                  padding={0.3}
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  colors={{ scheme: 'paired' }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: 'Staff Member',
                    legendOffset: 50,
                    legendPosition: 'middle',
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Total Results',
                    legendOffset: -80,
                    legendPosition: 'middle',
                  }}
                  enableLabel={false}
                  legends={[
                    {
                      dataFrom: 'keys',
                      anchor: 'bottom-right',
                      direction: 'column',
                      justify: false,
                      translateX: 120,
                      translateY: 0,
                      itemsSpacing: 2,
                      itemWidth: 100,
                      itemHeight: 20,
                      itemDirection: 'left-to-right',
                      itemOpacity: 0.85,
                      symbolSize: 20,
                      effects: [
                        {
                          on: 'hover',
                          style: {
                            itemOpacity: 1,
                          },
                        },
                      ],
                    },
                  ]}
                  role="application"
                  ariaLabel="Nivo bar chart demo"
                  barAriaLabel={(e) =>
                    e.id + ': ' + e.formattedValue + ' by staff: ' + e.indexValue
                  }
                />
              ) : (
                <Typography>No staff performance data available for the selected criteria.</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default withAuth(LabReportsPage, ['LabStaff', 'Admin']);
