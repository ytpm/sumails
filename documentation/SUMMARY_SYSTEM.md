# 📬 Sumails Summary System

This document describes the logic and implementation steps for the summary engine in the lightweight version of the Sumails app.

---

## 🎯 Goal

To deliver meaningful daily summaries of each connected Gmail inbox via **WhatsApp or Email**—only when there’s something important to say.

---

## ✅ Key Principles

- Users **never need to request** a summary manually
- Summaries are generated and **sent automatically**
- If there’s **nothing important**, we tell them they’re clear—or stay silent
- First summary is **triggered immediately after mailbox connection**

---

## 🔁 Summary Trigger Logic

### 1. 🔌 When a Mailbox is Connected

- Immediately fetch the last **24–48 hours** of emails
- Generate a summary using OpenAI
- Determine `inboxStatus`:
  - `"attention_needed"` → send notification
  - `"worth_a_look"` → send notification
  - `"all_clear"` → optionally send a short “✅ All clear” message
- Store that summary in `email_digests.json` or the database (if live)

### 2. ⏰ Daily Summary CRON Job

- Run a scheduled job (e.g., 7:00 AM server time)
- For each user:
  - Loop through all connected mailboxes
  - Fetch emails from the past 24 hours
  - Skip if no new emails or no change since last summary
  - Generate summary via OpenAI
  - Send to WhatsApp or Email to any summary status

---

## 🧩 Summary Object Schema (from OpenAI)

```ts
{
  status: "attention_needed" | "worth_a_look" | "all_clear",
  overview: string[], // 3-point overview (email count, flagged count, topics)
  insight: string,     // 1-sentence AI comment
  highlights: { subject: string; from: string }[],
  suggestion?: string  // Optional inbox tip
}
```

---

## 📨 Notification Strategy

### If `status === "attention_needed"` or `"worth_a_look"`
- Send WhatsApp or Email notification
- Include:
  - Overview
  - Highlights (up to 5)
  - AI insight
  - Suggestion (optional)

### If `status === "all_clear"`
- Send short message like:
  ```
  ✅ All clear! Couldn't find anything urgent today.
  ```

---

## 🧠 Inbox Summary Experience in the UI

- No dedicated “summary history” UI
- Show per-account status on `mailboxes` page:
  ```plaintext
  Last summary: July 25, 07:30 AM
  Status: ✅ All clear
  ```

- Optional button: `[ Resend latest summary ]` --No need for that button atm

---

## 🚀 Next Implementation Tasks

- [ ] Build summary generation function (accepts email list, returns summary object)
- [ ] Trigger summary fetch on account connection
- [ ] Implement daily CRON function (by user and mailbox)
- [ ] For WhatsApp send just create a comment and log the results to console
- [ ] Save `summarized_messages` to prevent duplicate summaries
- [ ] Add per-account display of latest summary status

---

## 📬 Example Summary Notification

```plaintext
📬 You received 28 emails today.
🔥 3 look important.

🔐 Google: “New login alert”
💳 Stripe: “Payment failed”
📅 Zoom: “Meeting invite at 10 AM”

💡 Tip: Consider unsubscribing from Fiverr, Wix, and Canva.

✅ You’re all caught up.
```

---