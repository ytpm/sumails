import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken = process.env.TWILIO_AUTH_TOKEN!
const fromPhone = process.env.TWILIO_PHONE_NUMBER!

export async function POST(req: NextRequest) {
  const { to, body } = await req.json()

  const client = await twilio(accountSid, authToken)
  console.log(`Twilio client initialized: ${JSON.stringify(client)}`)

  if (!to || !body) {
    const error = process.env.NODE_ENV === 'development' ? 'Missing `to` or `body`' : 'Something went wrong'
    return NextResponse.json({ success: false, message: error }, { status: 400 })
  }

  try {
    const message = await client.messages.create({
      from: `whatsapp:${fromPhone}`,
      contentSid: 'HX229f5a04fd0510ce1b071852155d3e75',
      contentVariables: '{"1":"31337"}',
      to: `whatsapp:${to}`,
    })

    return NextResponse.json({ success: true, sid: message.sid })
  } catch (err) {
    console.error('[Twilio Error]', err)
    const error = process.env.NODE_ENV === 'development' ? err : 'Something went wrong'
    return NextResponse.json({ success: false, message: error }, { status: 500 })
  }
}
