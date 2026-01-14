import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/db'
import User from '@/models/User'

// Input validation schema
const updatePasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = updatePasswordSchema.parse(body)
    const { token, email, password } = validatedData
    
    // Connect to database
    await connectDB()
    
    // Find the user by email and valid token
    const user = await User.findOne({
      email,
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() } // Token must not be expired
    })
    
    // If user not found or token invalid
    if (!user) {
      return NextResponse.json({ 
        error: 'Invalid or expired password reset link' 
      }, { status: 400 })
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Update user with new password and clear reset token
    await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword
        },
        $unset: {
          resetToken: "",
          resetTokenExpiry: ""
        }
      }
    )
    
    // Return success response
    return NextResponse.json({ 
      message: 'Password has been successfully updated' 
    })
    
  } catch (error) {
    console.error('Password update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
} 