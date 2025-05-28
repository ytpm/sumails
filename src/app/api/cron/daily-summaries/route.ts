import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateAllAccountSummaries } from '@/lib/services/summary-orchestrator';
import { logger } from '@/lib/logger/default-logger';

// Helper function to convert UTC time to user's local time and check if it matches preferred time
function shouldReceiveSummaryAtTime(
  utcTime: string, 
  userTimezone: string, 
  userPreferredTime: string
): boolean {
  try {
    // Parse the UTC time (format: "HH:MM")
    const [utcHours, utcMinutes] = utcTime.split(':').map(Number);
    
    // Create a date object representing today at the UTC time
    const utcDate = new Date();
    utcDate.setUTCHours(utcHours, utcMinutes, 0, 0);
    
    // Convert to user's timezone
    const userLocalTime = new Intl.DateTimeFormat('en-US', {
      timeZone: userTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(utcDate);
    
    // Compare with user's preferred time
    return userLocalTime === userPreferredTime;
  } catch (error) {
    logger.error(
      'CRON-DAILY-SUMMARIES',
      'shouldReceiveSummaryAtTime',
      `Error converting timezone for user timezone ${userTimezone}:`,
      error
    );
    // Fallback: if timezone conversion fails, send at UTC time match
    return utcTime === userPreferredTime;
  }
}

// GET /api/cron/daily-summaries - Time-specific CRON job for generating summaries
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetTime = searchParams.get('time');
  
  if (!targetTime) {
    logger.error('CRON-DAILY-SUMMARIES', 'GET', 'Missing time parameter');
    return NextResponse.json({ error: 'Time parameter is required' }, { status: 400 });
  }

  logger.debug(
    'CRON-DAILY-SUMMARIES',
    'GET',
    `Starting daily summary CRON job for time: ${targetTime}`
  );

  try {
    // Verify this is a legitimate CRON request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      logger.error('CRON-DAILY-SUMMARIES', 'GET', 'Unauthorized CRON request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startTime = Date.now();

    // Get all users with their settings from the database
    const supabase = await createClient(true); // Use service key

    const { data: usersWithSettings, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        user_settings!inner(
          summary_preferred_time,
          summary_timezone,
          summary_receive_by_email,
          summary_receive_by_whatsapp
        )
      `)
      .not('user_settings.summary_preferred_time', 'is', null)
      .not('user_settings.summary_timezone', 'is', null);

    if (usersError) {
      logger.error(
        'CRON-DAILY-SUMMARIES',
        'GET',
        'Failed to fetch users with settings:',
        usersError
      );
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Filter users who should receive summaries at this UTC time
    const eligibleUsers = usersWithSettings.filter(user => {
      const settings = Array.isArray(user.user_settings) ? user.user_settings[0] : user.user_settings;
      
      // Skip users who haven't enabled any delivery method
      if (!settings?.summary_receive_by_email && !settings?.summary_receive_by_whatsapp) {
        return false;
      }
      
      // Check if this UTC time matches the user's preferred local time
      return shouldReceiveSummaryAtTime(
        targetTime,
        settings.summary_timezone || 'UTC',
        settings.summary_preferred_time || '09:00'
      );
    });

    logger.debug(
      'CRON-DAILY-SUMMARIES',
      'GET',
      `Found ${eligibleUsers.length} eligible users out of ${usersWithSettings.length} total users for time ${targetTime}`
    );

    const results = [];
    let totalSuccessfulUsers = 0;
    let totalAccountsProcessed = 0;
    let totalEmailsProcessed = 0;

    // Process each eligible user
    for (const user of eligibleUsers) {
      const settings = Array.isArray(user.user_settings) ? user.user_settings[0] : user.user_settings;
      
      logger.debug(
        'CRON-DAILY-SUMMARIES',
        'GET',
        `Processing user: ${user.id} (preferred time: ${settings?.summary_preferred_time}, timezone: ${settings?.summary_timezone})`
      );

      try {
        const userResult = await generateAllAccountSummaries(
          user.id,
          'today', // Generate summaries for today
          false // Don't force regenerate (skip if already done today)
        );

        results.push({
          userId: user.id,
          success: userResult.success,
          message: userResult.message,
          totalAccounts: userResult.totalAccounts,
          successfulAccounts: userResult.successfulAccounts,
          results: userResult.results,
          userPreferredTime: settings?.summary_preferred_time,
          userTimezone: settings?.summary_timezone,
        });

        if (userResult.success) {
          totalSuccessfulUsers++;
          totalAccountsProcessed += userResult.successfulAccounts;

          // Count total emails processed
          userResult.results.forEach((result) => {
            totalEmailsProcessed += result.emailCount || 0;
          });

          logger.debug(
            'CRON-DAILY-SUMMARIES',
            'GET',
            `User ${user.id}: ${userResult.successfulAccounts}/${userResult.totalAccounts} accounts processed`
          );
        } else {
          logger.error(
            'CRON-DAILY-SUMMARIES',
            'GET',
            `User ${user.id}: ${userResult.message}`
          );
        }
      } catch (userError) {
        logger.error(
          'CRON-DAILY-SUMMARIES',
          'GET',
          `Error processing user ${user.id}:`,
          userError
        );
        results.push({
          userId: user.id,
          success: false,
          message: `Processing failed: ${
            userError instanceof Error ? userError.message : 'Unknown error'
          }`,
          totalAccounts: 0,
          successfulAccounts: 0,
          results: [],
          userPreferredTime: settings?.summary_preferred_time || 'unknown',
          userTimezone: settings?.summary_timezone || 'unknown',
        });
      }
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    logger.debug(
      'CRON-DAILY-SUMMARIES',
      'GET',
      `Daily summary CRON job completed for time ${targetTime}`
    );
    logger.debug(
      'CRON-DAILY-SUMMARIES',
      'GET',
      `Duration: ${duration} seconds`
    );
    logger.debug(
      'CRON-DAILY-SUMMARIES',
      'GET',
      `Users processed: ${totalSuccessfulUsers}/${eligibleUsers.length} eligible users`
    );
    logger.debug(
      'CRON-DAILY-SUMMARIES',
      'GET',
      `Accounts processed: ${totalAccountsProcessed}`
    );
    logger.debug(
      'CRON-DAILY-SUMMARIES',
      'GET',
      `Emails processed: ${totalEmailsProcessed}`
    );

    return NextResponse.json({
      success: true,
      message: `Daily summaries completed for ${targetTime} in ${duration}s`,
      stats: {
        duration,
        targetTime,
        totalEligibleUsers: eligibleUsers.length,
        totalUsersInDb: usersWithSettings.length,
        successfulUsers: totalSuccessfulUsers,
        totalAccountsProcessed,
        totalEmailsProcessed,
      },
      results,
    });
  } catch (error) {
    logger.error(
      'CRON-DAILY-SUMMARIES',
      'GET',
      `Error in daily summary CRON job for time ${targetTime}:`,
      error
    );
    return NextResponse.json({ 
      error: 'CRON job failed',
      targetTime 
    }, { status: 500 });
  }
}
