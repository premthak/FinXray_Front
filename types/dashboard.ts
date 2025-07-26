export interface DashboardData {
  company_name: string;
  overall_risk_score: number;
  risk_category: string;
  financial_metrics: {
    revenue: number;
    burn_rate: number;
    runway_months: number;
    funding_raised: number;
  };
  funding_history: FundingRound[];
  timeline_data: TimelineData;
  executive_summary: ExecutiveSummary;
}

export interface FundingRound {
  round: string;
  amount: number;
  date: string;
  lead: string;
  valuation: number;
}

export interface TimelineData {
  months: string[];
  revenue: number[];
  burn_rate: number[];
  users: number[];
}

export interface ExecutiveSummary {
  headline: string;
  key_points: string[];
  recommendation: string;
}
