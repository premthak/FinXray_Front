'use client';

import { Box, Text, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';

interface MetricCardProps {
  label: string;
  value: string | number;
  helpText?: string;
  colorScheme?: 'blue' | 'green' | 'red' | 'yellow';
}

export function MetricCard({ label, value, helpText, colorScheme = 'blue' }: MetricCardProps) {
  const colorMap = {
    blue: 'blue.500', green: 'green.500', red: 'red.500', yellow: 'yellow.500'
  };

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="sm" borderTop="4px solid" borderTopColor={colorMap[colorScheme]}>
      <Stat>
        <StatLabel color="gray.600">{label}</StatLabel>
        <StatNumber fontSize="2xl">{value}</StatNumber>
        {helpText && <StatHelpText>{helpText}</StatHelpText>}
      </Stat>
    </Box>
  );
}
