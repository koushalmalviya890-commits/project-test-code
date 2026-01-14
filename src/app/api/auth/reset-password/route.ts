import { NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import connectDB from '@/lib/db'
import User from '@/models/User'

// Input validation schema
const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Simple token generation function
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = resetPasswordSchema.parse(body)
    const { email } = validatedData
    
    // Connect to database
    await connectDB()
    
    // Find the user
    const user = await User.findOne({ email })
    
    // Even if user doesn't exist, return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ 
        message: 'If your email is in our system, you will receive password reset instructions shortly.' 
      })
    }
    
    // Generate token and expiry (24 hours from now)
    const resetToken = generateToken()
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    // Update user with reset token information
    await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          resetToken,
          resetTokenExpiry
        } 
      }
    )
    
    // In a real application, you would send an email with a reset link
    // For this simple implementation, we'll just log the reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
    
   // console.log('Password reset link:', resetLink)
    
    // Return success response
    return NextResponse.json({ 
      message: 'If your email is in our system, you will receive password reset instructions shortly.' 
    })
    
  } catch (error) {
    console.error('Password reset request error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Failed to process password reset request' }, { status: 500 })
  }
} 