'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { ResponsiveLine } from '@nivo/line';
import { PatientVitalsTrendPoint } from '@/services/emrService';

interface VitalsTrendChartProps {
  data: PatientVitalsTrendPoint[];
  height?: number;
}

const VitalsTrendChart: React.FC<VitalsTrendChartProps> = ({ data, height = 320 }) => {
  if (!data || data.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No historical vitals available for trend analysis.
      </Typography>
    );
  }

  const sorted = [...data].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  const chartData = [
    {
      id: 'Systolic BP',
      data: sorted.map((point) => ({
        x: new Date(point.recordedAt).toLocaleString(),
        y: point.bloodPressureSystolic,
      })),
    },
    {
      id: 'Diastolic BP',
      data: sorted.map((point) => ({
        x: new Date(point.recordedAt).toLocaleString(),
        y: point.bloodPressureDiastolic,
      })),
    },
    {
      id: 'Temperature',
      data: sorted.map((point) => ({
        x: new Date(point.recordedAt).toLocaleString(),
        y: point.temperature,
      })),
    },
    {
      id: 'SpO2',
      data: sorted
        .filter((point) => point.spo2 !== undefined && point.spo2 !== null)
        .map((point) => ({
          x: new Date(point.recordedAt).toLocaleString(),
          y: point.spo2 as number,
        })),
    },
  ].filter((serie) => serie.data.length > 0);

  return (
    <Box sx={{ height, width: '100%' }}>
      <ResponsiveLine
        data={chartData}
        margin={{ top: 20, right: 80, bottom: 80, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -35,
          legend: 'Recorded At',
          legendOffset: 60,
          legendPosition: 'middle',
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Value',
          legendOffset: -45,
          legendPosition: 'middle',
        }}
        pointSize={8}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        useMesh
        legends={[
          {
            anchor: 'right',
            direction: 'column',
            justify: false,
            translateX: 70,
            translateY: 0,
            itemsSpacing: 8,
            itemDirection: 'left-to-right',
            itemWidth: 80,
            itemHeight: 18,
            itemOpacity: 0.85,
            symbolSize: 12,
            symbolShape: 'circle',
          },
        ]}
      />
    </Box>
  );
};

export default VitalsTrendChart;
