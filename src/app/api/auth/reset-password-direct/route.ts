  // // import { NextResponse } from 'next/server'
  // // import { z } from 'zod'
  // // import bcrypt from 'bcryptjs'
  // // import connectDB from '@/lib/db'
  // // import User from '@/models/User'

  // // // Input validation schema
  // // const resetPasswordDirectSchema = z.object({
  // //   email: z.string().email('Invalid email address'),
  // //   password: z.string().min(8, 'Password must be at least 8 characters'),
  // // })

  // // export async function POST(request: Request) {
  // //   try {
  // //     const body = await request.json()
      
  // //     // Validate input
  // //     const validatedData = resetPasswordDirectSchema.parse(body)
  // //     const { email, password } = validatedData
      
  // //     // Connect to database
  // //     await connectDB()
      
  // //     // Find the user
  // //     const user = await User.findOne({ email })
      
  // //     // If user not found
  // //     if (!user) {
  // //       return NextResponse.json({ 
  // //         error: 'No account found with this email address' 
  // //       }, { status: 404 })
  // //     }
      
  // //     // Hash the new password
  // //     const hashedPassword = await bcrypt.hash(password, 10)
      
  // //     // Update user with new password
  // //     await User.updateOne(
  // //       { _id: user._id },
  // //       { $set: { password: hashedPassword } }
  // //     )
      
  // //     // Return success response
  // //     return NextResponse.json({ 
  // //       message: 'Password has been successfully updated' 
  // //     })
      
  // //   } catch (error) {
  // //     console.error('Direct password reset error:', error)
      
  // //     if (error instanceof z.ZodError) {
  // //       return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
  // //     }
      
  // //     return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  // //   }
  // // } 
  // export const runtime = 'nodejs'
  // import { NextResponse } from 'next/server'
  // import { z } from 'zod'
  // import crypto from 'crypto'
  // import connectDB from '@/lib/db'
  // import User from '@/models/User'
  // import nodemailer from 'nodemailer'
  // import bcryptjs from 'bcryptjs'

  // // Input validation schemas
  // const requestOtpSchema = z.object({
  //   email: z.string().email('Invalid email address'),
  //   action: z.literal('request_otp')
  // })

  // const verifyOtpSchema = z.object({
  //   email: z.string().email('Invalid email address'),
  //   otp: z.string().length(6, 'OTP must be 6 digits'),
  //   action: z.literal('verify_otp')
  // })

  // const resetPasswordSchema = z.object({
  //   email: z.string().email('Invalid email address'),
  //   otp: z.string().length(6, 'OTP must be 6 digits'),
  //   newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  //   action: z.literal('reset_password')
  // })

  // // Generate 6-digit OTP
  // const generateOTP = (): string => {
  //   return Math.floor(100000 + Math.random() * 900000).toString()
  // }

  // // Email configuration
  // const createEmailTransporter = () => {
  //   return nodemailer.createTransport({
  //     host: 'smtp.zoho.in',
  //     port: 465,
  //     secure: true,
  //     auth: {
  //       user: process.env.EMAIL_USER,
  //       pass: process.env.EMAIL_PASS
  //     }
  //   })
  // }

  // // Send OTP email
  // const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  //   const transporter = createEmailTransporter()

  //   const mailOptions = {
  //     from: process.env.EMAIL_USER,
  //     to: email,
  //     subject: 'Password Reset OTP',
  //     html: `
  //       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  //         <h2>Password Reset Request</h2>
  //         <p>You have requested to reset your password. Please use the following OTP to proceed:</p>
  //         <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
  //           ${otp}
  //         </div>
  //         <p>This OTP will expire in 5 minutes.</p>
  //         <p>If you didn't request this password reset, please ignore this email.</p>
  //       </div>
  //     `
  //   }

  //   await transporter.sendMail(mailOptions)
  // }

  // export async function POST(request: Request) {
  //   try {
  //     const body = await request.json()
  //     await connectDB()

  //     switch (body.action) {
  //       case 'request_otp':
  //         return await handleOTPRequest(body)
  //       case 'verify_otp':
  //         return await handleOTPVerification(body)
  //       case 'reset_password':
  //         return await handlePasswordReset(body)
  //       default:
  //         return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  //     }
  //   } catch (error) {
  //     console.error('Password reset error:', error)

  //     if (error instanceof z.ZodError) {
  //       return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
  //     }

  //     return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  //   }
  // }

  // async function handleOTPRequest(body: any) {
  //   const validatedData = requestOtpSchema.parse(body)
  //   const { email } = validatedData

  //   const user = await User.findOne({ email })
  //   if (!user) {
  //     return NextResponse.json({
  //       success: true,
  //       message: 'If your email is in our system, you will receive an OTP shortly.'
  //     })
  //   }

  //   const otp = generateOTP()
  //   const now = new Date()
  //   const otpExpiry = new Date(now.getTime() + 5 * 60 * 1000) // 5 minutes expiry

  //   await User.updateOne(
  //     { _id: user._id },
  //     {
  //       $set: {
  //         resetOTP: otp,
  //         resetOTPExpiry: otpExpiry,
  //         resetOTPCreatedAt: now
  //       }
  //     }
  //   )

  //   try {
  //     await sendOTPEmail(email, otp)
  //    // console.log(`OTP sent to ${email}: ${otp}`)
  //   } catch (emailError) {
  //     console.error('Failed to send OTP email:', emailError)
  //    // console.log(`OTP for ${email}: ${otp}`) // Remove in production
  //   }

  //   return NextResponse.json({
  //     success: true,
  //     message: 'If your email is in our system, you will receive an OTP shortly.'
  //   })
  // }

  // async function handleOTPVerification(body: any) {
  //   const validatedData = verifyOtpSchema.parse(body)
  //   const { email, otp } = validatedData

  //   const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

  //   const user = await User.findOne({
  //     email,
  //     resetOTP: otp,
  //     resetOTPCreatedAt: { $gt: fiveMinutesAgo }
  //   })

  //   if (!user) {
  //     return NextResponse.json({
  //       success: false,
  //       error: 'Invalid or expired OTP'
  //     }, { status: 400 })
  //   }

  //   return NextResponse.json({
  //     success: true,
  //     message: 'OTP verified successfully'
  //   })
  // }

  // async function handlePasswordReset(body: any) {
  //   const validatedData = resetPasswordSchema.parse(body)
  //   const { email, otp, newPassword } = validatedData

  //   const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

  //   const user = await User.findOne({
  //     email,
  //     resetOTP: otp,
  //     resetOTPCreatedAt: { $gt: fiveMinutesAgo }
  //   })

  //   if (!user) {
  //     return NextResponse.json({
  //       success: false,
  //       error: 'Invalid or expired OTP'
  //     }, { status: 400 })
  //   }

  //   const hashedPassword = await bcryptjs.hash(newPassword, 12)

  //   await User.updateOne(
  //     { _id: user._id },
  //     {
  //       $set: {
  //         password: hashedPassword
  //       },
  //       $unset: {
  //         resetOTP: 1,
  //         resetOTPExpiry: 1,
  //         resetOTPCreatedAt: 1,
  //         resetToken: 1,
  //         resetTokenExpiry: 1
  //       }
  //     }
  //   )

  //   return NextResponse.json({
  //     success: true,
  //     message: 'Password reset successfully'
  //   })
  // }


  export const runtime = 'nodejs'
  import { NextResponse } from 'next/server'
  import { z } from 'zod'
  import crypto from 'crypto'
  import connectDB from '@/lib/db'
  import User from '@/models/User'
  import nodemailer from 'nodemailer'
  import bcryptjs from 'bcryptjs'

  // Input validation schemas
  const requestOtpSchema = z.object({
    email: z.string().email('Invalid email address'),
    action: z.literal('request_otp')
  })

  const verifyOtpSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be numbers only'),
    action: z.literal('verify_otp')
  })

  const resetPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be numbers only'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    action: z.literal('reset_password')
  })

  // Generate 6-digit OTP
  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Email configuration
  const createEmailTransporter = () => {
    return nodemailer.createTransport({
      host: 'smtppro.zoho.in',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
  }

  // Send OTP email
  const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
    const transporter = createEmailTransporter()

    const mailOptions = {
       from: `"Cumma," <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Password Reset OTP - Expires in 5 minutes',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <!-- Brand Logo -->
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="cid:emailLogo" alt="Brand Logo" style="height: 60px;" />
      </div>

      <!-- Header Text -->
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #333; margin-bottom: 10px;">Password Reset Request</h2>
        <p style="color: #666; font-size: 16px;">
          You've requested to reset your password. Use the OTP below to proceed.
        </p>
      </div>

      <!-- OTP Box -->
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 30px;
        text-align: center;
        border-radius: 10px;
        margin: 30px 0;
      ">
        <div style="
          background: white;
          padding: 20px;
          border-radius: 8px;
          display: inline-block;
        ">
          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #333;
            font-family: 'Courier New', monospace;
          ">
            ${otp}
          </div>
        </div>
      </div>

      <!-- Expiry and Security Notice -->
      <div style="
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #dc3545;
        margin-bottom: 20px;
      ">
        <p style="margin: 0; color: #721c24; font-weight: 500;">
          ⚠️ <strong>Important:</strong> This OTP expires in 5 minutes.<br/>
          Do not share it with anyone for any reason.
        </p>
      </div>

      <!-- Footer -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px; margin: 0;">
          If you didn’t request a password reset, please ignore this email. Your password will remain safe.
        </p>
      </div>
    </div>
      `,
      attachments: [
        {
          filename: 'logo.png',
          path: './public/logo.png', // path relative to your project root
          cid: 'emailLogo'
        }
      ]
    }

    await transporter.sendMail(mailOptions)
  }

  export async function POST(request: Request) {
    try {
      const body = await request.json()
      await connectDB()

      switch (body.action) {
        case 'request_otp':
          return await handleOTPRequest(body)
        case 'verify_otp':
          return await handleOTPVerification(body)
        case 'reset_password':
          return await handlePasswordReset(body)
        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
      }
    } catch (error) {
      console.error('Password reset error:', error)

      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => err.message).join(', ')
        return NextResponse.json({ error: errorMessages }, { status: 400 })
      }

      return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
    }
  }

  // async function handleOTPRequest(body: any) {
  //   const validatedData = requestOtpSchema.parse(body)
  //   const { email } = validatedData

  //   // Find user by email
  //   const user = await User.findOne({ email }).select('+resetOTP +resetOTPCreatedAt +resetOTPExpiry')
    
  //   if (!user) {
  //     // Return success message even if user doesn't exist for security
  //     return NextResponse.json({
  //       success: true,
  //       message: 'If your email is registered with us, you will receive an OTP shortly.'
  //     })
  //   }

  //   // Generate new OTP
  //   const otp = generateOTP()
  //   const now = new Date()
  //   const otpExpiry = new Date(now.getTime() + 5 * 60 * 1000) // 5 minutes from now

  //   // Update user with new OTP
  //   await User.findByIdAndUpdate(user._id, {
  //     resetOTP: otp,
  //     resetOTPCreatedAt: now,
  //     resetOTPExpiry: otpExpiry
  //   })
  //   try {
  //     await sendOTPEmail(email, otp)
  //    // console.log(`✅ OTP sent to ${email}`)

  //     if (process.env.NODE_ENV === 'development') {
  //      // console.log(`🔐 OTP for ${email}: ${otp}`)
  //     }
  //   } catch (emailError) {
  //     console.error('❌ Failed to send OTP email:', emailError)

  //     if (process.env.NODE_ENV === 'development') {
  //      // console.log(`🔐 OTP (fallback log) for ${email}: ${otp}`)
  //     }

  //     return NextResponse.json({
  //       success: true,
  //       message: 'OTP generated, but email failed. Check logs in development.'
  //     })
  //   }

  //   // ✅ THIS LINE WAS MISSING
  //   return NextResponse.json({
  //     success: true,
  //     message: 'OTP sent successfully. Please check your email.'
  //   })

  // }

  async function handleOTPRequest(body: any) {
  const validatedData = requestOtpSchema.parse(body)
  const { email } = validatedData

  // Find user by email
  const user = await User.findOne({ email }).select('+resetOTP +resetOTPCreatedAt +resetOTPExpiry')

  // ❌ If user not found, throw error (no OTP sent)
  if (!user) {
    return NextResponse.json({
      success: false,
      error: 'Email not found. Please register first.'
    }, { status: 404 })
  }

  // ✅ Generate and send OTP
  const otp = generateOTP()
  const now = new Date()
  const otpExpiry = new Date(now.getTime() + 5 * 60 * 1000)

  await User.findByIdAndUpdate(user._id, {
    resetOTP: otp,
    resetOTPCreatedAt: now,
    resetOTPExpiry: otpExpiry
  })

  try {
    await sendOTPEmail(email, otp)
    //// console.log(`✅ OTP sent to ${email}`)

    if (process.env.NODE_ENV === 'development') {
      //// console.log(`🔐 OTP for ${email}: ${otp}`)
    }
  } catch (emailError) {
    // console.error('❌ Failed to send OTP email:', emailError)

    return NextResponse.json({
      success: false,
      error: 'OTP generation succeeded but email failed. Please try again.'
    }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: 'OTP sent successfully. Please check your email.'
  })
}


  async function handleOTPVerification(body: any) {
    const validatedData = verifyOtpSchema.parse(body)
    const { email, otp } = validatedData

    // Find user with OTP fields
  const user = await User.findOne({ email }).select('+resetOTP +resetOTPCreatedAt +resetOTPExpiry')
  //// console.log(user)


    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

    // Check if OTP exists
    if (!user.resetOTP || !user.resetOTPCreatedAt) {
      return NextResponse.json({
        success: false,
        error: 'No OTP found. Please request a new OTP.'
      }, { status: 400 })
    }

    // Check if OTP is expired (5 minutes)
    if (user.isOTPExpired()) {
      // Clear expired OTP
      await User.findByIdAndUpdate(user._id, {
        $unset: {
          resetOTP: 1,
          resetOTPCreatedAt: 1,
          resetOTPExpiry: 1
        }
      })
      
      return NextResponse.json({
        success: false,
        error: 'OTP has expired. Please request a new OTP.'
      }, { status: 400 })
    }

    // Check if OTP matches
    if (!user.isOTPValid(otp)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid OTP. Please check and try again.'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully. You can now reset your password.'
    })
  }

  async function handlePasswordReset(body: any) {
    const validatedData = resetPasswordSchema.parse(body)
    const { email, otp, newPassword } = validatedData

    // Find user with OTP fields
    const user = await User.findOne({ email }).select('+resetOTP +resetOTPCreatedAt +resetOTPExpiry')

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

    // Check if OTP exists
    if (!user.resetOTP || !user.resetOTPCreatedAt) {
      return NextResponse.json({
        success: false,
        error: 'No valid OTP found. Please request a new OTP.'
      }, { status: 400 })
    }

    // Check if OTP is expired
    if (user.isOTPExpired()) {
      // Clear expired OTP
      await User.findByIdAndUpdate(user._id, {
        $unset: {
          resetOTP: 1,
          resetOTPCreatedAt: 1,
          resetOTPExpiry: 1
        }
      })
      
      return NextResponse.json({
        success: false,
        error: 'OTP has expired. Please request a new OTP.'
      }, { status: 400 })
    }

    // Verify OTP
    if (!user.isOTPValid(otp)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid OTP. Please verify your OTP first.'
      }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 12)

    // Update password and clear OTP fields
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      $unset: {
        resetOTP: 1,
        resetOTPCreatedAt: 1,
        resetOTPExpiry: 1
      }
    })

    //// console.log(`Password reset successful for user: ${email}`)

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    })
  }