# Sumails - Intelligent Email Assistant

Sumails is a web application designed to help users manage their Gmail inboxes more effectively by providing AI-powered daily summaries, insights, and organizational tools. It connects securely to users' Gmail accounts and uses OpenAI's GPT models to analyze email content and generate concise, actionable summaries.

## Table of Contents

- [Sumails - Intelligent Email Assistant](#sumails---intelligent-email-assistant)
  - [Table of Contents](#table-of-contents)
  - [Key Features](#key-features)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Environment Variables](#environment-variables)
    - [Installation](#installation)
    - [Running the Development Server](#running-the-development-server)
    - [Building for Production](#building-for-production)
  - [Core Functionality](#core-functionality)
    - [Authentication](#authentication)
    - [Mailbox Connection](#mailbox-connection)
    - [Email Summarization](#email-summarization)
    - [Notification System](#notification-system)
    - [Subscription Management](#subscription-management)
    - [User Settings](#user-settings)
    - [Cron Jobs](#cron-jobs)
  - [API Endpoints](#api-endpoints)
    - [Authentication \& OAuth:](#authentication--oauth)
    - [Mailboxes:](#mailboxes)
    - [Summaries:](#summaries)
    - [Notifications:](#notifications)
    - [SMS (Twilio - for WhatsApp):](#sms-twilio---for-whatsapp)
    - [Cron Jobs:](#cron-jobs-1)
  - [Contributing](#contributing)
  - [License](#license)

## Key Features

* **Secure User Authentication**: Email/password sign-up and login, password reset, and secure session management via Supabase Auth.
* **Gmail Integration**: Securely connect multiple Gmail accounts using OAuth 2.0. Access tokens are refreshed automatically.
* **AI-Powered Daily Summaries**: Leverages OpenAI (e.g., GPT-4o) to generate daily email summaries including:
    * An overview of inbox activity.
    * Actionable insights.
    * A list of important emails with reasons for their importance.
    * An overall inbox health status (`attention_needed`, `worth_a_look`, `all_clear`).
    * Suggestions for inbox cleanup.
* **Multiple Account Support**: Different subscription tiers allow users to connect one or more Gmail accounts.
* **Summary History**: Users can view past summaries for their connected accounts.
* **Configurable Summary Preferences**: Users can set their preferred time, timezone, and summary tone (friendly, professional, concise).
* **Notification System**: Delivers summaries via Email and WhatsApp (currently console-logged placeholders, requires integration with actual sending services). Notifications are triggered based on summary status.
* **Subscription Tiers**: Free, Pro, and Business plans with varying features and limits (Stripe integration is placeholder).
* **User Settings Management**: Comprehensive settings page for profile information, notification preferences, and summary delivery options.
* **Automated Daily Summaries**: Cron jobs ensure summaries are generated automatically at user-specified times.
* **Token Management**: Automatic refresh of expired Google OAuth tokens.
* **Responsive Design**: UI built with Tailwind CSS and shadcn/ui for a modern, responsive experience.

## Tech Stack

* **Framework**: Next.js 14+ (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS, shadcn/ui, Radix UI, `clsx`, `tailwind-merge`, `tailwindcss-animate`
* **State Management**: React Context API (for Auth), Custom React Hooks (`use-auth`, `use-settings`, `usePageInfo`)
* **Forms**: React Hook Form with Zod for schema validation
* **Backend & Database**: Supabase (Authentication, PostgreSQL Database, Edge Functions implicitly via API routes)
* **AI Integration**: OpenAI API (GPT-4o)
* **Email Service Integration**: Google API (Gmail API, Google OAuth 2.0)
* **Notification Service (Placeholder)**: Twilio API (for SMS/WhatsApp, API route exists, actual sending needs implementation)
* **Animations**: Framer Motion
* **Logging**: Custom logger utility
* **Deployment**: (Assumed Vercel or similar platform supporting Next.js and cron jobs)

## Project Structure

The project follows a standard Next.js App Router structure:

├── next-env.d.ts
├── tailwind.config.ts
├── next.config.ts
├── middleware.ts
├── src/
│   ├── app/                        # Next.js App Router (pages, layouts, API routes)
│   │   ├── (main)/                 # Routes for the main marketing site (e.g., homepage)
│   │   ├── account/                # User account specific pages (settings, mailboxes)
│   │   ├── auth/                   # Authentication pages (login, signup, etc.)
│   │   ├── api/                    # API route handlers
│   │   │   ├── auth/
│   │   │   ├── mailboxes/
│   │   │   ├── summaries/
│   │   │   ├── notifications/
│   │   │   ├── cron/
│   │   │   └── send-sms/
│   │   ├── globals.css
│   │   └── layout.tsx              # Root layout
│   ├── components/                 # React components
│   │   ├── ui/                     # Reusable UI elements (from shadcn/ui)
│   │   ├── home/                   # Components for marketing pages
│   │   ├── auth/                   # Authentication flow components
│   │   ├── account/                # Account management UI components
│   │   ├── dashboard/              # Dashboard layout and specific view components
│   │   └── dialogs/                # Dialog components
│   ├── contexts/                   # React Context providers (e.g., AuthContext)
│   ├── data/                       # Static data (e.g., subscription plans)
│   ├── hooks/                      # Custom React Hooks
│   ├── lib/                        # Core libraries and services
│   │   ├── google/                 # Google API interaction logic
│   │   ├── logger/                 # Logging utility
│   │   ├── openai/                 # (Legacy) OpenAI interaction logic
│   │   └── services/               # Main business logic services (email fetching, summary generation, etc.)
│   ├── providers/                  # Theme and other global providers
│   ├── schema/                     # Zod validation schemas
│   ├── types/                      # TypeScript type definitions (Supabase, email, etc.)
│   └── utils/                      # Utility functions and Supabase client setup
├── public/                         # Static assets
└── README.md

## Getting Started

### Prerequisites

* Node.js (v18.x or later recommended)
* npm, yarn, or pnpm
* Supabase Account (for database and authentication)
* Google Cloud Platform Project (for Gmail API and OAuth 2.0 credentials)
* OpenAI API Key
* Twilio Account (optional, for actual WhatsApp/SMS notifications)

### Environment Variables

Create a `.env.local` file in the root of the project and populate it with the necessary environment variables. See `.env.example` (if provided) or the list below:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key # For admin operations

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000 # Change for production
APP_NAME="Sumails"

# Twilio (Optional - for WhatsApp/SMS notifications)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number # WhatsApp enabled sender

# Cron Jobs
CRON_SECRET=a_secure_random_string_for_cron_job_authorization

# Logging (optional, defaults exist)
# LOG_LEVEL=DEBUG # or WARN, ERROR, INFO
```

**Important:**

* Ensure your Supabase database schema matches the types defined in `src/types/supabase.ts`. You might need to run SQL migrations.
* Configure Google OAuth consent screen and add `NEXT_PUBLIC_SITE_URL/api/auth/callback` as an authorized redirect URI.
* Enable the Gmail API in your Google Cloud Platform project.

### Installation

Clone the repository:

```bash
git clone <repository_url>
cd sumails-project
```

Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at `http://localhost:3000` (or the `NEXT_PUBLIC_SITE_URL`).

### Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

## Core Functionality

### Authentication

Handled by Supabase Auth. Includes:

* Email/Password Sign up (`src/components/auth/SignupClient.tsx`)
* Login (`src/components/auth/LoginClient.tsx`)
* Password Reset (`src/components/auth/ResetPasswordClient.tsx`)
* Update Password (`src/components/auth/UpdatePasswordClient.tsx`)
* Session management via middleware (`src/middleware.ts` and `src/utils/supabase/middleware.ts`)
* AuthContext (`src/contexts/auth-context.tsx`) provides auth state and functions throughout the app.

### Mailbox Connection

* Uses Google OAuth 2.0 to connect Gmail accounts.
* OAuth flow is initiated via `POST /api/mailboxes` which redirects to Google.
* Callback is handled by `GET /api/auth/callback` which saves tokens and user info to the `connected_accounts` table.
* Tokens are refreshed automatically by `src/lib/services/mailboxes.ts` when they expire.
* Users can manage connected mailboxes via the UI at `/account/mailboxes`.

### Email Summarization

This is the core feature, orchestrated by `src/lib/services/summary-orchestrator.ts`.

* **Fetching Emails**: `src/lib/services/email-fetcher.ts` uses `src/lib/google/actions.ts` to fetch emails from Gmail for a specified period (e.g., "today", "initial_setup" for last 2 days). It prioritizes fetching full email content for better AI analysis.
* **Generating Summary**: `src/lib/services/summary-generator.ts` takes the fetched emails, formats them, and sends them to the OpenAI API (GPT-4o by default, configured in `src/config/index.ts`) with a detailed system prompt.
* **Validation & Storage**: The JSON response from OpenAI is validated against a Zod schema (`src/schema/summary-schemas.ts`). The validated summary data is then stored in the `email_summaries` table in Supabase via `src/lib/services/summaries.ts`.
* **Duplicate Prevention**: By default, the system checks if a summary for a given account and date already exists (`summaryExistsForDate`) to prevent re-processing, unless `forceRegenerate` is true.
* **Initial Summary**: When a new mailbox is connected, `triggerInitialSummary` is called to generate a summary for the past couple of days.

### Notification System

Managed by `src/lib/services/notifications.ts`.

* Designed to send notifications (Email, WhatsApp) when summaries are generated, especially if they require attention.
* Currently, actual sending is placeholder console logs. Twilio API integration (`POST /api/send-sms`) is set up for WhatsApp but needs full implementation.
* Users can configure notification preferences in their settings.
* A test endpoint `POST /api/notifications/test` allows testing the notification flow with an existing summary.

### Subscription Management

* Defined in `src/data/subscription-plans.ts` with Free, Pro, and Business tiers.
* Subscription status is fetched via AuthContext and `src/lib/services/settings.ts` (`getSubscriptionData`).
* The UI reflects the current plan (e.g., in `/account/settings`).
* Actual payment processing and Stripe integration are placeholders.

### User Settings

Located at `/account/settings` and managed by `src/hooks/use-settings.ts` and `src/lib/services/settings.ts`.

* **Account Information**: Basic user details.
* **Summary Settings**: Preferred delivery time, timezone, summary tone (Professional, Friendly, Concise), and delivery channels (Email, WhatsApp). WhatsApp requires phone verification (`src/components/account/settings/PhoneVerification.tsx`).
* **Notification Preferences**: Toggle product updates and marketing emails.
* **Subscription Management**: View current plan and manage subscription (placeholder actions).
* **Security**: Change password.
* **Account Deletion**: Option to delete account (confirmation dialog included).

### Cron Jobs

API routes designed to be triggered by external cron services (e.g., Vercel Cron Jobs, GitHub Actions Scheduler).

* **`GET /api/cron/daily-summaries?time=HH:MM:`**
  * Protected by `CRON_SECRET`.
  * Fetches users whose preferred summary time (converted to UTC) matches the `targetTime` query parameter.
  * Calls `generateAllAccountSummaries` to process summaries for eligible users.
  * Uses `shouldReceiveSummaryAtTime` helper for timezone conversions.
* **`GET /api/cron/analyze-coverage:`**
  * Protected by `CRON_SECRET`.
  * Analyzes user settings to determine how many users are covered by the current cron schedule and provides recommendations.

## API Endpoints

### Authentication & OAuth:
* `GET /api/auth/url`: Provides the Google OAuth2 URL for initiating Gmail connection.
* `GET /api/auth/callback`: Handles the OAuth2 callback from Google after user authorization.

### Mailboxes:
* `GET /api/mailboxes`: Fetches all connected mailboxes for the authenticated user.
* `POST /api/mailboxes`: Initiates the OAuth flow to connect a new mailbox.
* `POST /api/mailboxes/refresh-tokens`: Refreshes OAuth tokens for all mailboxes of the authenticated user.
* `DELETE /api/mailboxes/[id]`: Disconnects a specific mailbox.
* `POST /api/mailboxes/[id]/sync`: Tests the connection to a specific mailbox by fetching a few emails.

### Summaries:
* `GET /api/summaries`: Retrieves the summary status for all accounts of the authenticated user.
* `POST /api/summaries`: Generates summaries for all or a specific account of the authenticated user. Allows `forceRegenerate`.
* `GET /api/summaries/[accountId]`: Fetches summaries for a specific connected account (supports pagination and `latest=true`).
* `POST /api/summaries/[accountId]`: Generates a summary for a specific account.

### Notifications:
* `GET /api/notifications/test`: Lists accounts available for notification testing.
* `POST /api/notifications/test`: Sends a test notification for a specified account and method (email/whatsapp).

### SMS (Twilio - for WhatsApp):
* `POST /api/send-sms`: Endpoint to send SMS via Twilio. Used for WhatsApp verification codes.

### Cron Jobs:
* `GET /api/cron/daily-summaries`: Triggered externally to generate daily summaries for users based on their preferred time. Requires `time` query param and `CRON_SECRET`.
* `GET /api/cron/analyze-coverage`: Triggered externally to analyze cron job coverage of users. Requires `CRON_SECRET`.

## Contributing

Contributions are welcome! Please follow these general guidelines:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes with clear and descriptive messages.
4. Push your branch and open a pull request.
5. Ensure your code adheres to the existing style and passes any linting checks.

(Consider adding more specific contribution guidelines, like running tests, code style, etc., if applicable.)

## License

(Specify your license here, e.g., MIT, Apache 2.0. If no license is chosen, it's proprietary.)

---

This README provides a good starting point. You can expand on sections like "Supabase Setup," "Deployment," or add a "Troubleshooting" section as the project evolves.