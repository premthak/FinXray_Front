'use client';

import { SimpleGrid, Box, Heading, VStack, Alert, AlertIcon, Spinner, Text, HStack, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';
import { ApexChart } from '@/components/dashboard/charts/ApexChart';
import FundingTable from '@/components/dashboard/tables/FundingTable';
import { useDashboard } from '@/hooks/useDashboard';
import { useFileStore } from '@/store/fileStore';

// Professional KPI Card Component
function KPICard({ label, value, helpText, colorScheme = 'blue' }) {
  const colorMap = {
    blue: 'blue.500',
    green: 'green.500',d.500',
    yellow: 'yellow.500'
  };

  return (
    <Box 
      bg="white" 
      p={6} 
      borderRadius="lg" 
      shadow="md" 
      borderTop="4px solid" 
      borderTopColor={colorMap[colorScheme]}
      _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
      transition="all 0.2s"
    >
      <Stat>
        <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
          {label}
        </StatLabel>
        <StatNumber fontSize="2xl" fontWeight="bold" color="gray.800">
          {value}
        </StatNumber>
        {helpText && (
          <StatHelpText color="gray.500" fontSize="xs">
            {helpText}
          </StatHelpText>
        )}
      </Stat>
    </Box>
  );
}

export default function EnhancedAnalysisPage() {
  const { file } = useFileStore();
  const { data, error, isLoading } = useDashboard(file);

  if (!file) {
    return (
      <Box textAlign="center" py={20} bg="gray.50" minH="100vh">
        <VStack spacing={6}>
          <Text fontSize="xl" color="gray.600">
            Upload a startup document to begin analysis
          </Text>
          <Text fontSize="md" color="gray.500">
            Supported formats: PDF, DOC, DOCX, TXT
          </Text>
        </VStack>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box textAlign="center" py={20} bg="gray.50" minH="100vh">
        <VStack spacing={6}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text fontSize="lg" color="gray.600">
            Analyzing startup data...
          </Text>
          <Text fontSize="md" color="gray.500">
            This may take a few moments
          </Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6} bg="gray.50" minH="100vh">
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="semibold">Analysis Failed</Text>
            <Text fontSize="sm">
              Unable to analyze the document. Please try uploading again or contact support.
            </Text>
          </VStack>
        </Alert>
      </Box>
    );
  }

  // Calculate additional metrics for display
  const monthlyRevenue = data.financial_metrics?.revenue || 0;
  const annualRevenue = monthlyRevenue * 12;
  const riskColor = data.overall_risk_score > 70 ? 'red' : data.overall_risk_score > 40 ? 'yellow' : 'green';
  const runwayColor = (data.financial_metrics?.runway_months || 0) < 12 ? 'red' : 
                      (data.financial_metrics?.runway_months || 0) < 24 ? 'yellow' : 'blue';

  return (
    <Box bg="gray.50" minH="100vh" p={6}>
      <VStack spacing={8} align="stretch" maxW="7xl" mx="auto">
        
        {/* Header Section */}
        <Box bg="white" p={6} borderRadius="lg" shadow="sm">
          <VStack align="start" spacing={2}>
            <HStack justify="space-between" w="full">
              <Heading size="xl" color="gray.800">
                {data.company_name} - Investment Analysis
              </Heading>
              <Box textAlign="right">
                <Text fontSize="sm" color="gray.500">
                  Analysis Date: {new Date().toLocaleDateString()}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Sector: {data.domain}
                </Text>
              </Box>
            </HStack>
            <Text fontSize="lg" color="gray.600">
              {data.executive_summary?.headline}
            </Text>
          </VStack>
        </Box>

        {/* KPI Cards Row */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
          <KPICard
            label="Risk Score"
            value={`${data.overall_risk_score}/100`}
            colorScheme={riskColor}
            helpText={data.risk_category}
          />
          <KPICard
            label="Revenue (Annual)"
            value={`$${(annualRevenue).toLocaleString()}`}
            colorScheme="green"
            helpText="Projected ARR"
          />
          <KPICard
            label="Runway"
            value={`${data.financial_metrics?.runway_months} months`}
            colorScheme={runwayColor}
            helpText="At current burn rate"
          />
          <KPICard
            label="Total Funding"
            value={`$${(data.financial_metrics?.funding_raised || 0).toLocaleString()}`}
            colorScheme="blue"
            helpText="Raised to date"
          />
        </SimpleGrid>

        {/* Charts Row */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {data.timeline_data && (
            <>
              <ApexChart
                type="line"
                title="Revenue vs Burn Rate"
                categories={data.timeline_data.months}
                series={[
                  { 
                    name: 'Revenue', 
                    data: data.timeline_data.revenue,
                    color: '#22C55E'
                  },
                  { 
                    name: 'Burn Rate', 
                    data: data.timeline_data.burn_rate,
                    color: '#EF4444'
                  }
                ]}
                height={350}
              />
              <ApexChart
                type="area"
                title="User Growth"
                categories={data.timeline_data.months}
                series={[
                  { 
                    name: 'Users', 
                    data: data.timeline_data.users,
                    color: '#3B82F6'
                  }
                ]}
                height={350}
              />
            </>
          )}
        </SimpleGrid>

        {/* Market Analysis & Metrics */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          <Box bg="white" p={6} borderRadius="lg" shadow="sm">
            <Heading size="md" mb={4} color="gray.800">Market Size</Heading>
            <VStack align="start" spacing={3}>
              <HStack justify="space-between" w="full">
                <Text color="gray.600">TAM</Text>
                <Text fontWeight="semibold">${(data.market_analysis?.tam / 1e9).toFixed(1)}B</Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text color="gray.600">SAM</Text>
                <Text fontWeight="semibold">${(data.market_analysis?.sam / 1e9).toFixed(1)}B</Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text color="gray.600">SOM</Text>
                <Text fontWeight="semibold">${(data.market_analysis?.som / 1e6).toFixed(0)}M</Text>
              </HStack>
            </VStack>
          </Box>

          <Box bg="white" p={6} borderRadius="lg" shadow="sm">
            <Heading size="md" mb={4} color="gray.800">Key Metrics</Heading>
            <VStack align="start" spacing={3}>
              <HStack justify="space-between" w="full">
                <Text color="gray.600">CAC</Text>
                <Text fontWeight="semibold">${data.financial_metrics?.cac}</Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text color="gray.600">LTV</Text>
                <Text fontWeight="semibold">${data.financial_metrics?.ltv}</Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text color="gray.600">LTV/CAC</Text>
                <Text fontWeight="semibold">
                  {((data.financial_metrics?.ltv || 0) / (data.financial_metrics?.cac || 1)).toFixed(1)}x
                </Text>
              </HStack>
            </VStack>
          </Box>

          <Box bg="white" p={6} borderRadius="lg" shadow="sm">
            <Heading size="md" mb={4} color="gray.800">Team & Operations</Heading>
            <VStack align="start" spacing={3}>
              <HStack justify="space-between" w="full">
                <Text color="gray.600">Team Size</Text>
                <Text fontWeight="semibold">{data.operational_metrics?.team_size}</Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text color="gray.600">Competition</Text>
                <Text fontWeight="semibold">{data.operational_metrics?.competition_level}</Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text color="gray.600">Regulatory</Text>
                <Text fontWeight="semibold">{data.operational_metrics?.regulatory_complexity}</Text>
              </HStack>
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Funding History Table */}
        {data.funding_history && data.funding_history.length > 0 && (
          <FundingTable rounds={data.funding_history} />
        )}

        {/* Risk Breakdown */}
        <Box bg="white" p={6} borderRadius="lg" shadow="sm">
          <Heading size="md" mb={4} color="gray.800">Risk Analysis</Heading>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Box>
              <Text fontSize="sm" color="gray.600">Fraud Risk</Text>
              <Text fontSize="lg" fontWeight="semibold" color={data.risk_breakdown?.fraud_risk > 50 ? 'red.500' : 'green.500'}>
                {data.risk_breakdown?.fraud_risk.toFixed(1)}%
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600">Compliance Risk</Text>
              <Text fontSize="lg" fontWeight="semibold" color={data.risk_breakdown?.compliance_risk > 50 ? 'red.500' : 'green.500'}>
                {data.risk_breakdown?.compliance_risk.toFixed(1)}%
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600">Traction Risk</Text>
              <Text fontSize="lg" fontWeight="semibold" color={data.risk_breakdown?.traction_risk > 50 ? 'red.500' : 'green.500'}>
                {data.risk_breakdown?.traction_risk.toFixed(1)}%
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600">Founder Risk</Text>
              <Text fontSize="lg" fontWeight="semibold" color={data.risk_breakdown?.founder_risk > 50 ? 'red.500' : 'green.500'}>
                {data.risk_breakdown?.founder_risk.toFixed(1)}%
              </Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Executive Summary */}
        <Box bg="white" p={6} borderRadius="lg" shadow="sm">
          <Heading size="md" mb={4} color="gray.800">Executive Summary</Heading>
          <VStack align="start" spacing={4}>
            {data.executive_summary?.key_points && (
              <VStack align="start" spacing={2} w="full">
                {data.executive_summary.key_points.map((point, index) => (
                  <HStack key={index} align="start">
                    <Box w="6px" h="6px" borderRadius="full" bg="blue.500" mt="2" />
                    <Text color="gray.700">{point}</Text>
                  </HStack>
                ))}
              </VStack>
            )}
            
            <Alert 
              status={data.executive_summary?.recommendation?.includes('HIGH RISK') ? 'error' : 'success'} 
              borderRadius="md"
            >
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontWeight="semibold">Investment Recommendation</Text>
                <Text fontSize="sm">{data.executive_summary?.recommendation}</Text>
              </VStack>
            </Alert>

            {data.positive_indicators && data.positive_indicators.length > 0 && (
              <Box w="full">
                <Text fontWeight="semibold" color="green.600" mb={2}>Positive Indicators:</Text>
                <VStack align="start" spacing={1}>
                  {data.positive_indicators.map((indicator, index) => (
                    <HStack key={index}>
                      <Box w="4px" h="4px" borderRadius="full" bg="green.500" mt="1" />
                      <Text fontSize="sm" color="gray.600">{indicator}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}

            {data.red_flags && data.red_flags.length > 0 && (
              <Box w="full">
                <Text fontWeight="semibold" color="red.600" mb={2}>Red Flags:</Text>
                <VStack align="start" spacing={1}>
                  {data.red_flags.map((flag, index) => (
                    <HStack key={index}>
                      <Box w="4px" h="4px" borderRadius="full" bg="red.500" mt="1" />
                      <Text fontSize="sm" color="gray.600">{flag}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
          </VStack>
        </Box>

      </VStack>
    </Box>
  );
}
