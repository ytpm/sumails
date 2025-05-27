-- Database optimization for email_summaries table
-- Run this to add constraints and indexes for better performance

-- Note: Be careful with these operations in production
-- Consider backing up data before running these commands

-- Optional: If you want to make the new fields NOT NULL after migration
-- (Only run these after ensuring all existing records have been updated)

-- Make date_processed NOT NULL if all records have this field populated
-- ALTER TABLE email_summaries 
-- ALTER COLUMN date_processed SET NOT NULL;

-- Make inbox_status NOT NULL if all records have this field populated  
-- ALTER TABLE email_summaries
-- ALTER COLUMN inbox_status SET NOT NULL;

-- Make summary_data NOT NULL if all records have this field populated
-- ALTER TABLE email_summaries
-- ALTER COLUMN summary_data SET NOT NULL;

-- Drop existing constraints if they exist, then recreate them
-- This ensures we can run this script multiple times safely

-- Drop and recreate inbox_status constraint
ALTER TABLE email_summaries 
DROP CONSTRAINT IF EXISTS email_summaries_inbox_status_check;

ALTER TABLE email_summaries 
ADD CONSTRAINT email_summaries_inbox_status_check 
CHECK (inbox_status IN ('attention_needed', 'worth_a_look', 'all_clear'));

-- Drop and recreate delivery_status constraint
ALTER TABLE email_summaries
DROP CONSTRAINT IF EXISTS email_summaries_delivery_status_check;

ALTER TABLE email_summaries
ADD CONSTRAINT email_summaries_delivery_status_check
CHECK (delivery_status IN ('sent', 'failed', 'pending'));

-- Drop and recreate sent_via constraint
ALTER TABLE email_summaries  
DROP CONSTRAINT IF EXISTS email_summaries_sent_via_check;

ALTER TABLE email_summaries  
ADD CONSTRAINT email_summaries_sent_via_check
CHECK (sent_via IN ('email', 'whatsapp'));

-- Add indexes for better query performance (IF NOT EXISTS prevents duplicates)
CREATE INDEX IF NOT EXISTS idx_email_summaries_date_processed 
ON email_summaries(date_processed);

CREATE INDEX IF NOT EXISTS idx_email_summaries_inbox_status 
ON email_summaries(inbox_status);

CREATE INDEX IF NOT EXISTS idx_email_summaries_user_date 
ON email_summaries(user_id, date_processed);

CREATE INDEX IF NOT EXISTS idx_email_summaries_account_date 
ON email_summaries(connected_account_id, date_processed);

-- Add comments for documentation
COMMENT ON COLUMN email_summaries.date_processed IS 'Date the summary was processed (YYYY-MM-DD format)';
COMMENT ON COLUMN email_summaries.inbox_status IS 'AI-determined inbox status: attention_needed, worth_a_look, or all_clear';
COMMENT ON COLUMN email_summaries.summary_data IS 'Structured summary data from OpenAI (overview, insight, important_emails, suggestions)';
COMMENT ON COLUMN email_summaries.delivery_status IS 'Notification delivery status: sent, failed, or pending';
COMMENT ON COLUMN email_summaries.sent_via IS 'Notification delivery method: email or whatsapp';
COMMENT ON COLUMN email_summaries.sent_at IS 'Timestamp when notification was sent'; 