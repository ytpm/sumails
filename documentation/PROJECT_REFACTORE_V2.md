# Sumails Refactor Plan v3

### Instructions for Cursor AI
* **Execution Mode:** We will proceed step-by-step. Execute one phase at a time and await approval before proceeding to the next.
* **Scope Limitation:** Do not make any changes to the main marketing website located under `/src/app/(main)`. All modifications must be focused on the user authentication and account center functionality only.

---

## Prerequisites: Dependencies 📦

* **Install Libraries**: If not already present, add `react-hook-form`, `zod`, and the resolver to your project.
    ```bash
    npm install react-hook-form zod @hookform/resolvers
    ```

---

## Phase 1: Project Cleanup & Reorganization 🧹

This phase removes the dashboard-centric UI and old data-handling logic.

### File Deletion

* **Delete Directory**: `src/app/dashboard`
    * Remove the entire dashboard, as its pages and components are no longer needed.
* **Delete Obsolete APIs**:
    * `src/app/api/digests/`: Delete the `by-date` and `today` API routes.
    * `src/app/api/processing-log/`: This route for the JSON-based log is no longer needed.
    * `src/app/api/auth/accounts/`: Delete the `all`, `disconnect`, and main routes, as Supabase will now manage this data.
* **Delete Local Data**:
    * `src/data/`: Delete this entire directory containing the `.json` database files.
* **Delete Unused Types**:
    * `src/types/api.ts`: These types were for the old JSON-based API routes.
    * `src/types/hooks.ts`: This contained types for the now-deleted `usePageInfo` hook.

### File Renaming & Restructuring

* **Rename Directory**: Rename `src/app/account/connected-emails` to `src/app/account/connected-accounts`.
* **Rename Context**: Rename `src/contexts/AuthContext.tsx` to `src/contexts/auth-context.tsx`.
* **Create Directory**: `src/app/components/`
    * Create this folder to house all client-side components that will be rendered by server-side `page.tsx` files.
* **Create Directory**: `src/schema/`
    * Create this folder to store all Zod validation schemas.

### Files to Keep

* **Verify File**: `src/types/auth.ts`
    * Keep this file, as it contains the necessary types for handling Google OAuth credentials for connected accounts.

---

## Phase 2: Core Providers & Schemas 🛠️

This phase focuses on setting up the core logic for authentication and form validation.

* **Adjust File**: `src/contexts/auth-context.tsx`
    * Verify and adjust the existing `AuthContext` to provide the user session, loading states, and auth methods (`signInWithPassword`, `signUp`, `signOut`), simplifying it by removing any logic not currently required (e.g., SWR, subscriptions).
* **Modify File**: `src/app/layout.tsx`
    * Wrap the main layout's children with the `AuthProvider` to make the authentication state globally available.
* **Create File**: `src/schema/auth-schemas.ts`
    * Create and export Zod schemas for your authentication forms: `LoginSchema`, `SignupSchema`, `ResetPasswordSchema`, and `UpdatePasswordSchema`.

---

## Phase 3: Authentication Flow (Server/Client Pattern) 🚪

Rebuild the authentication pages using the mandated server/client component pattern.

* **Create Page**: `src/app/auth/login/page.tsx`
    * Create this server component to render the client-side login form.
* **Create Component**: `src/app/components/auth/LoginClient.tsx`
    * Implement the client component with a login form using `react-hook-form` and `zod`, calling the `signInWithPassword` method from the `useAuth` hook on submit.
* **Create Page**: `src/app/auth/signup/page.tsx`
    * Create this server component to render the client-side signup form.
* **Create Component**: `src/app/components/auth/SignupClient.tsx`
    * Implement the client component with a signup form, calling the `signUp` method from the `useAuth` hook on submit.
* **Create Page**: `src/app/auth/reset-password/page.tsx`
    * Create this server component to render the client-side password reset form.
* **Create Component**: `src/app/components/auth/ResetPasswordClient.tsx`
    * Implement the client component with a form to request a password reset link.
* **Create Page**: `src/app/auth/update-password/page.tsx`
    * Create this protected server component for rendering the update password form.
* **Create Component**: `src/app/components/auth/UpdatePasswordClient.tsx`
    * Implement the client component with a form for logged-in users to update their password.
* **Create Page**: `src/app/auth/check-email/page.tsx`
    * Create a simple static page that informs the user to check their email for a verification link after signing up.

---

## Phase 4: Refactor Account Pages & Main Layout ⚙️

Update the main header and account pages to use the new authentication system and component structure.

* **Modify File**: `src/components/layout/Header.tsx`
    * Refactor the header to be a client component that uses the `useAuth` hook to conditionally display "Log In/Sign Up" buttons or a "My Account" link.
* **Modify File**: `src/app/(main)/layout.tsx`
    * Update this layout to render the client-side `Header` component.
* **Create Page**: `src/app/account/settings/page.tsx`
    * Create this protected server component that fetches any necessary user data and renders the `SettingsClient` component.
* **Create Component**: `src/app/components/account/SettingsClient.tsx`
    * Build the new settings UI for managing notification preferences and providing a link to the `Connected Accounts` page.
* **Create Page**: `src/app/account/connected-accounts/page.tsx`
    * Create this protected server component that fetches the user's connected accounts from Supabase and passes them to the client component.
* **Create Component**: `src/app/components/account/ConnectedAccountsClient.tsx`
    * Implement the UI to list connected accounts from the passed props and handle the Google OAuth connection/disconnection flows.

---

## Phase 5: Backend & Automation 🔄

Finalize the backend endpoints for Google OAuth and the daily cron job.

* **Modify API Route**: `src/app/api/auth/callback/route.ts`
    * Refactor this route to securely handle the Google OAuth callback, saving tokens to the `connected_accounts` table in Supabase against the logged-in user's ID.
* **Create Cron Job Endpoint**: `src/app/api/cron/process-daily-digests/route.ts`
    * Implement the cron job logic that will be triggered daily to fetch all accounts from Supabase and orchestrate the email summarization process for each.
* **Create File**: `vercel.json` (at the project root)
    * Define the schedule (e.g., `"0 13 * * *"`) for your Vercel Cron Job to call the `/api/cron/process-daily-digests` endpoint.