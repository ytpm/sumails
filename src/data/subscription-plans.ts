/**
 * EXTRA FIELDS – add to '@/types/subscription'
 *
 * export interface Plan {
 *   ...
 *   // 'subscription'  → Stripe recurring price
 *   // 'one_time'      → Stripe one-off price (credits, top-ups, etc.)
 *   // 'free'          → no Stripe object needed
 *   billingType?: 'subscription' | 'one_time' | 'free'
 *
 *   // Soft quotas & feature flags you can reference in code / RLS policies
 *   limits?: {
 *     connectedAccounts?: number | null
 *     history?: number | null
 *   }
 * }
 */

import type { Plan } from "@/types/subscription"
import { APP_CONFIG } from "@/config"

export const plans: Plan[] = [
  /* ------------------------------------------------------------------ */
  {
    conceptualId: "free",
    billingType: "free",
    name: "Free Plan",
    features: [
      "Connect 1 Gmail account",
      "Daily email summaries",
      "14-day history",
    ],
    excludedFeatures: [
      "AI-powered insights",
      "Multiple account support",
      "Priority support",
    ],
    limits: {
      connectedAccounts: 1,
      history: 14,
    },
    model: APP_CONFIG.CHAT_GPT.MODEL_FOR_SUMMARY,
    ctaText: (_isMonthly: boolean, isCurrent: boolean) =>
      isCurrent ? "Current Plan" : "Get Started",
    environments: {
      development: {
        id: "free-dev",
        nickname: "Free Plan (Dev)",
        isPopular: false,
        pricing: {
          monthly: {
            price: "$0/mo",
            stripePriceId: "<PRICE_ID>",
            stripeProductId: "<PRODUCT_ID>",
          },
        },
      },
      production: {
        id: "free-prod",
        nickname: "Free Plan",
        isPopular: false,
        pricing: {
          monthly: {
            price: "$0/mo",
            stripePriceId: "<PRICE_ID>",
            stripeProductId: "<PRODUCT_ID>",
          },
        },
      },
    },
  },

  /* ------------------------------------------------------------------ */
  {
    conceptualId: "pro",
    billingType: "subscription",
    name: "Pro Plan",
    features: [
      "Connect 3 Gmail accounts",
      "Daily email summaries",
      "Advanced AI summaries",
      "30-day history",
      "AI-powered insights",
    ],
    excludedFeatures: [
      "Priority support",
    ],
    limits: {
      connectedAccounts: 3,
      history: 30,
    },
    trialPeriod: 7,
    model: APP_CONFIG.CHAT_GPT.MODEL_FOR_SUMMARY,
    ctaText: (isMonthly, isCurrent) =>
      isCurrent
        ? "Current Plan"
        : "Start Free Trial",
    environments: {
      development: {
        id: "pro-dev",
        nickname: "Pro Plan (Dev)",
        isPopular: true,
        pricing: {
          monthly: {
            price: "$9.99/mo",
            stripePriceId: "<PRICE_ID>",
            stripeProductId: "<PRODUCT_ID>",
          },
          yearly: {
            price: "$95.88/mo, billed annually",
            pricePerMonth: "$7.99/mo",
            totalPrice: "$95.88/mo, billed annually",
            savings: "Save 20%",
            stripePriceId: "<PRICE_ID>",
            stripeProductId: "<PRODUCT_ID>",
          },
        },
      },
      production: {
        id: "pro-prod",
        nickname: "Pro Plan",
        isPopular: true,
        pricing: {
          monthly: {
            price: "$9.99/mo",
            stripePriceId: "<PRICE_ID>",
            stripeProductId: "<PRODUCT_ID>",
          },
          yearly: {
            price: "$95.88/mo, billed annually",
            pricePerMonth: "$7.99/mo",
            totalPrice: "$95.88/mo, billed annually",
            savings: "Save 20%",
            stripePriceId: "<PRICE_ID>",
            stripeProductId: "<PRODUCT_ID>",
          },
        },
      },
    },
  },

  /* ------------------------------------------------------------------ */
  {
    conceptualId: "business",
    billingType: "subscription",
    name: "Business Plan",
    features: [
      "Connect unlimited Gmail accounts",
      "90-day history",
      "Best AI model for summary",
      "AI-powered insights",
      "Best AI model for insights",
      "Priority support (24h)",
    ],
    limits: {
      connectedAccounts: null,
      history: 90,
    },
    trialPeriod: 7,
    model: APP_CONFIG.CHAT_GPT.MODEL_FOR_SUMMARY,
    ctaText: (isMonthly, isCurrent) =>
      isCurrent
        ? "Current Plan"
        : "Start Free Trial",
    environments: {
      development: {
        id: "business-dev",
        nickname: "Business Plan (Dev)",
        isPopular: false,
        pricing: {
          monthly: {
            price: "$19.99/mo",
            stripePriceId: "<PRICE_ID>",
            stripeProductId: "<PRODUCT_ID>",
          },
          yearly: {
            price: "$203.88/mo, billed annually",
            pricePerMonth: "$16.99/mo",
            totalPrice: "$203.88/mo, billed annually",
            savings: "Save 15%",
            stripePriceId: "<PRICE_ID>",
            stripeProductId: "<PRODUCT_ID>",
          },
        },
      },
      production: {
        id: "business-prod",
        nickname: "Business Plan",
        isPopular: false,
        pricing: {
          monthly: {
            price: "$19.99/mo",
            stripePriceId: "<PRICE_ID>",
            stripeProductId: "<PRODUCT_ID>",
          },
          yearly: {
            price: "$203.88/mo, billed annually",
            pricePerMonth: "$16.99/mo",
            totalPrice: "$203.88/mo, billed annually",
            savings: "Save 15%",
            stripePriceId: "<PRICE_ID>",
            stripeProductId: "<PRODUCT_ID>",
          },
        },
      },
    },
  },
]

/* ------------------------------------------------------------------ */
/* Stripe IDs for Sandbox environment */
/* ------------------------------------------------------------------ */

// Free Plan
// <PRODUCT_ID>
// <PRICE_ID>

// Pro Plan -- Monthly
// <PRODUCT_ID>
// <PRICE_ID>

// Pro Plan -- Yearly
// <PRODUCT_ID>
// <PRICE_ID>

// Business Plan -- Monthly
// <PRODUCT_ID>
// <PRICE_ID>

// Business Plan -- Yearly
// <PRODUCT_ID>
// <PRICE_ID>

/* ------------------------------------------------------------------ */
/* Stripe IDs for Production environment */
/* ------------------------------------------------------------------ */

// Free Plan
// <PRODUCT_ID>
// <PRICE_ID>

// Pro Plan -- Monthly
// <PRODUCT_ID>
// <PRICE_ID>

// Pro Plan -- Yearly
// <PRODUCT_ID>
// <PRICE_ID>

// Business Plan -- Monthly
// <PRODUCT_ID>
// <PRICE_ID>

// Business Plan -- Yearly
// <PRODUCT_ID>
// <PRICE_ID>