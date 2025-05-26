export interface PriceInfo {
  price: string; // e.g., "$0/month", "$9.90/month"
  stripePriceId?: string; // Optional, primarily for free tier
  stripeProductId?: string; // Optional, primarily for free tier
}

export interface YearlyPriceInfo extends PriceInfo {
  pricePerMonth?: string; // e.g., "$6.93/month"
  totalPrice: string; // e.g., "$83.16/year"
  savings?: string; // e.g., "Save 30%"
  // stripePriceId is inherited from PriceInfo, will be string for paid yearly plans
}

export interface PlanPricingConfig {
  /** Recurring monthly price – required for subscription plans */
  monthly?: PriceInfo;
  /** Recurring yearly price – optional for subscription plans */
  yearly?: YearlyPriceInfo;
  /** One-off price – used by pay-as-you-go credit packs */
  oneTime?: PriceInfo;
}

export interface PlanEnvironmentConfig {
  id: string; // Environment-specific ID (e.g., for database record or unique key)
  pricing: PlanPricingConfig;
  nickname?: string; // Environment-specific nickname if desired
  description?: string; // Environment-specific description if desired
  isPopular?: boolean;
}

export interface Plan {
  conceptualId: string; // e.g., 'free', 'premium', 'pro'
  name: string; // Display name e.g., "Free Tier", "Premium Plan"
  features: string[]; // Common features (assuming they don't change by env for now)
  excludedFeatures?: string[]; // Features that are excluded from the plan
  ctaText: (isMonthlySelected: boolean, isCurrentPlan: boolean) => string;
  environments: {
    development: PlanEnvironmentConfig;
    production: PlanEnvironmentConfig;
  };

  // 'subscription'  → Stripe recurring price
  // 'one_time'      → Stripe one-off price (credits, top-ups, etc.)
  // 'free'          → no Stripe object needed
  billingType?: 'subscription' | 'one_time' | 'free';

  // Trial period in days
  trialPeriod?: number;

  // Soft quotas & feature flags you can reference in code / RLS policies
  limits?: {
    connectedAccounts?: number | null;
    history?: number | null;
  };

  /** OpenAI model to use for summary (optional) */
  model?: string;
}
