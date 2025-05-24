import { NextRequest, NextResponse } from 'next/server'
import { fetchTodaysEmailsWithContent } from '@/lib/google/actions'

export async function POST(request: NextRequest) {
	try {
		const { accessToken, maxResults = 10 } = await request.json()

		if (!accessToken) {
			return NextResponse.json(
				{ error: 'Access token is required' },
				{ status: 400 }
			)
		}

		console.log(`🚀 Fetching today's ${maxResults} emails with full content...`)
		
		const emails = await fetchTodaysEmailsWithContent(accessToken, maxResults)
		
		console.log(`✅ Successfully fetched ${emails.length} emails with content`)
		console.log(`📊 Content stats:`, {
			withTextContent: emails.filter(e => e.textContent).length,
			withHtmlContent: emails.filter(e => e.htmlContent).length,
			totalEmails: emails.length
		})

		return NextResponse.json({ 
			emails,
			stats: {
				totalFetched: emails.length,
				withTextContent: emails.filter(e => e.textContent).length,
				withHtmlContent: emails.filter(e => e.htmlContent).length,
				avgContentLength: emails.length > 0 
					? emails.reduce((sum, e) => sum + (e.bodyPreview?.length || 0), 0) / emails.length 
					: 0
			}
		})
	} catch (error) {
		console.error('❌ Error fetching today\'s emails with content:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch today\'s emails with content' },
			{ status: 500 }
		)
	}
} 