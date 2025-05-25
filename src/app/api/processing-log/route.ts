import { NextResponse } from 'next/server'
import { readJsonFile } from '@/lib/json_handler'
import type { AccountProcessingLog } from '@/types/api'

export async function GET() {
	try {
		const processingLog = await readJsonFile<AccountProcessingLog>('account_processing_log.json')
		
		// Sort by date (most recent first)
		const sortedLog = processingLog.sort((a, b) => 
			new Date(b.last_processed_at).getTime() - new Date(a.last_processed_at).getTime()
		)

		return NextResponse.json({
			success: true,
			logs: sortedLog,
			total: sortedLog.length
		})
	} catch (error) {
		console.error('Error loading processing log:', error)
		return NextResponse.json(
			{ error: 'Failed to load processing log' },
			{ status: 500 }
		)
	}
} 