import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Startup from '@/models/Startup'
import ServiceProvider from '@/models/ServiceProvider'
import { authOptions } from '@/lib/auth'
import mongoose from 'mongoose'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Parse request body
    const body = await req.json()
    const { userType, email: emailFromBody } = body
    
    // Check if user is authenticated or email is provided
    if (!session?.user && !emailFromBody) {
      return NextResponse.json(
        { error: 'You must be signed in or provide an email to perform this action' },
        { status: 401 }
      )
    }
    
    // Validate userType
    if (!userType) {
      return NextResponse.json(
        { error: 'User type is required' },
        { status: 400 }
      )
    }
    
    // Validate userType value
    if (userType !== 'startup' && userType !== 'Service Provider') {
      return NextResponse.json(
        { error: 'Invalid user type. Must be "startup" or "Service Provider"' },
        { status: 400 }
      )
    }
    
    // Connect to database
    await connectDB()
    
    // Find user by email (either from session or from body)
    const email = session?.user?.email || emailFromBody
    const user = await User.findOne({ email })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Update user type
    user.userType = userType
    await user.save()
    
    // Create corresponding record in the appropriate collection using direct MongoDB operations
    // to bypass Mongoose validation
    try {
      // Ensure we have a valid database connection
      if (!mongoose.connection || !mongoose.connection.db) {
        throw new Error('Database connection not established');
      }
      
      const db = mongoose.connection.db;
      const now = new Date();
      
      if (userType === 'startup') {
        // Check if startup record already exists
        const existingStartup = await db.collection('Startups').findOne({ userId: user._id });
        
        if (!existingStartup) {
          // Create a new startup record with minimal required fields using direct MongoDB insertion
          await db.collection('Startups').insertOne({
            userId: user._id,
            startupName: null,
            contactName: null,
            contactNumber: null,
            founderName: null,
            founderDesignation: null,
            entityType: null,
            teamSize: null,
            industry: null,
            sector: null,
            stagecompleted: null,
            startupMailId: null,
            lookingFor: [],
            createdAt: now,
            updatedAt: now
          });
        }
      } else if (userType === 'Service Provider') {
        // Check if service provider record already exists
        const existingServiceProvider = await db.collection('Service Provider').findOne({ userId: user._id });
        
        if (!existingServiceProvider) {
          // Create a new service provider record with minimal required fields using direct MongoDB insertion
          await db.collection('Service Provider').insertOne({
            userId: user._id,
            serviceProviderType: null,
            serviceName: null,
            address: null,
            city: null,
            stateProvince: null,
            zipPostalCode: null,
            primaryContact1Name: null,
            primaryContact1Designation: null,
            primaryContactNumber: null,
            primaryEmailId: null,
            features: [],
            createdAt: now,
            updatedAt: now
          });
        }
      }
      
     // console.log(`Successfully created ${userType} profile for user ${user._id}`);
    } catch (error) {
      console.error('Error creating profile record:', error);
      // Continue execution even if profile creation fails
      // This way, at least the user type is updated
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'User type updated successfully',
        userType,
        refreshSession: true
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating user type:', error)
    return NextResponse.json(
      { error: 'An error occurred while updating user type' },
      { status: 500 }
    )
  }
} 