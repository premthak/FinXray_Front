'use client';

import { Box, Text } from '@chakra-ui/react';
import DataGrid from 'react-data-grid';
import { FundingRound } from '@/types/dashboard';

interface FundingTableProps {
  rounds: FundingRound[];
}

export default function FundingTable({ rounds }: FundingTableProps) {
  const columns = [
    { key: 'round', name: 'Round' },
    { key: 'amount', name: 'Amount (USD)', formatter: ({ row }: { row: FundingRound }) => `$${row.amount.toLocaleString()}` },
    { key: 'date', name: 'Date' },
    { key: 'lead', name: 'Lead Investor' },
    { key: 'valuation', name: 'Valuation', formatter: ({ row }: { row: FundingRound }) => `$${row.valuation.toLocaleString()}` },
  ];

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="sm">
      <Text fontSize="lg" fontWeight="semibold" mb={4}>Funding History</Text>
      <DataGrid columns={columns} rows={rounds} className="rdg-light" style={{ height: '300px' }} />
    </Box>
  );
}
