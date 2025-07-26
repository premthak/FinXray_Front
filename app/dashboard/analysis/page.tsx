'use client';

import { SimpleGrid, Box, Heading, VStack, Alert, AlertIcon, Spinner, Text } from '@chakra-ui/react';
import { ApexChart } from '@/components/dashboard/charts/ApexChart';
import { MetricCard } from '@/components/dashboard/cards/MetricCard';
import FundingTable from '@/components/dashboard/tables/FundingTable';
import { useDashboard } from '@/hooks/useDashboard';
import { useFileStore } from '@/store/fileStore';

export default function EnhancedAnalysisPage() {
  const { file } = useFileStore();
  const { data, error, isLoading } = useDashboard(file);

  if (!file) {
    return (
      <Box textAlign="center" py={20}>
        <Text>Please upload a document to begin analysis</Text>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>Analyzing startup data...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Failed to analyze document. Please try again.
      </Alert>
    );
  }

  return (
    <VStack spacing={8} align="stretch" p={6}>
      {/* Header */}
      <Box>
        <Heading size="xl" mb={2}>{data.company_name} - Investment Analysis</Heading>
        <Text fontSize="lg" color="gray.600">{data.executive_summary.headline}</Text>
      </Box>

      {/* KPI Cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
        <MetricCard
          label="Risk Score"
          value={`${data.overall_risk_score}/100`}
          colorScheme={data.overall_risk_score > 70 ? 'red' : data.overall_risk_score > 40 ? 'yellow' : 'green'}
          helpText={data.risk_category}
        />
        <MetricCard
          label="Revenue (Annual)"
          value={`$${(data.financial_metrics.revenue * 12).toLocaleString()}`}
          colorScheme="green"
          helpText="Projected ARR"
        />
        <MetricCard
          label="Runway"
          value={`${data.financial_metrics.runway_months} months`}
          colorScheme={data.financial_metrics.runway_months < 12 ? 'red' : 'blue'}
          helpText="At current burn rate"
        />
        <MetricCard
          label="Total Funding"
          value={`$${data.financial_metrics.funding_raised.toLocaleString()}`}
          colorScheme="blue"
          helpText="Raised to date"
        />
      </SimpleGrid>

      {/* Charts */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <ApexChart
          type="line"
          title="Revenue vs Burn Rate"
          categories={data.timeline_data.months}
          series={[
            { name: 'Revenue', data: data.timeline_data.revenue },
            { name: 'Burn Rate', data: data.timeline_data.burn_rate }
          ]}
        />
        <ApexChart
          type="area"
          title="User Growth"
          categories={data.timeline_data.months}
          series={[{ name: 'Users', data: data.timeline_data.users }]}
        />
      </SimpleGrid>

      {/* Funding Table */}
      <FundingTable rounds={data.funding_history} />

      {/* Executive Summary */}
      <Box bg="white" p={6} borderRadius="lg" shadow="sm">
        <Heading size="md" mb={4}>Executive Summary</Heading>
        <VStack align="start" spacing={2}>
          {data.executive_summary.key_points.map((point, index) => (
            <Text key={index}>- {point}</Text>
          ))}
        </VStack>
        <Alert status={data.executive_summary.recommendation.includes('HIGH RISK') ? 'error' : 'success'} mt={4}>
          <AlertIcon />
          <Text fontWeight="semibold">{data.executive_summary.recommendation}</Text>
        </Alert>
      </Box>
    </VStack>
  );
}
