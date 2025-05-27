# 📬 Sumails Summary System API Endpoints

This document describes all the API endpoints for the Sumails Summary System implemented in Phase 2.

---

## 🔐 Authentication

All endpoints require user authentication via Supabase Auth. Include the user's session token in requests.

---

## 📊 Summary Management

### `GET /api/summaries`
Get summary status for all user accounts.

**Response:**
```json
{
  "success": true,
  "accounts": [
    {
      "accountId": "uuid",
      "accountEmail": "user@example.com",
      "lastSummaryDate": "2024-01-15",
      "lastSummaryStatus": "attention_needed",
      "hasRecentSummary": true
    }
  ]
}
```

### `POST /api/summaries`
Generate summaries for user accounts.

**Request Body:**
```json
{
  "accountId": "uuid",           // Optional: specific account
  "dateRange": "today",          // "today" | "initial_setup" | number
  "forceRegenerate": false       // Optional: regenerate existing summaries
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully processed 5 emails and created summary",
  "summaryId": "uuid",
  "inboxStatus": "attention_needed",
  "emailCount": 5
}
```

---

## 📧 Account-Specific Summaries

### `GET /api/summaries/[accountId]`
Get summaries for a specific account.

**Query Parameters:**
- `limit`: Number of summaries to return (default: 10)
- `latest`: Set to "true" to get only the latest summary

**Response:**
```json
{
  "success": true,
  "summaries": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "connected_account_id": "uuid",
      "email_count": 5,
      "inbox_status": "attention_needed",
      "date_processed": "2024-01-15",
      "summary_data": {
        "overview": ["Received 5 emails today", "2 important messages flagged"],
        "insight": "Several urgent work items need attention.",
        "important_emails": [
          {
            "subject": "Urgent: Project deadline",
            "sender": "boss@company.com",
            "reason": "Time-sensitive project update"
          }
        ],
        "suggestions": ["Unsubscribe from promotional emails"]
      },
      "created_at": "2024-01-15T10:30:00Z",
      "account_email": "user@example.com",
      "account_provider": "Google"
    }
  ],
  "count": 1
}
```

### `POST /api/summaries/[accountId]`
Generate summary for a specific account.

**Request Body:**
```json
{
  "dateRange": "today",          // "today" | "initial_setup" | number
  "forceRegenerate": false       // Optional: regenerate existing summary
}
```

**Response:** Same as `POST /api/summaries`

---

## ⏰ CRON Jobs

### `POST /api/cron/daily-summaries`
Daily CRON job for generating summaries for all users.

**Headers:**
```
Authorization: Bearer YOUR_CRON_SECRET
```

**Response:**
```json
{
  "success": true,
  "message": "Daily summaries completed in 45s",
  "stats": {
    "duration": 45,
    "totalUsers": 10,
    "successfulUsers": 9,
    "totalAccountsProcessed": 25,
    "totalEmailsProcessed": 150
  },
  "results": [
    {
      "userId": "uuid",
      "success": true,
      "message": "Processed 3/3 accounts successfully",
      "totalAccounts": 3,
      "successfulAccounts": 3,
      "results": [...]
    }
  ]
}
```

### `GET /api/cron/daily-summaries`
Health check for CRON endpoint.

**Response:**
```json
{
  "success": true,
  "message": "Daily summaries CRON endpoint is healthy",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 📱 Notifications

### `POST /api/notifications/test`
Test notification system for a specific account.

**Request Body:**
```json
{
  "accountId": "uuid",
  "method": "whatsapp"           // "whatsapp" | "email"
}
```

**Response:**
```json
{
  "success": true,
  "message": "WhatsApp notification logged to console (placeholder)",
  "deliveryMethod": "whatsapp",
  "summaryId": "uuid",
  "inboxStatus": "attention_needed",
  "testMode": true
}
```

---

## 🔌 Automatic Triggers

### OAuth Callback Integration
When a user connects a new Gmail account via `/api/auth/callback`, the system automatically:

1. ✅ Saves the connected account
2. 🔌 **Triggers initial summary** (last 24-48 hours)
3. 📱 Sends notification if status is `attention_needed` or `worth_a_look`

This implements the "immediate summary on connection" requirement from `SUMMARY_SYSTEM.md`.

---

## 📋 Summary Data Structure

### Inbox Status Values
- `"attention_needed"` - Contains urgent or important emails
- `"worth_a_look"` - Moderate relevance, some things to review  
- `"all_clear"` - Nothing critical today

### Summary Data Object
```json
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
  "suggestions": ["string", "string"]
}
```

---

## 🚀 Usage Examples

### Generate Summary for All Accounts
```bash
curl -X POST /api/summaries \
  -H "Content-Type: application/json" \
  -d '{"dateRange": "today"}'
```

### Get Latest Summary for Account
```bash
curl "/api/summaries/account-uuid?latest=true"
```

### Test WhatsApp Notification
```bash
curl -X POST /api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"accountId": "account-uuid", "method": "whatsapp"}'
```

### Setup Daily CRON Job
```bash
# Add to your CRON scheduler (e.g., Vercel Cron, GitHub Actions)
curl -X POST /api/cron/daily-summaries \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 🔧 Environment Variables

Add these to your `.env.local`:

```bash
# Required for CRON job authentication
CRON_SECRET=your-secure-random-string

# Required for OpenAI summarization
OPENAI_API_KEY=your-openai-api-key

# Required for Supabase operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## ✅ Phase 2 Complete!

All endpoints are implemented and ready for:
- ✅ Manual summary generation
- ✅ Automatic triggers on mailbox connection
- ✅ Daily CRON jobs
- ✅ Notification system (placeholder implementation)
- ✅ Comprehensive API documentation

Ready for Phase 3: Enhanced notifications and UI integration! 🎉 