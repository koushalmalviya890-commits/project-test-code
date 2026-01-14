import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const phoneNumber = body.phoneNumber || body.phone || null
    
    //// console.log("✅ Body received in whatsapp welcome message api:", body)

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'phoneNumber is required' },
        { status: 400 }
      )
    }

    let recipientNumber = phoneNumber.trim()
    recipientNumber = recipientNumber.replace(/[\s\-\(\)]/g, '')
    
    if (!recipientNumber.startsWith('+')) {
      recipientNumber = '+91' + recipientNumber
    }
    
    //// console.log('📱 Recipient number:', recipientNumber)

    const payload = {
      senderNumber: '+15558155404',
      contactNumbers: [recipientNumber],
      templateId: 26, // Using customer_interest template
    //   parameters: {
    //     'FIRSTNAME': body.name || 'User'
    //   }
    }

   // console.log('📤 Sending WhatsApp with payload:', JSON.stringify(payload, null, 2))

    const response = await axios.post(
      'https://api.brevo.com/v3/whatsapp/sendMessage',
      payload,
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY || '',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 10000,
      }
    )
    
   // console.log('✅ WhatsApp send response:', response.data)
    
    const messageId = response.data.messageId
   // console.log('📨 Message ID:', messageId)
    
setTimeout(async () => {
  try {
   // console.log('🔍 Checking message status for:', messageId)

    const start = new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutes ago
    const end = new Date().toISOString()

    const statusResponse = await axios.get(
      'https://api.brevo.com/v3/whatsapp/statistics/events',
      {
        params: {
          startDate: start,
          endDate: end,
          event: 'all', // or 'sent', 'delivered', 'read', 'failed'
        },
        headers: {
          'api-key': process.env.BREVO_API_KEY || '',
          Accept: 'application/json',
        },
      }
    )

   // console.log('📊 Message delivery events:', JSON.stringify(statusResponse.data, null, 2))

    const ourMessage = statusResponse.data?.events?.find(
      (e: any) => e.messageId === messageId || e.contact === recipientNumber
    )

    if (ourMessage) {
     // console.log('🎯 Found our message event:', ourMessage)
    } else {
     // console.log('⏳ Message event not found yet, check Brevo dashboard manually')
    }

  } catch (statusErr: any) {
    console.error('❌ Failed to check message status:', {
      message: statusErr?.message,
      response: statusErr?.response?.data,
      status: statusErr?.response?.status,
    })
  }
}, 10000)

    const successResponse = { 
      success: true,
      message: 'WhatsApp message sent successfully', 
      messageId: messageId,
      recipient: recipientNumber,
      data: response.data,
      note: 'Check your server console for delivery status after 10 seconds'
    }
    
   // console.log('✅ Returning success response:', successResponse)
    
    return NextResponse.json(successResponse)
    
  } catch (err: any) {
    console.error('❌ send-welcome-whatsapp error:', {
      message: err?.message,
      response: err?.response?.data,
      status: err?.response?.status,
      config: err?.config ? {
        url: err.config.url,
        data: err.config.data
      } : undefined
    })
    
    const errorData = err?.response?.data || { 
      message: err?.message || 'Failed to send WhatsApp message' 
    }
    
    return NextResponse.json({ 
      success: false,
      error: errorData 
    }, { 
      status: err?.response?.status || 500 
    })
  }
}
// ```

// ## How to Check if Messages Are Actually Delivering:

// ### 1. **Check Your Server Terminal/Console**
// Look at your terminal where you ran `npm run dev` - you should see:
// ```
// ✅ Body received in whatsapp welcome message api: { ... }
// 📱 Recipient number: +918895851839
// 📤 Sending WhatsApp with payload: { ... }
// ✅ WhatsApp send response: { messageId: '...' }
// 📨 Message ID: 5f9b09e6-4fcd-48d4-bded-7f81697f8442
// ✅ Returning success response: { ... }
// ```

// And after 10 seconds:
// ```
// 🔍 Checking message status for: 5f9b09e6-4fcd-48d4-bded-7f81697f8442
// 📊 Message delivery status: { ... }