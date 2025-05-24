# Sumails - AI Email Summarization

This is a [Next.js](https://nextjs.org) project that provides AI-powered email management and summarization services for Gmail accounts.

## Features

- **Gmail Integration**: Secure OAuth connection to Gmail accounts
- **AI Email Summarization**: Intelligent email summaries using OpenAI GPT-4o
- **Email Filtering**: Smart filtering to avoid duplicate processing
- **Multi-Account Support**: Connect and manage multiple Gmail accounts
- **Modern UI**: Clean, responsive interface with dark/light mode

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Google OAuth Configuration (required for Gmail integration)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# OpenAI Configuration (required for AI summarization)
OPENAI_API_KEY=your_openai_api_key_here

# Next.js Environment
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### Getting API Keys

1. **Google OAuth**: Follow the setup guide in `documentation/GMAIL_SETUP.md`
2. **OpenAI API**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables (see above)

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser

## AI Email Summarization

The application includes a powerful AI summarization feature with smart daily tracking:

### **🚀 Complete Process (Recommended)**
The main "Smart Email Summary" button does everything in one step:

1. **Daily Check**: Verifies if the account was already processed today
2. **Fetch Emails**: Gets latest emails directly from Gmail API
3. **Smart Filtering**: Removes already summarized messages
4. **AI Analysis**: Calls OpenAI GPT-4o for intelligent summaries
5. **Data Persistence**: Saves results and updates all tracking files

### **📊 Account Tracking System**
- `src/data/account_processing_log.json` - Daily processing log per account
- Prevents duplicate processing of the same account in one day
- Tracks success/failure status and email counts
- Perfect for automated daily summaries (cron jobs)

### Using the AI Summarization

1. Navigate to `/dashboard/connected-emails`
2. Connect your Gmail account
3. Configure email count and search filters (optional)
4. Click "🚀 Smart Email Summary (Complete)" 

**First run**: Processes emails and creates summary
**Subsequent runs**: Shows "already processed today" message

The AI provides:
- **Summary**: 2-4 sentence overview of inbox activity
- **Highlights**: Up to 5 important emails with subject and sender
- **Suggestion**: Inbox management tip or improvement idea

### **🔧 Advanced/Debug Mode**
For development and testing:
- "🔍 Test Email Filtering" - Only filters emails, no AI processing
- "🤖 Run AI Email Summarization" - Only AI processing from debug data

## Project Structure

```
src/
├── app/
│   ├── api/emails/
│   │   ├── summarize-complete/     # NEW: Combined endpoint (fetch + filter + AI)
│   │   ├── summarize-ai/          # AI-only processing
│   │   └── summarize/             # Filter-only processing
│   └── api/processing-log/        # NEW: View account processing history
├── data/
│   ├── account_processing_log.json # NEW: Daily account tracking
│   ├── email_digests.json         # AI-generated summaries
│   ├── summarized_messages.json   # Individual message tracking
│   └── unsummarized_debug.json    # Debug data for AI processing
└── lib/openai/
    └── summarizeEmails.ts         # Core AI summarization logic
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Gmail API Setup Guide](./documentation/GMAIL_SETUP.md)
- [Project Overview](./documentation/PROJECT_OVERVIEW.md)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
