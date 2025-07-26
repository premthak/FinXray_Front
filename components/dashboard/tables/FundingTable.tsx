'use client';

import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@chakra-ui/react';
import { FundingRound } from '@/types/dashboard';

interface FundingTableProps {
  rounds: FundingRound[];
}

export default function FundingTable({ rounds }: FundingTableProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getRoundColor = (round: string) => {
    switch (round.toLowerCase()) {
      case 'seed': return 'green';
      case 'series a': return 'blue';
      case 'series b': return 'purple';
      case 'series c': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="sm" _hover={{ shadow: "md" }} transition="shadow 0.2s">
      <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.800">
        Funding History
      </Text>
      <Box overflowX="auto">
        <Table variant="simple" size="md">
          <Thead>
            <Tr bg="gray.50">
              <Th color="gray.600" fontWeight="semibold" fontSize="xs" textTransform="uppercase" letterSpacing="wide">
                Round
              </Th>
              <Th color="gray.600" fontWeight="semibold" fontSize="xs" textTransform="uppercase" letterSpacing="wide" isNumeric>
                Amount
              </Th>
              <Th color="gray.600" fontWeight="semibold" fontSize="xs" textTransform="uppercase" letterSpacing="wide">
                Date
              </Th>
              <Th color="gray.600" fontWeight="semibold" fontSize="xs" textTransform="uppercase" letterSpacing="wide">
                Lead Investor
              </Th>
              <Th color="gray.600" fontWeight="semibold" fontSize="xs" textTransform="uppercase" letterSpacing="wide" isNumeric>
                Valuation
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {rounds.map((round, index) => (
              <Tr key={index} _hover={{ bg: "gray.50" }} transition="background-color 0.2s">
                <Td>
                  <Badge colorScheme={getRoundColor(round.round)} variant="subtle" fontSize="xs" px={2} py={1}>
                    {round.round}
                  </Badge>
                </Td>
                <Td isNumeric fontWeight="semibold" color="gray.800">
                  {formatCurrency(round.amount)}
                </Td>
                <Td color="gray.600" fontSize="sm">
                  {new Date(round.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Td>
                <Td color="gray.800" fontSize="sm" fontWeight="medium">
                  {round.lead}
                </Td>
                <Td isNumeric fontWeight="semibold" color="gray.800">
                  {formatCurrency(round.valuation)}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}

