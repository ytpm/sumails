import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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
    // Fallback: if timezone conversion fails, send at UTC time match
    return utcTime === userPreferredTime;
  }
}

// GET /api/cron/analyze-coverage - Analyze which users are covered by current cron schedule
export async function GET(request: NextRequest) {
  try {
    // Verify this is an authorized request (admin only)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users with their settings from the database
    const supabase = await createClient(true); // Use service key

    const { data: usersWithSettings, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        user_settings(
          summary_preferred_time,
          summary_timezone,
          summary_receive_by_email,
          summary_receive_by_whatsapp
        )
      `);

    if (usersError) {
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    const cronTimes = ['07:00', '09:00', '12:00', '18:00'];
    
    const analysis = {
      totalUsers: usersWithSettings.length,
      usersWithSettings: 0,
      usersWithEnabledDelivery: 0,
      coveredUsers: 0,
      uncoveredUsers: 0,
      coverageByTime: {} as Record<string, number>,
      uncoveredByTimezone: {} as Record<string, number>,
      uncoveredByPreferredTime: {} as Record<string, number>,
    };

    // Initialize coverage counters
    cronTimes.forEach(time => {
      analysis.coverageByTime[time] = 0;
    });

    const coveredUserIds = new Set<string>();

    usersWithSettings.forEach(user => {
      const settings = Array.isArray(user.user_settings) ? user.user_settings[0] : user.user_settings;
      
      // Skip users without settings
      if (!settings || !settings.summary_preferred_time || !settings.summary_timezone) {
        return;
      }
      
      analysis.usersWithSettings++;
      
      // Skip users who haven't enabled any delivery method
      if (!settings.summary_receive_by_email && !settings.summary_receive_by_whatsapp) {
        return;
      }
      
      analysis.usersWithEnabledDelivery++;
      
      // Check if user is covered by any cron time
      let isCovered = false;
      
      cronTimes.forEach(cronTime => {
        if (shouldReceiveSummaryAtTime(
          cronTime,
          settings.summary_timezone,
          settings.summary_preferred_time
        )) {
          isCovered = true;
          analysis.coverageByTime[cronTime]++;
          coveredUserIds.add(user.id);
        }
      });
      
      if (isCovered) {
        analysis.coveredUsers++;
      } else {
        analysis.uncoveredUsers++;
        
        // Track uncovered users by timezone and preferred time
        const timezone = settings.summary_timezone;
        const preferredTime = settings.summary_preferred_time;
        
        analysis.uncoveredByTimezone[timezone] = (analysis.uncoveredByTimezone[timezone] || 0) + 1;
        analysis.uncoveredByPreferredTime[preferredTime] = (analysis.uncoveredByPreferredTime[preferredTime] || 0) + 1;
      }
    });

    // Calculate coverage percentage
    const coveragePercentage = analysis.usersWithEnabledDelivery > 0 
      ? Math.round((analysis.coveredUsers / analysis.usersWithEnabledDelivery) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        coveragePercentage,
      },
      recommendations: generateRecommendations(analysis),
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateRecommendations(analysis: any): string[] {
  const recommendations: string[] = [];
  
  if (analysis.coveragePercentage < 80) {
    recommendations.push(
      `Coverage is only ${analysis.coveragePercentage}%. Consider adding more cron times.`
    );
  }
  
  // Find the most common uncovered timezone
  const topUncoveredTimezone = Object.entries(analysis.uncoveredByTimezone)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0];
    
  if (topUncoveredTimezone) {
    recommendations.push(
      `Most uncovered timezone: ${topUncoveredTimezone[0]} (${topUncoveredTimezone[1]} users)`
    );
  }
  
  // Find the most common uncovered preferred time
  const topUncoveredTime = Object.entries(analysis.uncoveredByPreferredTime)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0];
    
  if (topUncoveredTime) {
    recommendations.push(
      `Most uncovered preferred time: ${topUncoveredTime[0]} (${topUncoveredTime[1]} users)`
    );
  }
  
  // Suggest additional cron times based on gaps
  const lowCoverageTimes = Object.entries(analysis.coverageByTime)
    .filter(([, count]) => (count as number) < 10)
    .map(([time]) => time);
    
  if (lowCoverageTimes.length > 0) {
    recommendations.push(
      `Low coverage times: ${lowCoverageTimes.join(', ')}. Consider if these are necessary.`
    );
  }
  
  return recommendations;
} 