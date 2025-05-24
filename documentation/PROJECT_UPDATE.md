## Sumails Project Update Instructions

Here are the detailed instructions to update the Sumails project.

**Phase 1: Update OpenAI Summarization Logic & Related Types**

This is foundational as many other changes depend on the new AI output structure.

1.  **Update OpenAI System Prompt and Zod Schema:**
    * **File:** `./src/lib/openai/summarizeEmails.ts`
    * **Action:**
        * Replace the existing `systemPrompt` variable with the new system prompt you provided:
            ```javascript
            const systemPrompt = `You are an AI email assistant helping the user manage their Gmail inbox. You have access to the full content of all emails received today. Your job is to make sense of the inbox, surface what’s important, and reduce the user's cognitive load.

            Perform the following:

            1. **Overview (bullet points)**
               Create 3 to 5 short bullet points that give a quick overview of today’s inbox activity. Include:
               - Number of emails received (e.g., "Received 28 emails today")
               - Number of important or actionable messages (e.g., "2 important messages flagged")
               - Topics or categories observed (e.g., "Topics: billing, platform updates, newsletters")

            2. **Insight**
               Write one short sentence summarizing your assessment of today’s inbox. Be specific and helpful. (e.g., "Security alerts were present, but no immediate action is needed.")

            3. **Important Emails**
               Highlight up to 5 emails that deserve attention. Prioritize:
               - Urgent action items
               - Security alerts, billing issues
               - Replies needing follow-up
               - Anything time-sensitive or critical

               For each, return:
               - \`subject\`
               - \`sender\`
               - \`reason\` (why it's important)

            4. **Inbox Health Status**
               Classify the inbox into one of the following:
               - \`"attention_needed"\`: contains urgent or important emails
               - \`"worth_a_look"\`: moderate relevance, some things to review
               - \`"all_clear"\`: nothing important today

            5. **Suggestions for Cleanup**
               Suggest up to 3 actions the user can take to reduce clutter or improve inbox hygiene. Focus on patterns in senders, email types, or repeated content. (e.g., "Unsubscribe from Bolt, GetTaxi, and Uber Eats promotions")

            Return your output in the following JSON format:

            \`\`\`json
            {
              "overview": ["string", "string", "string"],
              "insight": "string",
              "important_emails": [
                {
                  "subject": "string",
                  "sender": "string",
                  "reason": "string"
                }
              ],
              "inbox_status": "attention_needed" | "worth_a_look" | "all_clear",
              "suggestions": ["string", "string", "string"]
            }
            \`\`\`
            `;
            ```
        * Update the Zod schema `EmailSummaryGeneratedContentSchema` to match the new JSON structure:
            ```javascript
            export const EmailSummaryGeneratedContentSchema = z.object({
                overview: z.array(z.string()).min(3).max(5).describe('3 to 5 short bullet points about inbox activity'),
                insight: z.string().describe('One short sentence AI assessment of the inbox'),
                important_emails: z.array(
                    z.object({
                        subject: z.string().describe('The subject of the important email'),
                        sender: z.string().describe('The sender of the important email'),
                        reason: z.string().describe('Why this email is important'),
                    })
                ).max(5).describe('Up to 5 important emails with subject, sender, and reason'),
                inbox_status: z.enum(['attention_needed', 'worth_a_look', 'all_clear']).describe('The general state of the inbox based on email content'),
                suggestions: z.array(z.string()).max(3).optional().describe('Up to 3 optional inbox cleanup suggestions'),
            });
            ```

2.  **Update TypeScript Interfaces:**
    * **File:** `./src/types/email.ts`
    * **Action:**
        * Modify the `EmailDigest` interface (currently in `src/app/dashboard/today-summary/page.tsx`, should be moved to `src/types/email.ts` for global use if not already there) to align with the new Zod schema.
            ```typescript
            // Gmail message structure (remains the same)
            export interface GmailMessage {
                id: string;
                threadId: string;
                snippet: string;
                subject: string;
                from: string;
                date: string; // ISO timestamp
                labels: string[];
            }

            // Enhanced Gmail message with full content (remains the same)
            export interface GmailMessageWithContent extends GmailMessage {
                textContent?: string;
                htmlContent?: string;
                bodyPreview: string; // Best available content for AI processing
            }

            // Summarized message metadata stored in JSON (remains the same)
            export interface SummarizedMessage {
                id: string;
                accountId: string;
                summarized_at: string;
            }

            // Cleaned message structure for OpenAI summarization (can be removed or kept if used elsewhere, but less critical now)
            export interface CleanedMessage {
                id: string;
                subject: string;
                from: string;
                date: string;
                snippet: string;
            }

            // Enhanced cleaned message for OpenAI with full content (can be removed or kept, less critical)
            export interface CleanedMessageWithContent extends CleanedMessage {
                textContent?: string;
                htmlContent?: string;
                bodyPreview: string;
            }

            // NEW/UPDATED EmailDigest interface
            export interface EmailDigest {
                id: string; // Unique ID for the digest
                userId: string;
                accountId: string; // Email address of the account
                date: string; // YYYY-MM-DD format
                created_at: string; // ISO timestamp of when the digest was created

                // Fields from the new AI output
                overview: string[];
                insight: string;
                important_emails: Array<{
                    subject: string;
                    sender: string;
                    reason: string;
                }>;
                inbox_status: 'attention_needed' | 'worth_a_look' | 'all_clear';
                suggestions?: string[];
            }
            ```
    * **File:** `./src/app/dashboard/today-summary/page.tsx`
    * **Action:** Update the `EmailDigest` interface within this file to match the one defined in `src/types/email.ts`. Also update `TodayDigestWithAccount` accordingly.
        ```typescript
        // At the top of the file, import the new EmailDigest type
        import type { EmailDigest } from '@/types/email'; // Adjust path if necessary

        // ... (keep existing imports)

        // Update TodayDigestWithAccount to use the new EmailDigest
        interface TodayDigestWithAccount {
            digest: EmailDigest; // Use the imported/updated EmailDigest type
            accountEmail: string;
            isExpired: boolean; // This might relate to token expiry, not digest expiry. Clarify if needed.
        }
        ```

3.  **Update `summarizeAndStoreEmails` Function:**
    * **File:** `./src/lib/openai/summarizeEmails.ts`
    * **Action:**
        * Ensure the function correctly maps the fields from the `validatedContent` (which is parsed from OpenAI's JSON response using the new `EmailSummaryGeneratedContentSchema`) to the new `EmailDigest` structure when creating `newDigest`.
            ```javascript
            // Inside summarizeAndStoreEmails function, after validating content:
            // ...
            const validatedContent = EmailSummaryGeneratedContentSchema.parse(parsedContent);

            // Step 7: Create digest object
            const digestId = nanoid();
            const currentTimestamp = new Date().toISOString();

            const newDigest: EmailDigest = { // Ensure this matches the updated EmailDigest interface
                id: digestId,
                userId: actualUserId,
                accountId: actualAccountEmail,
                date: currentTimestamp.split('T')[0], // ISO date string (YYYY-MM-DD)
                created_at: currentTimestamp,

                // Map new fields from validatedContent
                overview: validatedContent.overview,
                insight: validatedContent.insight,
                important_emails: validatedContent.important_emails,
                inbox_status: validatedContent.inbox_status,
                suggestions: validatedContent.suggestions, // This is optional
            };

            // ... (rest of the function: writing to email_digests.json, summarized_messages.json)
            // Update console logs to reflect new fields if necessary
            console.log(`📊 Inbox Status: ${validatedContent.inbox_status}`);
            console.log(`⭐ Important Emails: ${validatedContent.important_emails.length}`);
            console.log(`💡 Suggestions: ${validatedContent.suggestions?.join(', ') || 'None'}`);
            // Remove old console logs for 'status', 'highlights', 'summary' if they are different.
            ```

**Phase 2: Connected Emails Page & Workflow Updates**

The purpose of this page is now solely to connect/disconnect accounts. Summarization for a newly added account happens immediately upon connection.

1.  **Update UI for `ConnectedEmailsPage`:**
    * **File:** `./src/app/dashboard/connected-emails/page.tsx`
    * **Action:**
        * **Remove "Select" Functionality:**
            * Delete the `selectedAccount` and `accessToken` state variables.
            * Remove the `loadAccountCredentials` function.
            * Remove the `handleSelectAccount` function.
            * In the JSX where connected accounts are listed, remove the "Select" button (`<Button onClick={() => handleSelectAccount(account.email)} ...>`). The display should only show the account email, its status (active/token expired), and a "Disconnect" button.
            * The visual distinction for a selected account (e.g., `bg-primary/10 border-primary`) should be removed.
        * **Remove "Enhanced AI Summarization Section":**
            * Delete the entire JSX block that conditionally renders when `selectedAccount && accessToken` is true. This includes the "Enhanced AI Email Analysis for {selectedAccount}" heading, the "What This Does" info box, and the "Analyze Today's Emails with AI" button.
            * Remove the `isAISummarizing` state variable and the `handleEnhancedAISummarization` function.
        * **Simplify Account Display:**
            ```jsx
            // Inside the .map(account => (...)) for connectedAccounts:
            // ...
            <div
                key={account.email}
                className="flex items-center justify-between p-4 rounded-lg border bg-muted/50 border-border hover:bg-muted" // Simplified classes
            >
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                        account.isExpired ? 'bg-red-500' : 'bg-green-500'
                    }`} />
                    <div>
                        <p className="font-medium text-foreground">{account.email}</p>
                        <p className="text-sm text-muted-foreground">
                            {account.isExpired ? 'Token expired - please reconnect' : 'Active'}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => handleDisconnectClick(account.email)}
                    variant="outline"
                    size="sm"
                    disabled={disconnectingAccount === account.email}
                    className="shadow-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                >
                    {disconnectingAccount === account.email ? '🔄' : <Trash2 className="w-4 h-4 mr-2" />}
                    {disconnectingAccount === account.email ? 'Disconnecting...' : 'Disconnect'}
                </Button>
            </div>
            // ...
            ```

2.  **Trigger Summarization on New Account Connection:**
    * **File:** `./src/app/api/auth/callback/route.ts`
    * **Action:** After successfully obtaining tokens and saving credentials, trigger the email fetching and summarization process for the newly connected account.
        * Import necessary functions/types:
            ```typescript
            import { fetchTodaysEmailsWithContent } from '@/lib/google/actions';
            import { summarizeAndStoreEmails } from '@/lib/openai/summarizeEmails';
            import { writeJsonFile, readJsonFile } from '@/lib/json_handler'; // Assuming readJsonFile is also needed by summarizeAndStoreEmails or its sub-functions
            import type { GmailMessageWithContent, SummarizedMessage, EmailDigest } from '@/types/email'; // Ensure EmailDigest is imported
            // Define AccountProcessingLog interface if not globally available
            interface AccountProcessingLog {
                id: string;
                account_email: string;
                userId: string;
                date: string; // YYYY-MM-DD
                last_processed_at: string; // ISO timestamp
                emails_fetched: number;
                emails_summarized: number;
                digest_id?: string;
                status: 'success' | 'failed' | 'no_new_emails';
            }
            ```
        * Add the summarization logic after `await saveCredentials(tokens, userInfo);`:
            ```typescript
            // ... (after saveCredentials)
            console.log(`✅ Credentials saved for ${userInfo.email}. Proceeding to initial summarization...`);

            try {
                // --- Start of summarization logic (adapted from /api/emails/summarize) ---
                const accessToken = tokens.access_token; // From the current OAuth flow
                const accountEmail = userInfo.email;
                const userId = userInfo.id;

                const today = new Date().toISOString().split('T')[0];
                const currentTimestamp = new Date().toISOString();

                console.log(`🚀 Performing initial email summarization for new account: ${accountEmail} (${userId})`);

                // Step 1: Fetch today's emails
                const emails = await fetchTodaysEmailsWithContent(accessToken);
                console.log(`📧 Fetched ${emails.length} emails for initial summary.`);

                const contentStats = { // Log content stats
                    totalEmails: emails.length,
                    withTextContent: emails.filter(e => e.textContent).length,
                    withHtmlContent: emails.filter(e => e.htmlContent).length,
                    avgContentLength: emails.length > 0
                        ? Math.round(emails.reduce((sum, e) => sum + (e.bodyPreview?.length || 0), 0) / emails.length)
                        : 0
                };
                console.log(`📊 Initial content stats:`, contentStats);

                if (emails.length === 0) {
                    console.log('📭 No emails found from today for initial summary.');
                    // Optionally log to account_processing_log.json even for initial setup
                } else {
                    // Step 2: Prepare data for AI (save to unsummarized_debug.json)
                    // This step is crucial as summarizeAndStoreEmails reads from this file.
                    const existingDebugData = await readJsonFile<any>('unsummarized_debug.json').catch(() => []); // Use 'any' for UnsummarizedDebugData if not strictly typed yet
                    const newDebugEntry = {
                        userId,
                        accountEmail,
                        timestamp: currentTimestamp,
                        messages: emails, // emails are already GmailMessageWithContent
                        contentStats
                    };
                    // Ensure existingDebugData is an array
                    const currentDebugDataArray = Array.isArray(existingDebugData) ? existingDebugData : [];
                    const filteredDebugData = currentDebugDataArray.filter((entry: any) =>
                        !(entry.userId === userId && entry.accountEmail === accountEmail)
                    );
                    const updatedDebugData = [...filteredDebugData, newDebugEntry];
                    await writeJsonFile('unsummarized_debug.json', updatedDebugData);
                    console.log('💾 Saved fetched emails to unsummarized_debug.json for AI processing.');

                    // Step 3: Run AI summarization
                    const summarizationResult = await summarizeAndStoreEmails(userId, accountEmail);

                    if (summarizationResult.success) {
                        console.log(`✅ Initial summarization successful for ${accountEmail}. Digest ID: ${summarizationResult.digestId}`);
                        // Log to account_processing_log.json
                        const processingLogArray = await readJsonFile<AccountProcessingLog>('account_processing_log.json').catch(() => []);
                        const currentProcessingLog = Array.isArray(processingLogArray) ? processingLogArray : [];

                        const logEntry: AccountProcessingLog = {
                            id: `${userId}_${accountEmail}_${today}`.replace(/[^a-zA-Z0-9_]/g, '_'),
                            account_email: accountEmail,
                            userId: userId,
                            date: today,
                            last_processed_at: currentTimestamp,
                            emails_fetched: emails.length,
                            emails_summarized: summarizationResult.processedEmails || 0,
                            digest_id: summarizationResult.digestId,
                            status: 'success'
                        };
                        const updatedLog = currentProcessingLog.filter(log => log.id !== logEntry.id);
                        updatedLog.push(logEntry);
                        await writeJsonFile('account_processing_log.json', updatedLog);
                    } else {
                        console.error(`❌ Initial summarization failed for ${accountEmail}: ${summarizationResult.message}`);
                        // Optionally log failure to account_processing_log.json
                    }
                }
                // --- End of summarization logic ---
            } catch (summaryError) {
                console.error(`❌ Error during initial summarization for ${userInfo.email}:`, summaryError);
                // Don't let summarization error block the redirect, but log it.
            }

            // Redirect to dashboard with success (original logic)
            const redirectUrl = new URL('/dashboard/connected-emails', request.url);
            redirectUrl.searchParams.set('connected', 'success');
            redirectUrl.searchParams.set('email', userInfo.email);
            redirectUrl.searchParams.set('initial_summary_attempted', 'true'); // Add a param to indicate summary was tried

            return NextResponse.redirect(redirectUrl.toString());
            ```
    * **Note:** The `/api/emails/summarize/route.ts` endpoint, which was previously triggered by a button, is now less critical for its original purpose. Its logic has been partially moved to the OAuth callback. You might repurpose or remove this API route later, or adapt it for manual "fetch" actions.

3.  **Review and Refactor `/api/emails/summarize/route.ts`:**
    * **File:** `./src/app/api/emails/summarize/route.ts`
    * **Action:**
        * This endpoint is no longer the primary way to trigger summarization for *selected* accounts from the UI.
        * Consider if this endpoint is still needed. If it's for a manual "fetch all for today" button (see Phase 3), it needs to be adapted to iterate over ALL connected accounts for the user, fetch their emails, and summarize.
        * If kept, it should **not** rely on `accessToken`, `accountEmail`, `userId` from the request body for a *single* account in the same way, unless it's designed to process one specific account on demand (which is not the new primary flow).
        * **Proposed Action for "Fetch Today's Emails" button:** This endpoint should be modified to:
            * Accept a `userId` (or infer it from a session if you implement full user auth later).
            * Load all connected accounts for that `userId` from `connected_accounts.json`.
            * For each account:
                * Check `account_processing_log.json` to see if it was successfully processed today. If yes, skip.
                * If not, get valid credentials (refresh token if needed) using `getValidCredentials(account.userId, account.email)`.
                * Fetch today's emails using `fetchTodaysEmailsWithContent(refreshedAccount.accessToken)`.
                * Save emails to `unsummarized_debug.json` (ensure it appends or replaces correctly for the specific user/account).
                * Call `summarizeAndStoreEmails(account.userId, account.email)`.
                * Update `account_processing_log.json`.
            * Return a collective status (e.g., how many accounts processed, any errors).
        * The request body for this route might become empty or just contain `userId` if not using sessions.

**Phase 3: Today's Summary Page Updates**

1.  **Add "Fetch Now" Button and Logic:**
    * **File:** `./src/app/dashboard/today-summary/page.tsx`
    * **Action:**
        * **UI Change:** In the `SummaryHeader` component, add a new button "Fetch Today's Emails" next to the "Refresh" button.
            ```typescript
            // In SummaryHeader component props
            interface SummaryHeaderProps {
                date: string;
                onRefresh: () => void;
                isRefreshing: boolean;
                onFetchToday?: () => void; // New prop
                isFetchingToday?: boolean; // New prop
                canFetchToday?: boolean; // New prop to control disable state
            }

            // In SummaryHeader JSX
            // ... (existing Refresh button)
            {onFetchToday && (
                <Button
                    onClick={onFetchToday}
                    disabled={isFetchingToday || !canFetchToday}
                    variant="default" // Or another appropriate variant
                    className="shadow-sm ml-2 bg-blue-600 hover:bg-blue-700 text-white" // Example styling
                >
                    {isFetchingToday ? (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Fetching All...
                        </>
                    ) : (
                       "🚀 Fetch All Today"
                    )}
                </Button>
            )}
            // If !canFetchToday, you might want to add a tooltip explaining why it's disabled (e.g., "All accounts processed today")
            ```
        * **Main Component Logic (`TodaySummaryPage`):**
            * Add state for the new button:
                ```typescript
                const [isFetchingToday, setIsFetchingToday] = useState(false);
                const [canFetchToday, setCanFetchToday] = useState(true);
                // Assuming currentUserId is available or can be fetched (e.g., from the first digest or a dedicated context/hook)
                // const [currentUserId, setCurrentUserId] = useState<string | null>(null); // Manage this state
                ```
            * **Implement `checkIfCanFetchToday` function:**
                * This function will fetch `/api/processing-log/route.ts` and `/api/auth/accounts/all` (or a user-specific version).
                * Get all connected accounts (e.g., from `connectedAccounts` state if `TodaySummaryPage` also loads them, or fetch them).
                * For each connected account, check the processing log for a successful entry for the current date.
                * If ALL connected accounts for the user have a successful log entry for today, `setCanFetchToday(false)`. Otherwise, `true`.
                * Call this in `useEffect` on load and after `handleFetchToday`.

            * **Implement `handleFetchToday` function:**
                ```typescript
                const handleFetchToday = async () => {
                    // Assuming you have a way to get currentUserId.
                    // For now, let's assume it might be derived or needs to be fetched.
                    // This is a placeholder; you'll need a robust way to get the active user's ID.
                    const userId = digests[0]?.digest.userId || 'user_123'; // Example: get from first digest or a default

                    if (!userId) {
                        toast.error("User ID not found. Cannot fetch emails.");
                        return;
                    }

                    setIsFetchingToday(true);
                    toast.info("🚀 Starting to fetch and summarize today's emails for all accounts...");

                    try {
                        // This API route needs to be implemented/modified as per Phase 2, Step 3
                        const response = await fetch('/api/emails/summarize', { // Or a new route like '/api/emails/process-all-today'
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId }), // Send userId to backend
                        });
                        const data = await response.json();

                        if (data.success) {
                            toast.success(data.message || "Successfully processed today's emails for all accounts!");
                            await loadTodayDigests(); // Refresh the displayed digests
                            await checkIfCanFetchToday(); // Re-check if fetching is still allowed
                        } else {
                            toast.error(data.error || "Failed to process today's emails.");
                        }
                    } catch (error) {
                        console.error("❌ Error fetching all today's emails:", error);
                        toast.error("An error occurred while fetching emails.");
                    } finally {
                        setIsFetchingToday(false);
                    }
                };
                ```
            * Pass `onFetchToday={handleFetchToday}`, `isFetchingToday={isFetchingToday}`, and `canFetchToday={canFetchToday}` to `SummaryHeader`.
            * Call `checkIfCanFetchToday` in an initial `useEffect` (you'll need `connectedAccounts` data for this, so ensure it's loaded or fetched).

2.  **Update `AccountSummaryCard` to use new `EmailDigest` structure:**
    * **File:** `./src/app/dashboard/today-summary/page.tsx`
    * **Action:**
        * Modify `AccountSummaryCard` to display data from the new `EmailDigest` fields.
        * `statusConfig` should now use `digest.inbox_status`.
        * "Highlights" section should iterate over `digest.important_emails` and display `subject`, `sender`, and the new `reason`.
        * "Suggestion" section should display `digest.suggestions` (if present, it's an array of strings).
        * The `HighlightItem` component needs to be updated to accept and display the `reason`.
            ```typescript
            // Update HighlightItem props and rendering
            interface HighlightItemProps { // Define this if not already
                highlight: { subject: string; from: string; reason: string }; // Add reason
            }

            function HighlightItem({ highlight }: HighlightItemProps) {
                // ... (getIconForHighlight can remain similar)
                return (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        {getIconForHighlight(highlight.subject, highlight.from)}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground leading-tight mb-1">
                                {highlight.subject}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mb-1">
                                From: {highlight.from}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                Reason: {highlight.reason} {/* Display reason */}
                            </p>
                        </div>
                    </div>
                );
            }

            // In AccountSummaryCard component:
            // ...
            // const statusConfig = getStatusConfig(digest.status); // OLD
            const statusConfig = getStatusConfig(digest.inbox_status); // NEW: use digest.inbox_status

            // ...
            // Highlights section
            {digest.important_emails.length > 0 && ( // NEW: use important_emails
                <div className={`transform transition-all duration-300 ease-in-out ${
                    isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                }`}>
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        🔥 Important Emails ({digest.important_emails.length}) {/* NEW */}
                    </h4>
                    <div className="space-y-2">
                        {digest.important_emails.slice(0, 5).map((highlight, index) => ( // NEW
                            <div
                                key={index}
                                className={`transform transition-all duration-200 ease-in-out ${
                                    isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
                                }`}
                                style={{
                                    transitionDelay: isExpanded ? `${index * 50 + 100}ms` : '0ms'
                                }}
                            >
                                <HighlightItem highlight={{...highlight, from: highlight.sender}} /> {/* Adapt to HighlightItem props */}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            // Suggestion section
            {digest.suggestions && digest.suggestions.length > 0 && ( // NEW: check digest.suggestions
                <div
                    className={`transform transition-all duration-300 ease-in-out ${
                        isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                    }`}
                    style={{
                        transitionDelay: isExpanded ? '250ms' : '0ms'
                    }}
                >
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                            💡 Suggestions for Cleanup
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                            {digest.suggestions.map((suggestion, index) => (
                                <li key={index} className="text-sm text-blue-800 dark:text-blue-200">
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            // Remove old (digest as any).summary fallback for overview if no longer needed.
            // Ensure contentHeight calculation in useEffect for AccountSummaryCard considers changes to important_emails and suggestions.
             useEffect(() => {
                if (contentRef.current) {
                    setContentHeight(contentRef.current.scrollHeight);
                }
            }, [digest.important_emails, digest.suggestions, isExpanded]); // Add isExpanded to re-calculate on toggle

            ```

**Phase 4: Settings Page Implementation (UI Only)**

* **File:** `./src/app/dashboard/settings/page.tsx`
* **Action:** Replace the current placeholder content with a structured UI for settings. Use Tailwind CSS and Shadcn UI components (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Label`, `Input`, `Switch`, `Button`, `Select` if needed for dropdowns like timezone/time).
    * Organize settings into sections as requested.
    * This is UI only; no backend functionality needs to be implemented for these settings yet.

    ```jsx
    'use client';

    import ContentView from '@/components/dashboard/layout/ContentView';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Switch } from '@/components/ui/switch';
    import {
        Card,
        CardContent,
        CardDescription,
        CardFooter,
        CardHeader,
        CardTitle,
    } from '@/components/ui/card';
    import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
    } from "@/components/ui/select"; // Assuming Select from Shadcn
    import { Separator } from '@/components/ui/separator';
    import { HelpCircle, Download, AlertTriangle, Trash2 } from 'lucide-react'; // Example icons

    export default function SettingsPage() {
        // Placeholder for timezones - in a real app, this would be more comprehensive
        const timezones = [
            { value: "Etc/GMT+12", label: "(GMT-12:00) International Date Line West" },
            { value: "America/New_York", label: "(GMT-05:00) Eastern Time (US & Canada)" },
            { value: "Europe/London", label: "(GMT+00:00) London" },
            { value: "Asia/Jerusalem", label: "(GMT+02:00) Jerusalem" },
            { value: "Asia/Tokyo", label: "(GMT+09:00) Tokyo" },
        ];

        const summaryTimes = Array.from({ length: 24 }, (_, i) => {
            const hour = i.toString().padStart(2, '0');
            return { value: `${hour}:00`, label: `${hour}:00` };
        });


        return (
            <ContentView>
                <div className="space-y-10 max-w-4xl mx-auto pb-12">
                    {/* User Settings */}
                    <Card id="user-settings">
                        <CardHeader>
                            <CardTitle>User Settings</CardTitle>
                            <CardDescription>Manage your personal account details and preferences.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="displayName">Display Name</Label>
                                    <Input id="displayName" defaultValue="Current User Name" placeholder="Your Name" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" defaultValue="user@example.com" disabled />
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <div>
                                <Label className="text-base font-medium">Password</Label>
                                <CardDescription className="text-sm mb-4">Update your password. Ensure it is strong and unique.</CardDescription>
                                <div className="space-y-3 max-w-sm">
                                    <Input id="currentPassword" type="password" placeholder="Current Password" />
                                    <Input id="newPassword" type="password" placeholder="New Password" />
                                    <Input id="confirmNewPassword" type="password" placeholder="Confirm New Password" />
                                </div>
                                <Button variant="outline" className="mt-4">Change Password</Button>
                            </div>

                            <Separator className="my-6" />

                            <div className="space-y-2 max-w-sm">
                                <Label htmlFor="timezone">User Timezone</Label>
                                <Select defaultValue="Asia/Jerusalem">
                                    <SelectTrigger id="timezone">
                                        <SelectValue placeholder="Select timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timezones.map(tz => (
                                            <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">For daily summary scheduling and accurate timestamps.</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save User Settings</Button>
                        </CardFooter>
                    </Card>


                    {/* Email Summary Preferences */}
                    <Card id="summary-preferences">
                        <CardHeader>
                            <CardTitle>Email Summary Preferences</CardTitle>
                            <CardDescription>Customize how and when you receive your email summaries.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2 max-w-xs">
                                <Label htmlFor="summaryTime">Preferred Summary Time</Label>
                                 <Select defaultValue="08:00">
                                    <SelectTrigger id="summaryTime">
                                        <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {summaryTimes.map(time => (
                                            <SelectItem key={time.value} value={time.value}>{time.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-base font-medium">Summary Delivery Method</Label>
                                <div className="flex items-center space-x-3 p-3 border rounded-md">
                                    <Switch id="deliveryDashboard" defaultChecked />
                                    <Label htmlFor="deliveryDashboard" className="font-normal flex-1">Dashboard Only</Label>
                                </div>
                                <div className="flex items-center space-x-3 p-3 border rounded-md">
                                    <Switch id="deliveryEmail" />
                                    <Label htmlFor="deliveryEmail" className="font-normal flex-1">Email</Label>
                                </div>
                                <div className="flex items-center space-x-3 p-3 border rounded-md opacity-60">
                                    <Switch id="deliveryWhatsapp" disabled />
                                    <Label htmlFor="deliveryWhatsapp" className="font-normal flex-1">WhatsApp (Coming Soon)</Label>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-base font-medium">Default Inbox View Mode</Label>
                                 <div className="flex items-center space-x-3 p-3 border rounded-md">
                                    <Switch id="viewUnified" defaultChecked />
                                    <Label htmlFor="viewUnified" className="font-normal flex-1">All Inboxes Unified</Label>
                                </div>
                                <div className="flex items-center space-x-3 p-3 border rounded-md">
                                    <Switch id="viewPerAccount" />
                                    <Label htmlFor="viewPerAccount" className="font-normal flex-1">One at a Time (Per Account)</Label>
                                </div>
                            </div>
                        </CardContent>
                         <CardFooter>
                            <Button>Save Summary Preferences</Button>
                        </CardFooter>
                    </Card>


                    {/* Notifications */}
                    <Card id="notifications">
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>Choose which notifications you want to receive.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex items-center justify-between p-3 border rounded-md">
                                <Label htmlFor="notifSummary" className="font-normal">Email Summary Notifications</Label>
                                <Switch id="notifSummary" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-md">
                                <Label htmlFor="notifUrgent" className="font-normal">Urgent Alert Emails</Label>
                                <Switch id="notifUrgent" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-md">
                                <Label htmlFor="notifPromo" className="font-normal">Unimportant/Promo Alerts</Label>
                                <Switch id="notifPromo" />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-md">
                                <Label htmlFor="notifFallback" className="font-normal">Digest Fallback Alert (if summary fails)</Label>
                                <Switch id="notifFallback" defaultChecked />
                            </div>
                        </CardContent>
                         <CardFooter>
                            <Button>Save Notification Settings</Button>
                        </CardFooter>
                    </Card>


                    {/* Inbox Cleanup Preferences */}
                    <Card id="cleanup-preferences">
                        <CardHeader>
                            <CardTitle>Inbox Cleanup Preferences</CardTitle>
                            <CardDescription>Manage automated cleanup suggestions and display.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label className="text-base font-medium mb-3 block">Auto-suggest unsubscribe for:</Label>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3 p-3 border rounded-md">
                                        <Switch id="cleanupNewsletters" defaultChecked />
                                        <Label htmlFor="cleanupNewsletters" className="font-normal flex-1">Newsletters</Label>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 border rounded-md">
                                        <Switch id="cleanupPromotions" defaultChecked />
                                        <Label htmlFor="cleanupPromotions" className="font-normal flex-1">Promotions</Label>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 border rounded-md">
                                        <Switch id="cleanupSocial" />
                                        <Label htmlFor="cleanupSocial" className="font-normal flex-1">Social Updates</Label>
                                    </div>
                                </div>
                            </div>
                             <div className="flex items-center justify-between p-3 border rounded-md">
                                <div className="flex-1">
                                    <Label htmlFor="inboxHealthScoring" className="font-normal">Inbox Health Scoring</Label>
                                    <p className="text-xs text-muted-foreground">Show health indicators in dashboard.</p>
                                </div>
                                <Switch id="inboxHealthScoring" defaultChecked />
                            </div>
                            <div className="space-y-2 max-w-sm">
                                <Label htmlFor="summaryTone">Language/Tone of Summaries</Label>
                                <Select defaultValue="Friendly">
                                    <SelectTrigger id="summaryTone">
                                        <SelectValue placeholder="Select tone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Formal">Formal</SelectItem>
                                        <SelectItem value="Friendly">Friendly</SelectItem>
                                        <SelectItem value="Minimalist">Minimalist</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save Cleanup Preferences</Button>
                        </CardFooter>
                    </Card>


                    {/* Privacy and Data */}
                    <Card id="privacy-data">
                        <CardHeader>
                            <CardTitle>Privacy and Data</CardTitle>
                            <CardDescription>Manage your data and privacy settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button variant="outline" className="w-full justify-start">
                                <Download className="w-4 h-4 mr-2" />
                                Export My Summaries (Download Data)
                            </Button>
                            <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Request Complete Data Deletion
                            </Button>
                            <div>
                                <Label className="text-base font-medium">Token Access Log</Label>
                                <p className="text-sm text-muted-foreground mb-2">Recent access to Gmail API by Sumails will be shown here.</p>
                                <div className="mt-2 p-4 bg-muted rounded-md text-sm border">
                                    <p className="text-muted-foreground">No recent access logs available (UI Placeholder).</p>
                                    {/* Example Log Entry (for UI design)
                                    <div className="mt-2 text-xs">
                                        <p>Accessed: May 24, 2025, 10:15 AM - Fetched emails for summary</p>
                                        <p>Accessed: May 23, 2025, 08:00 AM - Refreshed token</p>
                                    </div>
                                    */}
                                </div>
                            </div>
                        </CardContent>
                    </Card>


                    {/* Account Management */}
                    <Card id="account-management" className="border-destructive/50">
                        <CardHeader>
                            <CardTitle className="text-destructive">Account Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button variant="destructive" className="w-full justify-start">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete My Sumails Account
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2">This action is irreversible and will delete all your data associated with Sumails, including summaries and settings.</p>
                        </CardContent>
                    </Card>

                </div>
            </ContentView>
        );
    }
    ```

**General Notes for AI Tool:**

* **Error Handling:** Ensure robust error handling (`try...catch`) in all API routes and backend functions. Provide meaningful error messages to the client/console.
* **Toasts:** Use `sonner` toasts for user feedback on actions (e.g., account connected, summarization started/completed/failed, settings saved).
* **JSON File Operations:** When reading/writing JSON files (`src/data/*.json`), ensure operations are atomic where necessary or handle potential race conditions if multiple operations could occur simultaneously (though less likely in this specific flow). Always use `await` for these operations. Ensure arrays are initialized if a file doesn't exist or is empty (e.g., `const data = await readJsonFile(...).catch(() => [])`).
* **Security:** Remind the AI that storing sensitive data like access tokens in local JSON files is for development. In production, a secure database and proper secret management (e.g., environment variables for API keys, KMS for encrypting tokens at rest) are essential.
* **Code Comments:** Add comments to explain new logic, especially in API routes and complex functions.
* **User Identification:** The logic for `currentUserId` in `TodaySummaryPage` and the `userId` passed to `/api/emails/summarize` when "Fetch All Today" is clicked needs to be robust. Currently, it's a placeholder. In a real application, this would come from user authentication state (e.g., a session, a context provider). For now, the AI might need to make an assumption or you might need to provide how `userId` is determined.
* **Testing:** After implementation, thoroughly test the new account connection flow, the immediate summarization, the "Fetch Today's Emails" button, and ensure the settings page renders correctly.

This detailed plan should guide your AI tool effectively. Let me know if you need any part clarified!
