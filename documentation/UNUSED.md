# Unused Code Analysis

This document lists all unused classes, functions, components, and files found in the Sumails project codebase. Each item includes a description of its purpose and why it's considered unused.

**Analysis Date:** December 2024  
**Project:** Sumails - Email Summarization Service

---

## 🗑️ Files to Delete

### UI Components (Unused)

#### `src/components/ui/floating-toc.tsx`
**What it does:** A floating table of contents component that displays navigation items in a floating sidebar. Includes smooth scrolling functionality and responsive design.

**Why unused:** The `FloatingToc` component is exported but never imported or used anywhere in the application. No references found in any component files.

**Functions:**
- `FloatingToc({ items, className })` - Main component for rendering floating table of contents

---

#### `src/components/ui/select.tsx`
**What it does:** A custom select dropdown component built with React context. Provides accessible select functionality with trigger, content, and item components.

**Why now used:** The Select components are now imported and used in the SettingsClient component for summary settings (timezone, preferred time, and tone selection). ✅ **NOW USED**

**Components:**
- `Select` - Main select container component ✅ **NOW USED**
- `SelectTrigger` - Clickable trigger element ✅ **NOW USED**
- `SelectValue` - Displays selected value ✅ **NOW USED**
- `SelectContent` - Dropdown content container ✅ **NOW USED**
- `SelectItem` - Individual option items ✅ **NOW USED**

**Usage:**
- Used in `src/components/account/SettingsClient.tsx` for summary settings configuration ✅ **NEWLY IMPLEMENTED**

---

### Provider Components (Unused)

#### `src/providers/themes/ThemeProvider.tsx`
**What it does:** A theme provider wrapper around Next.js themes that enables theme switching functionality.

**Why unused:** Only `LightThemeProvider` is used throughout the application. This generic `ThemeProvider` is never imported.

**Functions:**
- `ThemeProvider({ children })` - Provides theme context to child components

---

### Utility Libraries (Unused)

#### `src/lib/email-utils.ts`
**What it does:** Utility functions for processing and organizing email data, including grouping emails by date and creating daily digests.

**Why unused:** Neither exported function is imported anywhere in the codebase. The functionality appears to be handled elsewhere.

**Functions:**
- `groupEmailsByDate(emails)` - Groups an array of emails by their date (YYYY-MM-DD format)
- `createDailyDigest(userId, accountEmail, targetDate)` - Creates a daily email digest by fetching and summarizing emails for a specific date

---

### Legacy Google Credentials (Still Unused)

#### `src/lib/google/credentials.ts`
**What it does:** Legacy credential management system that stores Google OAuth tokens in JSON files. Provides functions for saving, loading, and refreshing Google API credentials.

**Why still unused:** This appears to be an old file-based credential system. Only 2 functions are used in one API route (`/api/emails/summarize`) which itself might be unused. The main application now uses Supabase for credential storage via `src/lib/mailboxes/service.ts`.

**Functions:**
- `getUserInfo(accessToken)` - Fetches user profile information from Google API ❌ **UNUSED**
- `saveCredentials(tokens, userInfo)` - Saves OAuth credentials to JSON file ❌ **UNUSED**
- `loadCredentials(userId, email)` - Loads credentials for specific user/email ❌ **UNUSED**
- `loadUserAccounts(userId)` - Loads all accounts for a user ❌ **UNUSED**
- `isTokenExpired(account)` - Checks if OAuth token is expired ⚠️ **USED** (in legacy summarize API)
- `refreshAccessToken(account)` - Refreshes expired OAuth tokens ⚠️ **USED** (in legacy summarize API)
- `getValidCredentials(userId, email)` - Gets valid credentials, refreshing if needed ❌ **UNUSED**

**Note:** The token refresh functionality is now properly implemented in the current Supabase-based system at `src/lib/mailboxes/service.ts`.

---

## 🔧 Partially Unused Code

### Google Actions (Partially Unused)

#### `src/lib/google/actions.ts`
**What it does:** Comprehensive Gmail API service with various email fetching and processing functions.

**Used Functions:**
- `getGmailAuthUrl()` - Used in `/api/auth/url/route.ts`
- `fetchGmailEmails()` - Used in `/api/emails/route.ts`
- `fetchTodaysEmailsWithContent()` - Used in multiple API routes

**Unused Functions:**
- `gmailService` - Gmail service instance ❌ **UNUSED**
- `setGmailCredentials(code)` - Sets credentials from OAuth code ❌ **UNUSED**
- `listEmailsToConsole(accessToken, maxResults, query)` - Debug function that logs emails to console ❌ **UNUSED**
- `listTodaysEmailsWithContentToConsole(accessToken, maxResults)` - Debug function for today's emails ❌ **UNUSED**
- `fetchEmailsFromPeriod(accessToken, days, maxResults)` - Fetches emails from a specific time period ❌ **UNUSED**

---

### Mailboxes Service (Actively Used)

#### `src/lib/mailboxes/service.ts`
**What it does:** Current Supabase-based mailbox and token management service.

**Used Functions:**
- `getUserMailboxes()` - Used in `/api/connected-accounts/route.ts` and mailboxes page
- `saveConnectedMailbox()` - Used in OAuth callback
- `deleteConnectedMailbox()` - Used in `/api/connected-accounts/[id]/route.ts`
- `isTokenExpired()` - Used in `/api/connected-accounts/refresh-tokens/route.ts` and MailboxesClient ✅ **NOW USED**
- `refreshAccessToken()` - Used in `/api/connected-accounts/refresh-tokens/route.ts` and MailboxesClient ✅ **NOW USED**
- `getValidCredentials()` - Used for getting valid credentials with automatic refresh ✅ **NOW USED**

**New API Endpoint:**
- `/api/connected-accounts/refresh-tokens` - POST endpoint that refreshes all expired tokens for authenticated user ✅ **NEWLY CREATED**

**Integration:**
- `MailboxesClient` component now automatically checks and refreshes expired tokens on load ✅ **NEWLY IMPLEMENTED**
- Manual "Refresh Tokens" button added to the mailboxes interface ✅ **NEWLY IMPLEMENTED**

---

## 🚨 Potentially Unused API Routes

### Email Summarization API

#### `src/app/api/emails/summarize/route.ts`
**What it does:** API endpoint for summarizing emails using OpenAI. Supports both single account and multi-account processing with force reprocessing options.

**Why potentially unused:** This route uses the legacy JSON file-based credential system. The main application appears to use a different summarization flow through the Supabase-based system.

**Functions:**
- `POST /api/emails/summarize` - Main endpoint for email summarization
- `processAllAccountsForUser(userId, forceReprocess)` - Processes all accounts for a user
- `processSingleAccount(accessToken, accountEmail, userId)` - Processes a single account
- `loadAccountCredentials(userId, email)` - Loads credentials from JSON files

---

#### `src/app/api/emails/route.ts`
**What it does:** Simple API endpoint for fetching Gmail emails with basic parameters.

**Why potentially unused:** This is a basic email fetching endpoint that might be superseded by more specific endpoints.

**Functions:**
- `GET /api/emails` - Fetches emails with optional query and maxResults parameters

---

## 📁 Empty Directories

### `src/constants/`
**What it was for:** Intended to store application constants and configuration values.

**Why unused:** Directory is completely empty with no files.

---

### `src/app/api/migration/`
**What it was for:** Intended for database migration API endpoints.

**Why unused:** Directory is completely empty with no files.

---

## 🐛 Missing Dependencies

### `src/types/hooks.ts`
**What it should contain:** Type definitions for custom React hooks.

**Why missing:** The file is imported in `src/hooks/usePageInfo.ts` but doesn't exist, causing a TypeScript error.

**Expected content:**
```typescript
export interface PageInfo {
  title: string
  description: string
}
```

---

## 📊 Cleanup Recommendations

### Immediate Safe Deletions
```bash
# Delete unused UI components
rm src/components/ui/floating-toc.tsx

# Delete unused provider
rm src/providers/themes/ThemeProvider.tsx

# Delete unused utility
rm src/lib/email-utils.ts

# Delete empty directories
rmdir src/constants
rmdir src/app/api/migration
```

### Conditional Deletions (Verify API Usage First)
1. Check if these API routes are called by the frontend:
   - `src/app/api/emails/summarize/route.ts`
   - `src/app/api/emails/route.ts`

2. If unused, also delete:
   - `src/lib/google/credentials.ts`

### Code Cleanup in Existing Files
1. **Remove unused exports from `src/lib/google/actions.ts`:**
   - `gmailService`
   - `setGmailCredentials`
   - `listEmailsToConsole`
   - `listTodaysEmailsWithContentToConsole`
   - `fetchEmailsFromPeriod`

2. **Create missing type file `src/types/hooks.ts`**

### Estimated Impact
- **Files to delete:** 6 files
- **Directories to remove:** 2 empty directories
- **Functions to remove:** ~10 unused exported functions
- **Size reduction:** ~15-20KB of unused code
- **Benefits:** Cleaner codebase, reduced bundle size, easier maintenance

---

## 🔍 Analysis Methodology

This analysis was conducted by:
1. Scanning all `export` statements in TypeScript files
2. Cross-referencing with `import` statements to find usage
3. Checking for string references to function/component names
4. Identifying empty directories and missing dependencies
5. Verifying API route usage patterns

**Note:** Before deleting any code, especially API routes, verify they are not called by external services or frontend code that might not be immediately apparent in the static analysis.