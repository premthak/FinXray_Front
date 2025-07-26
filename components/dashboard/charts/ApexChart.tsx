'use client';

import { Box, Text } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ApexChartProps {
  type: 'line' | 'area' | 'bar' | 'column' | 'pie';
  title: string;
  categories?: string[];
  series: any[];
  height?: number;
}

export function ApexChart({ type, title, categories, series, height = 350 }: ApexChartProps) {
  const options = {
    chart: { toolbar: { show: false } },
    theme: { mode: 'light' as const },
    xaxis: categories ? { categories } : {},
    stroke: { width: type === 'line' ? 3 : 1, curve: 'smooth' as const },
    colors: ['#3182CE', '#38A169', '#E53E3E', '#D69E2E'],
    tooltip: { shared: true, intersect: false },
  };

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="sm">
      <Text fontSize="lg" fontWeight="semibold" mb={4}>{title}</Text>
      <Chart type={type} options={options} series={series} height={height} />
    </Box>
  );
}
