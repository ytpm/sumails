# Email Summary Cron Job Scheduling

## Overview

The email summary system now supports user-specific delivery times with timezone awareness. Instead of sending all summaries at a fixed time, users can choose their preferred time and receive summaries at that local time.

## Architecture

### Available Times
Users can choose from 4 preset times:
- **07:00** - Early morning start
- **09:00** - Work day begins  
- **12:00** - Lunch break
- **18:00** - End of work day

### Cron Jobs
Four separate cron jobs run at these UTC times:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-summaries?time=07:00",
      "schedule": "0 7 * * *"
    },
    {
      "path": "/api/cron/daily-summaries?time=09:00", 
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/daily-summaries?time=12:00",
      "schedule": "0 12 * * *"
    },
    {
      "path": "/api/cron/daily-summaries?time=18:00",
      "schedule": "0 18 * * *"
    }
  ]
}
```

## How It Works

### 1. User Configuration
Users configure their preferences via the settings UI:
- **Preferred Time**: One of the 4 available times
- **Timezone**: Their local timezone (e.g., "America/New_York")
- **Delivery Methods**: Email and/or WhatsApp

### 2. Cron Execution
Each cron job:
1. Gets the target UTC time from the query parameter
2. Fetches all users with their settings
3. **Filters users** whose local preferred time matches the UTC cron time
4. Processes summaries only for eligible users

### 3. Timezone Conversion Logic
For each user, the system:
1. Takes the UTC cron time (e.g., "09:00")
2. Converts it to the user's local timezone
3. Compares with the user's preferred time
4. Only processes if they match

```typescript
function shouldReceiveSummaryAtTime(
  utcTime: string,      // "09:00" 
  userTimezone: string, // "America/New_York"
  userPreferredTime: string // "09:00"
): boolean {
  // Convert UTC time to user's local time
  const userLocalTime = convertUTCToUserTime(utcTime, userTimezone);
  return userLocalTime === userPreferredTime;
}
```

## Examples

### Scenario 1: UTC User
- **User**: Timezone = "UTC", Preferred Time = "09:00"
- **Result**: Receives summary when 09:00 UTC cron runs ✅

### Scenario 2: US East Coast User  
- **User**: Timezone = "America/New_York", Preferred Time = "07:00"
- **Winter**: 07:00 EST = 12:00 UTC → Receives summary when 12:00 UTC cron runs ✅
- **Summer**: 07:00 EDT = 11:00 UTC → No matching cron (user receives nothing) ❌

### Scenario 3: US West Coast User
- **User**: Timezone = "America/Los_Angeles", Preferred Time = "09:00" 
- **Winter**: 09:00 PST = 17:00 UTC → No matching cron ❌
- **Summer**: 09:00 PDT = 16:00 UTC → No matching cron ❌

## Coverage Analysis

### Analysis Tool
Use the coverage analysis API to understand how well your cron schedule serves your users:

```bash
curl "http://localhost:3000/api/cron/analyze-coverage" \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Analysis Results
The tool provides:
- **Total Users**: All users in the database
- **Users with Settings**: Users who have configured preferences
- **Users with Enabled Delivery**: Users who want to receive summaries
- **Coverage Percentage**: Percentage of eligible users who receive summaries
- **Coverage by Time**: How many users each cron time serves
- **Uncovered Users**: Users who won't receive summaries at their preferred time

### Sample Response
```json
{
  "success": true,
  "analysis": {
    "totalUsers": 1000,
    "usersWithSettings": 850,
    "usersWithEnabledDelivery": 750,
    "coveredUsers": 600,
    "uncoveredUsers": 150,
    "coveragePercentage": 80,
    "coverageByTime": {
      "07:00": 150,
      "09:00": 200,
      "12:00": 175,
      "18:00": 125
    },
    "uncoveredByTimezone": {
      "America/Los_Angeles": 75,
      "Asia/Tokyo": 45,
      "Australia/Sydney": 30
    },
    "uncoveredByPreferredTime": {
      "06:00": 60,
      "15:00": 45,
      "21:00": 45
    }
  },
  "recommendations": [
    "Coverage is only 80%. Consider adding more cron times.",
    "Most uncovered timezone: America/Los_Angeles (75 users)",
    "Most uncovered preferred time: 06:00 (60 users)"
  ]
}
```

## Limitations & Considerations

### 1. Limited Coverage
Not all timezone/time combinations are covered by our 4 UTC times. Some users may not receive summaries at their exact preferred time.

### 2. Daylight Saving Time
Automatic timezone conversion handles DST, but this can cause users to temporarily lose/gain coverage when clocks change.

### 3. Future Improvements
To provide better coverage, consider:
- Adding more cron jobs (every hour?)
- Dynamic scheduling based on user distribution
- Fallback delivery times for uncovered users

## Monitoring

Each cron job logs:
- Number of total users in database
- Number of eligible users for this time
- Number of successfully processed users
- Processing duration and email counts

Example log output:
```
Found 150 eligible users out of 1000 total users for time 09:00
Users processed: 145/150 eligible users
Duration: 45 seconds
Accounts processed: 320
Emails processed: 1,250
```

## Testing

To test the timezone logic locally:
```bash
# Test the API endpoint directly
curl "http://localhost:3000/api/cron/daily-summaries?time=09:00" \
  -H "Authorization: Bearer $CRON_SECRET"

# Analyze coverage
curl "http://localhost:3000/api/cron/analyze-coverage" \
  -H "Authorization: Bearer $CRON_SECRET"
```

The response includes detailed information about which users were processed and their timezone settings. 