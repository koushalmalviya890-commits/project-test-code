'use server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/db'
import ServiceProvider from '@/models/ServiceProvider'
import { z } from 'zod'
import mongoose from 'mongoose'
import { authOptions } from '@/lib/auth'
import { set } from 'lodash'

// Define the timings schema
const dayTimingSchema = z.object({
  isOpen: z.boolean(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
})

const timingsSchema = z.object({
  monday: dayTimingSchema,
  tuesday: dayTimingSchema,
  wednesday: dayTimingSchema,
  thursday: dayTimingSchema,
  friday: dayTimingSchema,
  saturday: dayTimingSchema,
  sunday: dayTimingSchema,
})

const profileSchema = z.object({
  serviceProviderType: z.enum([
    'Incubator',
    'Accelerator',
    'Institution/University',
    'Private Coworking Space',
    'Community Space',
    'Studio'
  ]),
  serviceName: z.string(),
  address: z.string(),
  city: z.string(),
  stateProvince: z.string(),
  zipPostalCode: z.string(),
  primaryContact1Name: z.string(),
  primaryContact1Designation: z.string(),
  primaryContactNumber: z.string(),
  contact2Name: z.string().optional(),
  contact2Designation: z.string().optional(),
  alternateContactNumber: z.string().optional(),
  alternateEmailId: z.string().optional(),
  primaryEmailId: z.string().optional(),
  websiteUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  features: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  invoiceType: z.enum(["self", "cumma"]).default("cumma"),
   // Added missing invoiceType
   settlementType: z.enum(["monthly", "weekly"]).default("monthly"),
   invoiceTemplate:z.enum(["template1" ,"template2"]).default("template1"),
  bankName: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  ifscCode: z.string().optional().nullable(),
  accountHolderName: z.string().optional().nullable(),
  bankBranch: z.string().optional().nullable(),
  // ✅ Add this line
  gstNumber: z
  .string()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    "Please enter a valid GST number"
  )
  .optional()
  .nullable(),

  applyGst:z.enum(['yes','no']).default('no'),
  timings: z.object({
    monday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    tuesday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    wednesday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    thursday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    friday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    saturday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
    sunday: z.object({
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
    }),
  }),
})

type ServiceProviderProfile = z.infer<typeof profileSchema> & { gstNumber?: string; applyGst?: string }


interface ServiceProviderDocument {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  serviceProviderType: string
  serviceName: string
  address: string
  city: string
  stateProvince: string
  zipPostalCode: string
  primaryContact1Name: string
  primaryContact1Designation: string
  primaryContactNumber: string
  contact2Name?: string
  contact2Designation?: string
  alternateContactNumber?: string
  alternateEmailId?: string
  primaryEmailId?: string
  websiteUrl?: string
  logoUrl?: string
  features: string[]
  images: string[]
  invoiceType: string // Added missing invoiceType to interface
  gstNumber?: string // ✅ Add this line
  applyGst?: string // ✅ Add this line
  settlementType: string // Added settlementType to interface
  // ✅ Add this line
  invoiceTemplate:string
  bankName?: string
  accountNumber?: string
  ifscCode?: string
  // ✅ Add this line
  accountHolderName?: string
  bankBranch?: string

  timings?: {
    monday: { isOpen: boolean; openTime?: string; closeTime?: string }
    tuesday: { isOpen: boolean; openTime?: string; closeTime?: string }
    wednesday: { isOpen: boolean; openTime?: string; closeTime?: string }
    thursday: { isOpen: boolean; openTime?: string; closeTime?: string }
    friday: { isOpen: boolean; openTime?: string; closeTime?: string }
    saturday: { isOpen: boolean; openTime?: string; closeTime?: string }
    sunday: { isOpen: boolean; openTime?: string; closeTime?: string }
  }
  createdAt: Date
  updatedAt: Date
  __v: number
}

export async function getServiceProviderProfile() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error('Not authenticated')
    }

    await connectDB()

    const profile = await ServiceProvider.findOne({ 
      userId: new mongoose.Types.ObjectId(session.user.id)
    })
      .select('-__v')
      .lean() as ServiceProviderDocument

    if (!profile) {
      throw new Error('Profile not found')
    }

    // Convert MongoDB document to plain object and handle ObjectIds
    const plainProfile = JSON.parse(JSON.stringify(profile))

    // Transform MongoDB document to match our schema
// Transform MongoDB document to match our schema
  const transformedProfile: ServiceProviderProfile & { userId: string } = {
  userId: plainProfile.userId.toString(), // 👈 Include userId as string
  serviceProviderType: plainProfile.serviceProviderType as ServiceProviderProfile['serviceProviderType'],
  serviceName: plainProfile.serviceName,
  address: plainProfile.address,
  city: plainProfile.city,
  stateProvince: plainProfile.stateProvince,
  zipPostalCode: plainProfile.zipPostalCode,
  primaryContact1Name: plainProfile.primaryContact1Name,
  primaryContact1Designation: plainProfile.primaryContact1Designation,
  primaryContactNumber: plainProfile.primaryContactNumber,
  contact2Name: plainProfile.contact2Name,
  contact2Designation: plainProfile.contact2Designation,
  alternateContactNumber: plainProfile.alternateContactNumber,
  alternateEmailId: plainProfile.alternateEmailId,
  primaryEmailId: plainProfile.primaryEmailId,
  websiteUrl: plainProfile.websiteUrl,
  logoUrl: plainProfile.logoUrl,
  features: plainProfile.features || [],
  images: plainProfile.images || [],
  invoiceType: plainProfile.invoiceType || 'cumma',
  applyGst:plainProfile.applyGst || 'no',
  invoiceTemplate:plainProfile.invoiceTemplate || 'template1',
  gstNumber: plainProfile.gstNumber ?? '', 
  // ✅ Add this line
  settlementType: plainProfile.settlementType || 'monthly', // Added settlementType
  bankName: plainProfile.bankName || null,
  accountNumber: plainProfile.accountNumber || null,
  ifscCode: plainProfile.ifscCode || null,
  accountHolderName: plainProfile.accountHolderName || null,
  bankBranch: plainProfile.bankBranch || null,
  timings: plainProfile.timings || {
    monday: { isOpen: false, openTime: '', closeTime: '' },
    tuesday: { isOpen: false, openTime: '', closeTime: '' },
    wednesday: { isOpen: false, openTime: '', closeTime: '' },
    thursday: { isOpen: false, openTime: '', closeTime: '' },
    friday: { isOpen: false, openTime: '', closeTime: '' },
    saturday: { isOpen: false, openTime: '', closeTime: '' },
    sunday: { isOpen: false, openTime: '', closeTime: '' }
  }
}

return {
  success: true,
  data: transformedProfile
}

  } catch (error: any) {
    console.error('Error fetching profile:', error)
    return { error: error.message }
  }
}

export async function updateServiceProviderProfile(data: ServiceProviderProfile) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error('Not authenticated')
    }

    await connectDB()

    // Ensure timings and images are properly formatted before update
    const updateData = {
      ...data,
      features: Array.isArray(data.features) ? data.features : [],
      images: Array.isArray(data.images) ? data.images : [],
      invoiceType: data.invoiceType || 'cumma', // Added invoiceType to update data
      gstNumber: data.gstNumber === '' ? null : data.gstNumber,
      applyGst:data.applyGst ||"no",
      settlementType:data.settlementType ||"monthly",
      invoiceTemplate:data.invoiceTemplate || "template1",
 // ✅ Add this line
      timings: {
        monday: {
          isOpen: data.timings.monday.isOpen,
          openTime: data.timings.monday.openTime || '',
          closeTime: data.timings.monday.closeTime || ''
        },
        tuesday: {
          isOpen: data.timings.tuesday.isOpen,
          openTime: data.timings.tuesday.openTime || '',
          closeTime: data.timings.tuesday.closeTime || ''
        },
        wednesday: {
          isOpen: data.timings.wednesday.isOpen,
          openTime: data.timings.wednesday.openTime || '',
          closeTime: data.timings.wednesday.closeTime || ''
        },
        thursday: {
          isOpen: data.timings.thursday.isOpen,
          openTime: data.timings.thursday.openTime || '',
          closeTime: data.timings.thursday.closeTime || ''
        },
        friday: {
          isOpen: data.timings.friday.isOpen,
          openTime: data.timings.friday.openTime || '',
          closeTime: data.timings.friday.closeTime || ''
        },
        saturday: {
          isOpen: data.timings.saturday.isOpen,
          openTime: data.timings.saturday.openTime || '',
          closeTime: data.timings.saturday.closeTime || ''
        },
        sunday: {
          isOpen: data.timings.sunday.isOpen,
          openTime: data.timings.sunday.openTime || '',
          closeTime: data.timings.sunday.closeTime || ''
        }
      },
      updatedAt: new Date()
    }

    const updatedProfile = await ServiceProvider.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(session.user.id) },
      updateData,
      { new: true }
    ).select('-__v').lean() as ServiceProviderDocument

    if (!updatedProfile) {
      throw new Error('Profile not found')
    }

    // Convert MongoDB document to plain object and handle ObjectIds
    const plainUpdatedProfile = JSON.parse(JSON.stringify(updatedProfile))

    // Transform MongoDB document to match our schema
    const transformedProfile: ServiceProviderProfile = {
      serviceProviderType: plainUpdatedProfile.serviceProviderType as ServiceProviderProfile['serviceProviderType'],
      serviceName: plainUpdatedProfile.serviceName,
      address: plainUpdatedProfile.address,
      city: plainUpdatedProfile.city,
      stateProvince: plainUpdatedProfile.stateProvince,
      zipPostalCode: plainUpdatedProfile.zipPostalCode,
      primaryContact1Name: plainUpdatedProfile.primaryContact1Name,
      primaryContact1Designation: plainUpdatedProfile.primaryContact1Designation,
      primaryContactNumber: plainUpdatedProfile.primaryContactNumber,
      contact2Name: plainUpdatedProfile.contact2Name,
      contact2Designation: plainUpdatedProfile.contact2Designation,
      alternateContactNumber: plainUpdatedProfile.alternateContactNumber,
      alternateEmailId: plainUpdatedProfile.alternateEmailId,
      primaryEmailId: plainUpdatedProfile.primaryEmailId,
      websiteUrl: plainUpdatedProfile.websiteUrl,
      logoUrl: plainUpdatedProfile.logoUrl,
      features: plainUpdatedProfile.features || [],
      images: plainUpdatedProfile.images || [],
      invoiceType: plainUpdatedProfile.invoiceType || 'cumma', // Added missing invoiceType
      invoiceTemplate: plainUpdatedProfile.invoiceTemplate || 'template1',
      gstNumber: plainUpdatedProfile.gstNumber ?? '', // ✅ Add this line
      applyGst:plainUpdatedProfile.applyGst || 'no',
      settlementType: plainUpdatedProfile.settlementType || 'monthly', // Added settlementType
      bankName: plainUpdatedProfile.bankName || null,
      accountNumber: plainUpdatedProfile.accountNumber || null,
      ifscCode: plainUpdatedProfile.ifscCode || null,
      accountHolderName: plainUpdatedProfile.accountHolderName || null,
      bankBranch: plainUpdatedProfile.bankBranch || null,
      // ✅ Add this line
      timings: plainUpdatedProfile.timings || {
        monday: { isOpen: false, openTime: '', closeTime: '' },
        tuesday: { isOpen: false, openTime: '', closeTime: '' },
        wednesday: { isOpen: false, openTime: '', closeTime: '' },
        thursday: { isOpen: false, openTime: '', closeTime: '' },
        friday: { isOpen: false, openTime: '', closeTime: '' },
        saturday: { isOpen: false, openTime: '', closeTime: '' },
        sunday: { isOpen: false, openTime: '', closeTime: '' }
      }
    }

    return {
      success: true,
      data: transformedProfile
    }
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return { error: error.message }
  }
}