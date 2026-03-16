'use client';

import React from 'react';
import {
  Box,
  Chip,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { BedStatus, WardOccupancyBed } from '@/types/bedManagement';

interface BedMapProps {
  beds: WardOccupancyBed[];
  loading?: boolean;
}

const statusColor: Record<BedStatus, 'success' | 'error' | 'warning' | 'default'> = {
  Available: 'success',
  Occupied: 'error',
  Cleaning: 'warning',
  Maintenance: 'default',
};

const statusBorderColor = (status: BedStatus): string => {
  switch (status) {
    case 'Available':
      return '#2e7d32';
    case 'Occupied':
      return '#d32f2f';
    case 'Cleaning':
      return '#ed6c02';
    case 'Maintenance':
    default:
      return '#6b7280';
  }
};

const BedMap: React.FC<BedMapProps> = ({ beds, loading }) => {
  if (loading) {
    return <Typography variant="body2">Loading bed occupancy...</Typography>;
  }

  if (!beds.length) {
    return <Typography variant="body2">No beds found for this ward.</Typography>;
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Chip size="small" label="Available" color="success" />
        <Chip size="small" label="Occupied" color="error" />
        <Chip size="small" label="Cleaning" color="warning" />
        <Chip size="small" label="Maintenance" />
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(3, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))',
            lg: 'repeat(5, minmax(0, 1fr))',
          },
          gap: 1.5,
        }}
      >
        {beds.map((bed) => {
          const patientName =
            bed.status === 'Occupied'
              ? `${bed.patientFirstName || ''} ${bed.patientLastName || ''}`.trim()
              : '';
          const tooltipTitle = patientName || bed.status;

          return (
            <Tooltip title={tooltipTitle} key={bed.bedId}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderLeft: `6px solid ${statusBorderColor(bed.status)}`,
                }}
              >
                <Typography variant="subtitle2">{bed.bedNumber}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {bed.status}
                </Typography>
                {patientName && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {patientName}
                  </Typography>
                )}
              </Paper>
            </Tooltip>
          );
        })}
      </Box>
    </Stack>
  );
};

export default BedMap;
