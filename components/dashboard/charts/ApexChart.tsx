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
    chart: {
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    theme: {
      mode: 'light' as const,
    },
    xaxis: categories ? { 
      categories,
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px'
        }
      }
    } : {},
    yaxis: {
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px'
        },
        formatter: function (value: number) {
          if (value >= 1000000) {
            return '$' + (value / 1000000).toFixed(1) + 'M';
          } else if (value >= 1000) {
            return '$' + (value / 1000).toFixed(0) + 'k';
          }
          return '$' + value.toFixed(0);
        }
      }
    },
    stroke: {
      width: type === 'line' ? 3 : 1,
      curve: 'smooth' as const,
    },
    colors: series.map(s => s.color) || ['#3B82F6', '#10B981', '#EF4444', '#F59E0B'],
    tooltip: {
      shared: true,
      intersect: false,
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, system-ui, sans-serif'
      }
    },
    legend: {
      position: 'bottom' as const,
      horizontalAlign: 'center' as const,
      fontSize: '12px',
      fontFamily: 'Inter, system-ui, sans-serif',
      markers: {
        width: 8,
        height: 8,
        radius: 4
      }
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    markers: type === 'line' ? {
      size: 4,
      strokeWidth: 2,
      strokeColors: '#fff',
      hover: {
        size: 6
      }
    } : undefined,
    fill: type === 'area' ? {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
      }
    } : undefined
  };

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="sm" _hover={{ shadow: "md" }} transition="shadow 0.2s">
      <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
        {title}
      </Text>
      <Chart type={type} options={options} series={series} height={height} />
    </Box>
  );
}

