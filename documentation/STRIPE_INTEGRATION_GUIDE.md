# Stripe Integration Guide & Checklist for New Projects 🚀 (AI Assistant Edition v2)

**Document Purpose:** This guide provides a comprehensive checklist and step-by-step process for integrating Stripe into new projects. It is designed to be used with an AI coding assistant (like Cursor). The assistant will first guide you through project-specific configurations, then help implement the integration based on this template and your answers.

**Goal:** To achieve a secure, robust, and maintainable Stripe integration covering payment processing, subscription management (if applicable), webhook handling, and customer portal functionality, with a client-side experience similar to the DreamScan `SubscriptionPage.tsx`.

---

## ①. Initial Setup: Install SDKs & Configure Environment Variables

*(Cursor: First, guide the user to install the necessary Stripe libraries and then help set up their environment variables.)*

1.  **Install Stripe Libraries:**
    * **Backend (Node.js):**
        ```bash
        npm install stripe
        # or
        yarn add stripe
        ```
    * **Frontend (for Stripe.js/Elements - typically Next.js projects):**
        Ensure Stripe.js is loaded. For Next.js, often via `@stripe/react-stripe-js` and `@stripe/stripe-js` or a direct script tag.
        ```bash
        npm install @stripe/stripe-js @stripe/react-stripe-js
        # or
        yarn add @stripe/stripe-js @stripe/react-stripe-js
        ```
        Or, if using a simple script tag:
        ```html
        <script src="https://js.stripe.com/v3/" async></script>
        ```

2.  **Set Up Environment Variables:**
    *(Cursor: Check if `.env` and `.env.local` files exist at the project root. If not, create them. Then, append the following content to both files. Instruct the user to replace placeholder values with their actual Stripe Test API keys initially, and later with Live keys for production. The `.env.local` file is for local development and should be in `.gitignore`.)*

    ```env
    # .env and .env.local

    # Stripe API Keys & Webhook Secret
    # Obtain these from your Stripe Dashboard (Developers > API keys & Developers > Webhooks)
    STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_TEST_PUBLISHABLE_KEY
    STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_TEST_SECRET_KEY
    STRIPE_WEBHOOK_SECRET=whsec_YOUR_STRIPE_TEST_WEBHOOK_SIGNING_SECRET

    # For Production (update .env on your server, and .env.local if testing live locally)
    # STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_STRIPE_LIVE_PUBLISHABLE_KEY
    # STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_LIVE_SECRET_KEY
    # STRIPE_WEBHOOK_SECRET=whsec_YOUR_STRIPE_LIVE_WEBHOOK_SIGNING_SECRET

    # Base URL of your application (ensure this is correct for each environment)
    NEXT_PUBLIC_APP_URL=http://localhost:3000 # Adjust if needed

    # Define standard paths for checkout redirects and webhook
    # These can be overridden if project requirements differ.
    CHECKOUT_SUCCESS_PATH=/dashboard/billing?checkout_status=success
    CHECKOUT_CANCEL_PATH=/dashboard/billing?checkout_status=canceled
    STRIPE_WEBHOOK_PATH=/api/stripe/webhooks
    CUSTOMER_PORTAL_RETURN_PATH=/dashboard/billing
    ```
    *(Cursor: Remind the user to add `.env.local` and any `.env` files containing actual secrets to their `.gitignore` file.)*

---

## ②. Define Your Products and Pricing Plans

*(Cursor: Ask the user to define their project's products and pricing plans in a structured format, similar to DreamScan's `subscription-plans.ts`. They should create or update a file, for example, `src/data/projectPlans.ts` (or a name relevant to the new project), with an array of `Plan` objects. Provide the `Plan` type definition and the example structure below. The user will need to replace placeholder Stripe Product IDs and Price IDs with actual IDs they create in their Stripe Dashboard in Step ④. For `modelBasic` and `modelFull` or similar project-specific properties, either remove them if not applicable or suggest relevant placeholders.)*

**Ensure `Plan` type definition exists (e.g., in `src/types/subscription.ts` or a shared types file):**

```typescript
// src/types/subscription.ts (or similar path)
export interface PriceInfo { /* ... (as provided previously) ... */ }
export interface YearlyPriceInfo extends PriceInfo { /* ... */ }
export interface PlanPricingConfig { /* ... */ }
export interface PlanEnvironmentConfig { /* ... */ }
export interface Plan { /* ... (as provided previously, ensure it includes billingType, limits, etc.) ... */ }
```

**Template for `src/data/projectPlans.ts` to be filled by user:**

*(Cursor: Provide this template. User needs to update stripePriceId and stripeProductId after creating them in Stripe in Step ④. Remove or adapt project-specific fields like modelBasic/modelFull and limits if they don't apply to the new project.)*

```typescript
// src/data/projectPlans.ts
import { Plan } from '@/types/subscription'; // Adjust path as needed

// Example project-specific config (if any, otherwise remove or simplify)
// const PROJECT_CONFIG = { models: { default: 'gpt-3.5-turbo' }};

export const plans: Plan[] = [
  {
    conceptualId: "free_tier",
    billingType: "free",
    name: "Free Tier",
    features: [ "Feature 1 for free plan", "Feature 2 for free plan" ],
    // limits: { someLimit: 5 }, // Example
    // modelBasic: PROJECT_CONFIG.models.default, // Example
    ctaText: (_isMonthly, isCurrent) => isCurrent ? "Current Plan" : "Get Started Free",
    environments: {
      development: {
        id: "free-dev",
        pricing: { monthly: { price: "$0/month", stripePriceId: "price_TEST_FREE_MONTHLY_ID", stripeProductId: "prod_TEST_FREE_PRODUCT_ID" } },
      },
      production: {
        id: "free-prod",
        pricing: { monthly: { price: "$0/month", stripePriceId: "price_LIVE_FREE_MONTHLY_ID", stripeProductId: "prod_LIVE_FREE_PRODUCT_ID" } },
      },
    },
  },
  {
    conceptualId: "standard_pack", // Example one-time purchase
    billingType: "one_time",
    name: "Standard Pack",
    features: [ "One-time feature A", "One-time feature B" ],
    // limits: { credits: 100 }, // Example
    ctaText: (_isMonthly, isCurrent) => isCurrent ? "Purchased" : "Buy for $29",
    environments: {
      development: {
        id: "standard-pack-dev",
        pricing: { oneTime: { price: "$29", stripePriceId: "price_TEST_STANDARD_PACK_ID", stripeProductId: "prod_TEST_STANDARD_PACK_PRODUCT_ID" } },
      },
      production: {
        id: "standard-pack-prod",
        pricing: { oneTime: { price: "$29", stripePriceId: "price_LIVE_STANDARD_PACK_ID", stripeProductId: "prod_LIVE_STANDARD_PACK_PRODUCT_ID" } },
      },
    },
  },
  {
    conceptualId: "premium_plan", // Example subscription
    billingType: "subscription",
    name: "Premium Plan",
    features: [ "Premium Feature X", "Premium Feature Y", "Priority Support" ],
    // limits: { someLimit: null }, // null often means unlimited for subscriptions
    ctaText: (isMonthly, isCurrent) => isCurrent ? "Current Plan" : (isMonthly ? "Go Premium Monthly" : "Go Premium Yearly"),
    environments: {
      development: {
        id: "premium-dev",
        isPopular: true,
        pricing: {
          monthly: { price: "$49/month", stripePriceId: "price_TEST_PREMIUM_MONTHLY_ID", stripeProductId: "prod_TEST_PREMIUM_SUB_PRODUCT_ID" },
          yearly: { price: "$490/year", pricePerMonth: "$40.83/month", totalPrice: "$490/year", savings: "Save ~17%", stripePriceId: "price_TEST_PREMIUM_YEARLY_ID", stripeProductId: "prod_TEST_PREMIUM_SUB_PRODUCT_ID" },
        },
      },
      production: {
        id: "premium-prod",
        isPopular: true,
        pricing: {
          monthly: { price: "$49/month", stripePriceId: "price_LIVE_PREMIUM_MONTHLY_ID", stripeProductId: "prod_LIVE_PREMIUM_SUB_PRODUCT_ID" },
          yearly: { price: "$490/year", pricePerMonth: "$40.83/month", totalPrice: "$490/year", savings: "Save ~17%", stripePriceId: "price_LIVE_PREMIUM_YEARLY_ID", stripeProductId: "prod_LIVE_PREMIUM_SUB_PRODUCT_ID" },
        },
      },
    },
  },
  // Add more plans as needed for the project
];
```

## ③. Server-Side Stripe Client Initialization

*(Cursor: Ensure a Stripe client is initialized for server-side operations. Create `src/lib/stripe/client.ts` if it doesn't exist, using the STRIPE_SECRET_KEY environment variable.)*

**`src/lib/stripe/client.ts`:**

```typescript
// src/lib/stripe/client.ts
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  // This check is critical for server startup.
  console.error('FATAL ERROR: STRIPE_SECRET_KEY is not set in environment variables.');
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables. Please add it to your .env file.');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-04-10', // Specify a recent, stable API version
  typescript: true,
  appInfo: { // Optional: helps Stripe identify your integration
    name: process.env.PROJECT_NAME || 'My SaaS Project', // PROJECT_NAME can be another env var
    version: '0.1.0', // Your app version
  },
});
```

## ④. Create Products and Prices in Stripe Dashboard

*(Cursor: Guide the user to manually create Products and Prices in their Stripe Dashboard (both Test and Live modes) corresponding to each entry in their `src/data/projectPlans.ts` file. They must copy the generated Stripe Product IDs and Price IDs back into their `projectPlans.ts` file, replacing the placeholders like `price_TEST_...` and `prod_TEST_...`)*

**Instructions for User:** *(Same as previous template, ensure they update the correct file)*

1. Log in to Stripe Dashboard. Use Test mode first.
2. Go to Products > Product catalog.
3. For each plan in `src/data/projectPlans.ts`:
   - Create the Product (Name, etc.).
   - Add Pricing (Price, Currency, Recurring/One-time, Interval).
   - Copy the generated Product ID and Price ID.
   - Update `src/data/projectPlans.ts` with these Test mode IDs.
4. Repeat for Live mode when ready, updating with Live IDs.

## ⑤. Implement Server-Side Stripe Actions

*(Cursor: Create or update a server-side actions file, e.g., `src/lib/stripe/actions.ts`. This will contain functions to create Stripe Checkout Sessions for new purchases/subscriptions and Customer Portal sessions for managing existing subscriptions (including upgrades/downgrades). Adapt the logic from DreamScan's `actions.ts`, but generalize database interactions with `// TODO: [ProjectDB]` comments. Use `console.log` for logging.)*

**Template for `src/lib/stripe/actions.ts`:**

```typescript
// src/lib/stripe/actions.ts
'use server';

import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { plans as projectPlans } from '@/data/projectPlans'; // Use the project-specific plans file
import { headers as getNextHeaders } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Plan } from '@/types/subscription'; // Assuming Plan type is defined

// Helper to get current environment (development or production)
const getCurrentEnvironment = (): 'development' | 'production' => {
  return process.env.NODE_ENV === 'development' ? 'development' : 'production';
};

/**
 * Retrieves the Stripe Customer ID for a given internal user ID.
 * Creates a new Stripe Customer if one doesn't exist.
 * @param internalUserId Your application's internal user ID.
 * @param userEmail User's email.
 * @param userName Optional user's name.
 * @returns The Stripe Customer ID.
 */
async function getOrCreateStripeCustomerId(
  internalUserId: string,
  userEmail: string,
  userName?: string
): Promise<string> {
  // TODO: [ProjectDB] Query your 'users' table for an existing 'stripe_customer_id' for this 'internalUserId'.
  // const userRecord = await db.users.findUnique({ where: { id: internalUserId }, select: { stripeCustomerId: true } });
  // let stripeCustomerId = userRecord?.stripeCustomerId;
  let stripeCustomerId: string | undefined | null = null; // Placeholder for DB query result

  if (stripeCustomerId) {
    console.log(`[Stripe Actions] Found existing Stripe Customer ID ${stripeCustomerId} for user ${internalUserId}`);
    return stripeCustomerId;
  }

  // Try to find customer by email to avoid duplicates if DB link is missing
  const existingCustomers = await stripe.customers.list({ email: userEmail, limit: 1 });
  if (existingCustomers.data.length > 0) {
    stripeCustomerId = existingCustomers.data[0].id;
    console.log(`[Stripe Actions] Found existing Stripe Customer ${stripeCustomerId} by email ${userEmail} for user ${internalUserId}`);
  } else {
    const customer = await stripe.customers.create({
      email: userEmail,
      name: userName,
      metadata: {
        application_user_id: internalUserId,
        // Add any other project-specific metadata to store on the Stripe Customer object
      },
    });
    stripeCustomerId = customer.id;
    console.log(`[Stripe Actions] Created new Stripe Customer ${stripeCustomerId} for user ${internalUserId}`);
  }

  // TODO: [ProjectDB] Save the new 'stripeCustomerId' to your local user record for 'internalUserId'.
  // await db.users.update({ where: { id: internalUserId }, data: { stripeCustomerId: stripeCustomerId } });
  return stripeCustomerId;
}

/**
 * Creates a Stripe Checkout Session for a new subscription or one-time purchase.
 * @param priceId The Stripe Price ID to checkout.
 * @param planConceptualId The conceptual ID of the plan from your projectPlans.
 * @param internalUserId Your application's internal user ID.
 * @param userEmail User's email.
 * @param userName Optional user's name.
 * @returns Object with success status, message, and checkout URL if successful.
 */
export async function createNewCheckoutSession(
  priceId: string,
  planConceptualId: string,
  internalUserId: string,
  userEmail: string,
  userName?: string
) {
  const headersList = getNextHeaders();
  const appOrigin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL;

  if (!appOrigin) {
    console.error('[Stripe Actions] Application origin/URL is not configured.');
    return { success: false, message: 'Application URL misconfiguration.' };
  }

  const planDetails = projectPlans.find(p => {
    const envConfig = p.environments[getCurrentEnvironment()];
    if (p.billingType === 'one_time') return envConfig.pricing.oneTime?.stripePriceId === priceId;
    return envConfig.pricing.monthly?.stripePriceId === priceId || envConfig.pricing.yearly?.stripePriceId === priceId;
  });

  if (!planDetails) {
    console.error(`[Stripe Actions] Plan details not found for priceId: ${priceId}`);
    return { success: false, message: 'Selected plan is invalid.' };
  }

  try {
    const stripeCustomerId = await getOrCreateStripeCustomerId(internalUserId, userEmail, userName);

    const mode = planDetails.billingType === 'one_time' ? 'payment' : 'subscription';
    
    // Use environment variables for paths, fallback to defaults
    const successQuery = `session_id={CHECKOUT_SESSION_ID}&status=success&plan=${planConceptualId}&billing_type=${mode}`;
    const cancelQuery = `status=canceled&plan=${planConceptualId}`;
    const successUrl = `${appOrigin}${process.env.CHECKOUT_SUCCESS_PATH || '/checkout/success'}?${successQuery}`;
    const cancelUrl = `${appOrigin}${process.env.CHECKOUT_CANCEL_PATH || '/checkout/cancel'}?${cancelQuery}`;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: mode,
      customer: stripeCustomerId,
      client_reference_id: internalUserId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        application_user_id: internalUserId,
        plan_conceptual_id: planConceptualId,
      },
    };

    if (mode === 'subscription') {
      sessionParams.subscription_data = {
        metadata: {
          application_user_id: internalUserId,
          plan_conceptual_id: planConceptualId,
        },
      };
    } else if (mode === 'payment' && planDetails.billingType === 'one_time') {
      // For one-time payments, allow quantity adjustment if needed by the project
      // sessionParams.line_items[0].adjustable_quantity = { enabled: true, minimum: 1, maximum: 10 };
      sessionParams.payment_intent_data = {
        metadata: {
          application_user_id: internalUserId,
          plan_conceptual_id: planConceptualId,
        },
      };
    }

    console.log(`[Stripe Actions] Creating Checkout session for user ${internalUserId}, priceId ${priceId}, mode ${mode}`);
    const session = await stripe.checkout.sessions.create(sessionParams);

    if (session.url) {
      // For server actions, redirect is preferred over returning URL for client to redirect
      // return { success: true, url: session.url };
      redirect(session.url); // This will throw a NEXT_REDIRECT error, caught by Next.js
    } else {
      return { success: false, message: 'Could not create Stripe Checkout session URL.' };
    }
  } catch (error: any) {
    if (error.message.includes('NEXT_REDIRECT')) throw error; // Re-throw Next.js redirect error
    console.error('[Stripe Actions] Error in createNewCheckoutSession:', error);
    return { success: false, message: error.message || 'Could not initiate payment.' };
  }
}

/**
 * Creates a Stripe Customer Portal Session, potentially for managing or updating a subscription.
 * @param internalUserId Your application's internal user ID.
 * @param targetPriceId Optional: The Stripe Price ID of the plan the user intends to switch to.
 * @returns Object with success status, message, and portal URL if successful.
 */
export async function createStripeCustomerPortalSession(internalUserId: string, targetPriceId?: string) {
  const headersList = getNextHeaders();
  const appOrigin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL;

  if (!appOrigin) {
    console.error('[Stripe Actions] Application origin/URL is not configured for portal.');
    return { success: false, message: 'Application URL misconfiguration.' };
  }

  let stripeCustomerId: string | undefined | null;
  // TODO: [ProjectDB] Query your 'users' table for 'stripe_customer_id' for the 'internalUserId'.
  // const userRecord = await db.users.findUnique({ where: { id: internalUserId }, select: { stripeCustomerId: true } });
  // stripeCustomerId = userRecord?.stripeCustomerId;

  if (!stripeCustomerId) {
    console.error(`[Stripe Actions] Stripe Customer ID not found for user ${internalUserId} when creating portal session.`);
    // Optionally, redirect to a page explaining the issue or try to create customer if appropriate.
    // For this function, we assume customer ID should exist if they are managing subscriptions.
    return { success: false, message: 'Billing profile not found. Please contact support.'};
  }

  const portalReturnPath = process.env.CUSTOMER_PORTAL_RETURN_PATH || '/dashboard/billing';

  try {
    let portalConfigurationId: string | undefined;

    // If a targetPriceId is provided, it implies a plan change (upgrade/downgrade).
    // We create a specific portal configuration to facilitate this.
    if (targetPriceId) {
      const targetPlan = projectPlans.find(p => {
        const envConfig = p.environments[getCurrentEnvironment()];
        return envConfig.pricing.monthly?.stripePriceId === targetPriceId || envConfig.pricing.yearly?.stripePriceId === targetPriceId;
      });

      if (!targetPlan || targetPlan.billingType !== 'subscription') {
        console.error(`[Stripe Actions] Target plan for update (Price ID: ${targetPriceId}) is not a valid subscription plan.`);
        return { success: false, message: 'Invalid target plan for update.' };
      }

      // Define which products can be switched to.
      // This typically includes other subscription plans you offer.
      const allowedUpdatesProducts: Stripe.BillingPortal.ConfigurationCreateParams.Features.SubscriptionUpdate.Product[] = [];
      projectPlans.forEach(p => {
        if (p.billingType === 'subscription') {
          const envConfig = p.environments[getCurrentEnvironment()];
          if (envConfig.pricing.monthly?.stripeProductId && envConfig.pricing.monthly.stripePriceId) {
            allowedUpdatesProducts.push({ product: envConfig.pricing.monthly.stripeProductId, prices: [envConfig.pricing.monthly.stripePriceId] });
          }
          if (envConfig.pricing.yearly?.stripeProductId && envConfig.pricing.yearly.stripePriceId) {
            allowedUpdatesProducts.push({ product: envConfig.pricing.yearly.stripeProductId, prices: [envConfig.pricing.yearly.stripePriceId] });
          }
        }
      });

      // Filter out the current product/price if it's already what the user has, though Stripe portal might handle this gracefully.
      // This example allows updating to any defined subscription price.
      const portalConfig = await stripe.billingPortal.configurations.create({
        business_profile: {
          // TODO: Ask user for these URLs or use defaults
          privacy_policy_url: `${appOrigin}/privacy-policy`,
          terms_of_service_url: `${appOrigin}/terms-of-service`,
        },
        features: {
          invoice_history: { enabled: true },
          payment_method_update: { enabled: true },
          subscription_cancel: { enabled: true, mode: 'at_period_end', proration_behavior: 'none' },
          subscription_update: {
            enabled: true,
            default_allowed_updates: ['price'], // Allow changing price (i.e., plan)
            proration_behavior: 'always_invoice', // Or 'create_prorations'
            products: allowedUpdatesProducts.filter(p => p.prices.length > 0), // Ensure products have prices
          },
        },
      });
      portalConfigurationId = portalConfig.id;
      console.log(`[Stripe Actions] Created Billing Portal Configuration ${portalConfigurationId} for subscription update.`);
    }

    const portalSessionParams: Stripe.BillingPortal.SessionCreateParams = {
      customer: stripeCustomerId,
      return_url: `${appOrigin}${portalReturnPath}`,
    };
    if (portalConfigurationId) {
      portalSessionParams.configuration = portalConfigurationId;
    }
    // If targeting a specific price for an upgrade/downgrade flow initiated from your app:
    // if (targetPriceId && currentSubscriptionId) {
    //   portalSessionParams.flow_data = {
    //     type: 'subscription_update',
    //     subscription_update: { subscription: currentSubscriptionId, items: [{ id: currentSubscriptionItemId, price: targetPriceId }] },
    //   };
    // }

    const portalSession = await stripe.billingPortal.sessions.create(portalSessionParams);
    
    // Redirect to the portal URL
    redirect(portalSession.url); // This will throw a NEXT_REDIRECT error
  } catch (error: any) {
    if (error.message.includes('NEXT_REDIRECT')) throw error;
    console.error('[Stripe Actions] Error creating Stripe Customer Portal session:', error);
    return { success: false, message: error.message || 'Could not open customer portal.' };
  }
}

// (Optional: Add cancelStripeSubscription function here if needed, similar to DreamScan's,
// but remember it might be preferable to let users cancel via the Customer Portal)
```

## ⑥. Frontend Stripe.js & Checkout/Portal Redirection

*(Cursor: Guide the user on how to call the server-side actions from their frontend (e.g., from a pricing page component or subscription management UI). This will involve fetching data and then redirecting or using `stripe.redirectToCheckout` if a sessionId is returned instead of a full URL by the action.)*

**Conceptual Client-Side JavaScript (e.g., in a React component):**

```javascript
// Example for handling a new checkout
// async function handleNewSubscription(priceId, planConceptualId) {
//   setIsLoading(true);
//   // Assume internalUserId, userEmail, userName are available from auth context or props
//   const response = await fetch('/api/stripe/create-checkout', { // Path to your server action/API route
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json', },
//     body: JSON.stringify({ priceId, planConceptualId, internalUserId, userEmail, userName }),
//   });
//   const data = await response.json();

//   if (data.success && data.url) {
//     window.location.href = data.url; // Server action used redirect(), so this won't be hit if successful.
                                      // This is a fallback if server action returns a URL.
//   } else if (data.success && data.sessionId) { // If action returns sessionId for client-side redirect
//     const stripeJs = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
//     if (!stripeJs) { /* Handle Stripe.js not loading */ return; }
//     const { error } = await stripeJs.redirectToCheckout({ sessionId: data.sessionId });
//     if (error) console.error("Stripe redirectToCheckout error:", error.message);
//   } else {
//     console.error("Failed to create checkout session:", data.message);
//     // Show error to user
//   }
//   setIsLoading(false);
// }

// Example for opening Customer Portal
// async function openCustomerPortal() {
//    // Assume internalUserId is available
//   const response = await fetch('/api/stripe/create-portal-session', { // Path to your server action/API route
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json', },
//     body: JSON.stringify({ internalUserId }), // Or just rely on server to get authenticated user
//   });
//   const data = await response.json();
//   if (data.success && data.url) {
//      window.location.href = data.url; // Server action used redirect()
//   } else {
//      console.error("Failed to create portal session:", data.message);
//   }
// }
```

*(Cursor: Adapt this to the specific frontend framework. For Next.js using Server Actions, the redirect will happen server-side, so the client might not need to handle `data.url` if the action itself calls `redirect()`.)*

**Handling Redirects from Stripe (Success/Cancel):**

*(Cursor: Guide the user to create a component similar to DreamScan's `SubscriptionPage.tsx` with its `SearchParamsHandler`. This component will be mounted on the `CHECKOUT_SUCCESS_PATH` and `CHECKOUT_CANCEL_PATH` routes. It will read URL parameters (e.g., `checkout_status`, `session_id`, `plan`, `billing_type`) to display appropriate messages (toasts) and potentially refetch user subscription/entitlement data.)*

## ⑦. Implement Webhook Endpoint (Server-Side)

*(Cursor: Create or update the webhook handler at the path defined by `STRIPE_WEBHOOK_PATH` (e.g., `src/app/api/stripe/webhooks/route.ts`). Adapt the following template, ensuring robust signature verification and clear `// TODO: [ProjectDB]` comments for database interactions. Use `console.log` for logging.)*

**Template for `src/app/api/stripe/webhooks/route.ts` (Next.js App Router Example):**

```typescript
// src/app/api/stripe/webhooks/route.ts
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
// import { revalidatePath } from 'next/cache'; // For on-demand revalidation

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// --- Placeholder Database Interaction Functions ---
// (Cursor: These are conceptual. User needs to implement these based on their DB/ORM)
// async function findUserByStripeCustomerId(stripeCustomerId: string): Promise<string | null> {
//   console.log(`[Webhook DB] findUserByStripeCustomerId: ${stripeCustomerId}`);
//   // TODO: [ProjectDB] Query your 'users' table. Return internal user ID or null.
//   return 'mock_internal_user_id'; // Placeholder
// }
// async function updateUserSubscriptionStatus(internalUserId: string, stripeSubscriptionId: string, newStatus: string, periodEnd?: Date, priceId?: string, productId?: string, cancelAtPeriodEnd?: boolean) {
//   console.log(`[Webhook DB] updateUserSubscriptionStatus for user ${internalUserId}, sub ${stripeSubscriptionId}: ${newStatus}`);
//   // TODO: [ProjectDB] Update your 'subscriptions' table.
// }
// async function createNewSubscriptionRecord(internalUserId: string, stripeCustomerId: string, stripeSubscriptionId: string, status: string, periodEnd: Date, priceId: string, productId: string, planConceptualId: string) {
//    console.log(`[Webhook DB] createNewSubscriptionRecord for user ${internalUserId}, sub ${stripeSubscriptionId}`);
//    // TODO: [ProjectDB] Insert into your 'subscriptions' table.
// }
// async function recordOneTimePurchaseInDB(internalUserId: string, stripeCustomerId: string, paymentIntentId: string, planConceptualId: string, amountTotal: number | null, currency: string | null, quantity: number) {
//    console.log(`[Webhook DB] recordOneTimePurchaseInDB for user ${internalUserId}, pi ${paymentIntentId}`);
//    // TODO: [ProjectDB] Insert into your 'one_time_purchases' table.
// }
// async function grantEntitlementsForPlan(internalUserId: string, planConceptualId: string, quantity: number = 1) {
//    console.log(`[Webhook DB] grantEntitlementsForPlan for user ${internalUserId}, plan ${planConceptualId}`);
//    // TODO: [ProjectDB] Update user entitlements (e.g., add credits, activate features).
// }
// --- End Placeholder Database Functions ---

export async function POST(req: Request) {
  if (!webhookSecret) {
    console.error('[Stripe Webhook] FATAL: Webhook secret is not configured.');
    return NextResponse.json({ error: 'Server configuration error: Webhook secret missing.' }, { status: 500 });
  }

  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    console.error('[Stripe Webhook] Stripe signature missing from request.');
    return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Received verified event: ${event.type} (ID: ${event.id})`);
  const dataObject = event.data.object as any; // Use specific types per event if preferred

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = dataObject as Stripe.Checkout.Session;
        const internalUserId = session.client_reference_id; // Your app's user ID
        const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const planConceptualId = session.metadata?.plan_conceptual_id;

        if (!internalUserId || !stripeCustomerId || !planConceptualId) {
            console.error(`[Stripe Webhook] checkout.session.completed: Missing crucial data. UserID: ${internalUserId}, StripeCustID: ${stripeCustomerId}, PlanID: ${planConceptualId}. Session ID: ${session.id}`);
            break; // Or return error if this is critical
        }

        console.log(`[Stripe Webhook] Processing checkout.session.completed for User: ${internalUserId}, Stripe Customer: ${stripeCustomerId}, Plan: ${planConceptualId}, Mode: ${session.mode}`);

        if (session.mode === 'subscription' && session.subscription) {
          const stripeSubscriptionId = session.subscription as string;
          const subscriptionDetails = await stripe.subscriptions.retrieve(stripeSubscriptionId, { expand: ['items.data.price.product'] });
          const price = subscriptionDetails.items.data[0]?.price;
          const product = price?.product as Stripe.Product;

          // TODO: [ProjectDB] Call your function to create/update subscription in DB
          // await createNewSubscriptionRecord(internalUserId, stripeCustomerId, stripeSubscriptionId, subscriptionDetails.status, new Date(subscriptionDetails.current_period_end * 1000), price.id, product.id, planConceptualId);
          console.log(`[Stripe Webhook] TODO: DB - Create/Update subscription ${stripeSubscriptionId} for user ${internalUserId}, plan ${planConceptualId}`);
          
          // TODO: [ProjectLogic] Grant entitlements for this new subscription
          // await grantEntitlementsForPlan(internalUserId, planConceptualId);
          console.log(`[Stripe Webhook] TODO: Logic - Grant entitlements for user ${internalUserId}, plan ${planConceptualId}`);

        } else if (session.mode === 'payment' && session.payment_intent) {
          const paymentIntentId = session.payment_intent as string;
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
          const quantity = lineItems.data[0]?.quantity || 1;
          
          // TODO: [ProjectDB] Call your function to record one-time purchase
          // await recordOneTimePurchaseInDB(internalUserId, stripeCustomerId, paymentIntentId, planConceptualId, session.amount_total, session.currency, quantity);
          console.log(`[Stripe Webhook] TODO: DB - Record one-time purchase ${paymentIntentId} for user ${internalUserId}, plan ${planConceptualId}`);

          // TODO: [ProjectLogic] Grant entitlements for this one-time purchase
          // await grantEntitlementsForPlan(internalUserId, planConceptualId, quantity);
           console.log(`[Stripe Webhook] TODO: Logic - Grant entitlements for user ${internalUserId}, plan ${planConceptualId}, quantity ${quantity}`);
        }
        // TODO: (Server-Side GA4 Event) Track 'purchase' event using Measurement Protocol
        console.log("[Stripe Webhook] TODO: Send GA4 'purchase' event server-side.");
        // revalidatePath(process.env.CUSTOMER_PORTAL_RETURN_PATH || '/dashboard/billing'); // Example revalidation
        break;

      case 'invoice.payment_succeeded':
        const invoice = dataObject as Stripe.Invoice;
        if (invoice.billing_reason === 'subscription_cycle' || invoice.billing_reason === 'subscription_update') {
          const subId = invoice.subscription as string;
          const custId = invoice.customer as string;
          if (subId && custId) {
            const subscription = await stripe.subscriptions.retrieve(subId, { expand: ['items.data.price.product'] });
            const price = subscription.items.data[0]?.price;
            const product = price?.product as Stripe.Product;
            // const appUserId = await findUserByStripeCustomerId(custId); // Get your internal user ID
            // if (appUserId) {
            //   // TODO: [ProjectDB] Update local subscription record (period end, status)
            //   await updateUserSubscriptionStatus(appUserId, subId, subscription.status, new Date(subscription.current_period_end * 1000), price.id, product.id, subscription.cancel_at_period_end);
            //   console.log(`[Stripe Webhook] TODO: DB - Updated subscription ${subId} for user ${appUserId} on successful invoice.`);
            //   // TODO: [ProjectLogic] Ensure entitlements are still valid/renewed.
            // } else {
            //   console.error(`[Stripe Webhook] invoice.payment_succeeded: No internal user found for Stripe Customer ${custId}`);
            // }
            console.log(`[Stripe Webhook] TODO: Handle invoice.payment_succeeded for subscription ${subId}`);
          }
        }
        break;

      case 'invoice.payment_failed':
        const failedInvoice = dataObject as Stripe.Invoice;
        // TODO: [ProjectDB] Update subscription status (e.g., 'past_due'). Notify user.
        console.log(`[Stripe Webhook] TODO: Handle invoice.payment_failed for subscription ${failedInvoice.subscription}`);
        break;

      case 'customer.subscription.updated':
        const updatedSub = dataObject as Stripe.Subscription;
        // TODO: [ProjectDB] Update local subscription details (status, plan, period end, cancel_at_period_end). Adjust entitlements if plan changed.
        console.log(`[Stripe Webhook] TODO: Handle customer.subscription.updated for ${updatedSub.id}. New status: ${updatedSub.status}`);
        break;

      case 'customer.subscription.deleted': // Final deletion after period end if cancel_at_period_end was true, or immediate if deleted directly.
        const deletedSub = dataObject as Stripe.Subscription;
        // TODO: [ProjectDB] Mark local subscription as 'deleted'. Revoke access.
        console.log(`[Stripe Webhook] TODO: Handle customer.subscription.deleted for ${deletedSub.id}`);
        break;

      // Add other essential webhook events based on project needs.

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (error: any) {
    console.error(`[Stripe Webhook] Error processing event ${event.type} (ID: ${event.id}):`, error);
    return NextResponse.json({ error: 'Webhook handler failed processing the event.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
```

*(Cursor: Remind user to create this file at `src/app/api/stripe/webhooks/route.ts` (or equivalent for their backend framework) and to configure this endpoint URL in their Stripe Dashboard for both Test and Live modes. Also, stress the importance of implementing the `// TODO: [ProjectDB]` and `// TODO: [ProjectLogic]` parts with their specific database and business logic.)*

## ⑧. Local Database Schema Considerations

*(Cursor: Briefly guide the user on essential tables and fields for their chosen database. Focus on linking users to Stripe customers and managing subscriptions.)*

**Minimum Suggested Schema:**

**Users Table** (e.g., `users`):
- `id` (Internal User ID, PK)
- `email` (String, unique)
- `stripe_customer_id` (String, unique, nullable, indexed)
- ... other user fields ...

**Subscriptions Table** (e.g., `subscriptions`):
- `id` (PK, e.g., UUID for the record)
- `user_id` (FK to Users table)
- `stripe_subscription_id` (String, unique, indexed)
- `stripe_price_id` (String)
- `stripe_product_id` (String)
- `status` (String: "active", "trialing", "past_due", "canceled", "incomplete", "unpaid")
- `current_period_start` (Timestamp)
- `current_period_end` (Timestamp)
- `cancel_at_period_end` (Boolean)
- `trial_start` (Timestamp, nullable)
- `trial_end` (Timestamp, nullable)
- ... `created_at`, `updated_at` ...

**(Optional) One-Time Purchases Table** (e.g., `one_time_purchases`):
- `id` (PK)
- `user_id` (FK)
- `stripe_payment_intent_id` (String, unique, indexed)
- `stripe_product_id` (String)
- `plan_conceptual_id` (String) // From your `projectPlans.ts`
- `quantity` (Integer)
- `amount_total` (Integer, cents)
- `currency` (String)
- `status` (String: "succeeded", "pending")
- `purchased_at` (Timestamp)

*(Cursor: Advise the user to adapt this schema based on their specific needs, database conventions, and how they plan to manage entitlements.)*

## ⑨. Implement Customer Portal Access

*(Cursor: Guide the user to implement Stripe Customer Portal functionality. This involves a server-side action (from Step ⑤'s `actions.ts` template: `createStripeCustomerPortalSession`) and a frontend button to trigger it. This is the primary way users will manage existing subscriptions, including upgrades, downgrades, and cancellations, as per DreamScan's example.)*

**Steps:**

1. **Enable & Configure Customer Portal in Stripe Dashboard:**
   - Settings > Customer portal.
   - **Crucial:** Under "Functionality", configure "Subscription update" to allow customers to switch prices (plans). Select the products/prices they can switch between. This should align with the `allowedUpdatesProducts` logic in the `createStripeCustomerPortalSession` action if you use dynamic portal configurations.
   - Configure other features like payment method updates, invoice history, and cancellation options.
   - Set your branding and business information.
   - Specify the Default return URL (e.g., `{{YOUR_APP_URL_FROM_ENV}}${process.env.CUSTOMER_PORTAL_RETURN_PATH || '/dashboard/billing'}`).

2. **Server-Side Action:** Use/adapt the `createStripeCustomerPortalSession(internalUserId: string, targetPriceId?: string)` function from the `actions.ts` template created in Step ⑤.

3. **Frontend Button/Link:**
   - Add a "Manage Billing" or "Subscription Settings" button in your app's user account area.
   - When clicked (especially for plan changes):
     - Call your server action (e.g., `createStripeCustomerPortalSession`) possibly passing the `internalUserId` and the `targetPriceId` if the user selected a new plan they want to switch to on your site.
     - The server action will then redirect to the Stripe Customer Portal.

## ⑩. Security Best Practices 🛡️

*(Cursor: Remind the user of these critical security points.)*

- **Environment Variables:** Store secrets (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) in environment variables, never in code. Use `.env.local` for local development and ensure it's in `.gitignore`.
- **Webhook Signature Verification:** Mandatory. The webhook template includes this.
- **HTTPS:** Use HTTPS for your entire application and webhook endpoint in production.
- **Idempotency:** Design webhook handlers to be idempotent. Log event IDs and check for duplicates if necessary before processing.
- **Error Handling & Logging:** Implement robust error handling and use `console.log` (or a production logger) for Stripe interactions.

## ⑪. Testing Checklist ✅

*(Cursor: Provide this checklist for the user to go through.)*

- [ ] **Test Mode:** Verify all operations use Stripe Test Keys and Test Webhook Secret.
- [ ] **Products/Prices:** Ensure `projectPlans.ts` matches Stripe Dashboard (Test Mode) Product/Price IDs.
- [ ] **Checkout Flow** (Stripe Test Cards):
  - [ ] New one-time purchases.
  - [ ] New subscription sign-ups (monthly/yearly).
  - [ ] Test with declined cards.
  - [ ] Verify success/cancel URL redirects and query parameters.
- [ ] **Webhook Handling** (Stripe CLI `stripe listen --forward-to ...` or ngrok):
  - [ ] `checkout.session.completed`: DB records created/updated, entitlements granted.
  - [ ] `invoice.payment_succeeded`: Subscription renewed.
  - [ ] `customer.subscription.updated`: Plan changes, cancellations reflected.
  - [ ] `customer.subscription.deleted`: Access revoked.
  - [ ] Signature verification works.
- [ ] **Customer Portal** (for subscriptions):
  - [ ] Redirect to portal.
  - [ ] Change plan via portal (if configured).
  - [ ] Cancel subscription via portal.
  - [ ] Update payment method via portal.
  - [ ] Verify webhooks from portal actions update your app's DB.
- [ ] **Error Scenarios:** Test UI and backend responses to payment failures.

## ⑫. Going Live Checklist 🚀

*(Cursor: Remind the user of these steps before going live.)*

- [ ] Switch to Live Mode Stripe API Keys and Webhook Secret in production environment variables.
- [ ] Ensure Products and Prices in `projectPlans.ts` use Live Mode IDs.
- [ ] Verify Products and Prices are identically set up in Stripe Live mode.
- [ ] Update Webhook Endpoint URL in Stripe Live mode dashboard to production URL.
- [ ] Update all relevant URLs (return URLs in portal config, etc.) to production URLs.
- [ ] Perform a final end-to-end test with a real payment method in Live mode (can be refunded).
- [ ] Monitor Stripe Dashboard and server logs after launch.

## ⑬. Troubleshooting Common Issues

*(Cursor: List a few common troubleshooting tips.)*

- **Webhooks Not Received:** Check URL in Stripe, server deployment logs, firewall. Use Stripe Dashboard event logs.
- **Signature Verification Failed:** Ensure correct webhook secret for the environment, ensure raw request body is used.
- **Database Not Updating:** Check webhook handler logic, server logs for DB errors, idempotency.
- **Incorrect Amounts/Plans:** Verify Price IDs used in checkout session and portal configurations.