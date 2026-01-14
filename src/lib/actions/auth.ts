// 'use server'
// import { z } from 'zod'
// import { startupSignUpSchema, serviceProviderSignUpSchema } from '@/lib/validations/auth'
// import connectDB from '@/lib/db'
// import User from '@/models/User'
// import Startup from '@/models/Startup'
// import ServiceProvider from '@/models/ServiceProvider'
// import mongoose from 'mongoose'
// import crypto from 'crypto'
// import { sendServiceProviderAgreementEmail } from '@/lib/emailcontract';

// // Function to generate random alphanumeric ID
// function generateAuthProviderId(length: number = 24): string {
//   return crypto.randomBytes(length)
//     .toString('base64')
//     .replace(/[^a-zA-Z0-9]/g, '')
//     .slice(0, length);
// }

// export async function registerStartup(data: z.infer<typeof startupSignUpSchema>) {
//   try {
//    // console.log('Connecting to database...')
//     await connectDB()

//     if (!mongoose.connection.db) {
//       throw new Error('Database connection not established')
//     }
//    // console.log('Connected to database')

//    // console.log('Checking for existing user...')
//     const existingUser = await User.findOne({ email: data.email })
//     if (existingUser) {
//       throw new Error('User already exists')
//     }
//    // console.log('No existing user found')

//    // console.log('Creating user...')
//     const user = await User.create({
//       email: data.email,
//       password: data.password,
//       userType: 'startup',
//       authProvider: 'local',
//       authProviderId: generateAuthProviderId(),
//       isEmailVerified: false,
//       // Add invoice type to user model
//       // invoiceType: data.invoiceType || 'self', // Default to 'self' if not provided
//     })

//     const userId = user._id
//    // console.log('User created:', userId)

//     const startupData: any = {
//       userId,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       isNewUser: true,
//     }
//// console.log("Startup Data →", startupData)

//     const addIfNotEmpty = (key: string, value: any) => {
//       if (value !== undefined && value !== null && value !== '') {
//         startupData[key] = value
//       }
//     }

//     addIfNotEmpty('startupName', data.startupName)
//     addIfNotEmpty('contactName', data.contactName)
//     addIfNotEmpty('contactNumber', data.contactNumber)
//     addIfNotEmpty('founderName', data.founderName)
//     addIfNotEmpty('founderDesignation', data.founderDesignation)
//     addIfNotEmpty('entityType', data.entityType)
//     addIfNotEmpty('teamSize', data.teamSize)
//     addIfNotEmpty('dpiitNumber', data.dpiitNumber)
//     addIfNotEmpty('cin', data.cin)
//     addIfNotEmpty('gstnumber', data.gstnumber)
//     addIfNotEmpty('secondarycontactname', data.secondarycontactname)
//     addIfNotEmpty('secondarycontactdesignation', data.secondarycontactdesignation)
//     addIfNotEmpty('secondarycontactnumber', data.secondarycontactnumber)
//     addIfNotEmpty('industry', data.industry)
//     addIfNotEmpty('sector', data.sector)
//     addIfNotEmpty('stagecompleted', data.stagecompleted)
//     addIfNotEmpty('startupMailId', data.startupMailId)
//     addIfNotEmpty('website', data.website)
//     addIfNotEmpty('linkedinStartupUrl', data.linkedinStartupUrl)
//     addIfNotEmpty('linkedinFounderUrl', data.linkedinFounderUrl)
//     addIfNotEmpty('instagramurl', data.instagramurl)
//     addIfNotEmpty('twitterurl', data.twitterurl)
//     addIfNotEmpty('address', data.address)
//     addIfNotEmpty('city', data.city)
//     addIfNotEmpty('state', data.state)
//     addIfNotEmpty('pincode', data.pincode)
//     addIfNotEmpty('country', data.country)
//     addIfNotEmpty('category', data.category)
//     addIfNotEmpty('logoUrl', data.logoUrl)
//     addIfNotEmpty('gstnumber', data.gstnumber)
//     addIfNotEmpty('bankName', data.bankName)
//     addIfNotEmpty('accountNumber', data.accountNumber)
//     addIfNotEmpty('ifscCode', data.ifscCode)
//     addIfNotEmpty('accountHolderName', data.accountHolderName)
//     addIfNotEmpty('bankBranch', data.bankBranch)
//     addIfNotEmpty('confirmAccountNumber', data.confirmAccountNumber)
//     // addIfNotEmpty('invoiceType', data.invoiceType)
//     // Add invoice type to startup data as well
//     // addIfNotEmpty('invoiceType', data.invoiceType)

//     if (Array.isArray(data.lookingFor) && data.lookingFor.length > 0) {
//       startupData.lookingFor = data.lookingFor
//     }

//     const startup = await Startup.create(startupData)
//    // console.log(startup , `its for fully startup things `)
//    // console.log('Startup profile created:', startup._id)

//     return { success: true }
//   } catch (error: any) {
//     console.error('Registration error:', error)
//     return { error: error.message }
//   }
// }
// export async function registerServiceProvider(data: z.infer<typeof serviceProviderSignUpSchema>) {
//   try {
//    // console.log('Received data:', JSON.stringify(data, null, 2))
//    // console.log('invoiceType from data:', data.invoiceType, 'Type:', typeof data.invoiceType)
//    // console.log('gstNumber from data:', data.gstNumber, 'Type:', typeof data.gstNumber)
//    // console.log('invoiceTemplate thigs' , data.invoiceTemplate ,'type' , typeof data.invoiceTemplate)
//    // console.log('Connecting to database...')
//     await connectDB()

//     if (!mongoose.connection.db) {
//       throw new Error('Database connection not established')
//     }
//    // console.log('Connected to database')

//     // Check if user already exists
//    // console.log('Checking for existing user...')
//     const existingUser = await User.findOne({ email: data.email })
//     if (existingUser) {
//       throw new Error('User already exists')
//     }
//    // console.log('No existing user found')

//     // Create user
//    // console.log('Creating user...')
//     const user = await User.create({
//       email: data.email,
//       password: data.password,
//       userType: 'Service Provider',
//       authProvider: 'local',
//       authProviderId: generateAuthProviderId(),
//       isEmailVerified: false,
//       invoiceType: data.invoiceType,
//     })

//     const userId = user._id
//    // console.log('User created:', userId)

//     // Prepare service provider data
//    // console.log('Creating service provider profile...')

//     const cleanInvoiceType = data.invoiceType?.trim().toLowerCase()
//     if (!['self', 'cumma'].includes(cleanInvoiceType)) {
//       throw new Error('Invalid invoice type value')
//     }

//     const cleanSettlementType = data.settlementType?.trim().toLowerCase()
//     if (!['monthly', 'weekly'].includes(cleanSettlementType)) {
//       throw new Error('Invalid settlement type value')
//     }

//     const cleanInvoiceTemplate = data.invoiceTemplate?.trim().toLocaleLowerCase()
//     if(!['template1' , 'template2'].includes(cleanInvoiceTemplate)){
//       throw new Error('Invalid Invoice Template Selection')
//     }

//     const serviceProviderData: any = {
//       userId: userId,
//       settlementType: cleanSettlementType,
//       invoiceType: cleanInvoiceType,
//       invoiceTemplate:cleanInvoiceTemplate,
//       createdAt: new Date(),
//       updatedAt: new Date()
//     }

//     const addIfNotEmpty = (key: string, value: any) => {
//       if (value !== undefined && value !== null && value !== '') {
//         serviceProviderData[key] = value
//        // console.log(`Added ${key}:`, value)
//       } else {
//        // console.log(`Skipped ${key}:`, value)
//       }
//     }

//     serviceProviderData.features = Array.isArray(data.features) ? data.features : []
//     serviceProviderData.images = Array.isArray(data.images) ? data.images : []

//     serviceProviderData.timings = data.timings || {
//       monday: { isOpen: false },
//       tuesday: { isOpen: false },
//       wednesday: { isOpen: false },
//       thursday: { isOpen: false },
//       friday: { isOpen: false },
//       saturday: { isOpen: false },
//       sunday: { isOpen: false }
//     }

//     addIfNotEmpty('serviceProviderType', data.serviceProviderType)
//     addIfNotEmpty('serviceName', data.serviceName)
//     addIfNotEmpty('address', data.address)
//     addIfNotEmpty('city', data.city)
//     addIfNotEmpty('stateProvince', data.stateProvince)
//     addIfNotEmpty('zipPostalCode', data.zipPostalCode)
//     addIfNotEmpty('primaryContact1Name', data.primaryContact1Name)
//     addIfNotEmpty('primaryContact1Designation', data.primaryContact1Designation)
//     addIfNotEmpty('primaryContactNumber', data.primaryContactNumber)
//     addIfNotEmpty('primaryEmailId', data.email)
//     addIfNotEmpty('contact2Name', data.contact2Name)
//     addIfNotEmpty('contact2Designation', data.contact2Designation)
//     addIfNotEmpty('alternateContactNumber', data.alternateContactNumber)
//     addIfNotEmpty('alternateEmailId', data.alternateEmailId)
//     addIfNotEmpty('websiteUrl', data.websiteUrl)
//     addIfNotEmpty('logoUrl', data.logoUrl)
//     addIfNotEmpty('gstNumber', data.gstNumber)
//     addIfNotEmpty('bankName', data.bankName)
//     addIfNotEmpty('accountNumber', data.accountNumber)
//     addIfNotEmpty('ifscCode', data.ifscCode)
//     addIfNotEmpty('accountHolderName', data.accountHolderName)
//     addIfNotEmpty('bankBranch', data.bankBranch)
//     if (data.gstNumber && data.gstNumber.trim() !== '') {
//       serviceProviderData.gstNumber = data.gstNumber.trim()
//      // console.log('GST Number added:', serviceProviderData.gstNumber)
//     } else {
//       serviceProviderData.gstNumber = null
//      // console.log('GST Number set to null')
//     }

//     // Save Service Provider
//     try {
//       const serviceProvider = await ServiceProvider.create(serviceProviderData)
//      // console.log('Service provider created successfully:', serviceProvider._id)

//       // ✅ Send Agreement Email
//       await sendServiceProviderAgreementEmail({
//         to: data.email,
//         userId: userId,
//         serviceProviderName: data.primaryContact1Name || 'Service Provider',
//         entityType: data.serviceName || 'Individual',
//         aadhaarNumber: data.gstNumber || 'XXXX-XXXX',
//         residentialAddress: data.primaryContact1Designation || 'N/A',
//         businessAddress: `${data.address || ''}, ${data.city || ''}, ${data.stateProvince || ''}, ${data.zipPostalCode || ''}`
//       })

//       return { success: true }
//     } catch (createError) {
//       console.error('Direct creation failed:', createError)

//       const provider = new ServiceProvider(serviceProviderData)
//       await provider.validate()
//       const savedProvider = await provider.save()
//      // console.log('Provider saved successfully:', savedProvider._id)

//       // ✅ Send Agreement Email
//       await sendServiceProviderAgreementEmail({
//         userId: userId,
//         to: data.email,
//         serviceProviderName: data.serviceName || 'Service Provider',
//         entityType: data.serviceProviderType || 'Individual',
//         aadhaarNumber: data.gstNumber || 'XXXX-XXXX',
//         residentialAddress: data.address || 'N/A',
//         businessAddress: `${data.address || ''}, ${data.city || ''}, ${data.stateProvince || ''}, ${data.zipPostalCode || ''}`
//       })

//       return { success: true }
//     }
//   } catch (error: any) {
//     console.error('Registration error:', error)
//     return { error: error.message }
//   }
// }

"use server";
import { z } from "zod";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Startup from "@/models/Startup";
import ServiceProvider from "@/models/ServiceProvider";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendServiceProviderAgreementEmail } from "@/lib/emailcontract";
import { startupSignUpSchema } from "@/lib/validations/auth";
import { serviceProviderSignUpSchema } from "@/lib/validations/auth";
import { connectToDatabase } from "@/lib/mongodb";
import App from "next/app";
// Function to generate random alphanumeric ID
function generateAuthProviderId(length: number = 24): string {
  return crypto.randomBytes(length)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, length);
}

// Schema for email check
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Schema for set password
const setPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

// Action to check email against User and AffiliateLinkUsers
export async function checkAffiliateEmail(email: z.infer<typeof emailSchema>) {
  try {
 const { db } = await connectToDatabase();

    // Check AffiliateLinkUsers collection
    const affiliateUser = await db.collection("AffiliateLinkUsers").findOne({ mailId: email });
    if (!affiliateUser) {
      return { error: "Email not registered via affiliate link" };
    }

    // Check User collection
    const user = await db.collection("Users").findOne({ email: email });
    if (user) {
      return {
        existsInUsers: true,
        hasPassword: !!user.password,
      };
    }

    // Create new user without password
    const newUser = await User.create({
      email: email,
      userType: "startup",
      authProvider: "local",
      authProviderId: generateAuthProviderId(),
      isEmailVerified: false,
    });

    // Create startup with affiliate data
    const startupData = {
      userId: newUser._id,
      startupMailId: affiliateUser.mailId,
      contactNumber: affiliateUser.contactNumber,
      contactName: affiliateUser.contactName || "EswarK",
      createdAt: new Date(),
      updatedAt: new Date(),
      isNewUser: true,
    };

    await Startup.create(startupData);

    return {
      existsInUsers: false,
      hasPassword: false,
    };
  } catch (error: any) {
    console.error("Email check error:", error);
    return { error: error.message || "Failed to validate email" };
  }
}

// Action to set password and update/create startup
export async function setAffiliatePassword(data: z.infer<typeof setPasswordSchema>) {
  try {
    const { db } = await connectToDatabase();

    // Find user
    const user = await db.collection("Users").findOne({ email: data.email });
    if (!user) {
      return { error: "User not found" };
    }

    // Update user with hashed password
    // const hashedPassword = data.password;
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(data.password, salt)
    user.password = hashedPassword;
    await db.collection("Users").updateOne(
       { email: data.email },
       { $set: { password: hashedPassword } }
    );

    // Check if startup exists, create if not
    let startup = await db.collection("Startups").findOne({ userId: user._id });
    if (!startup) {
      const affiliateUser = await db.collection("AffiliateLinkUsers").findOne({ mailId: data.email });
      if (affiliateUser) {
        const startupData = {
          userId: user._id,
          startupMailId: affiliateUser.mailId,
          contactNumber: affiliateUser.contactNumber,
          contactName: affiliateUser.contactName ,
          createdAt: new Date(),
          updatedAt: new Date(),
          isNewUser: true,
        };
        startup = await Startup.create(startupData);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Set password error:", error);
    return { error: error.message || "Failed to set password" };
  }
}

// Updated registerStartup to handle both detailed and minimal signup
export async function registerStartup(data: z.infer<typeof startupSignUpSchema>) {
  try {
    await connectDB();
    const { db } = await connectToDatabase();
    // Check if user exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      if (existingUser.password && data.password) {
        return { error: "User already exists with a password" };
      }
      // Update password if provided
      if (data.password) {
        const hashedPassword = data.password;
        existingUser.password = hashedPassword;
        await existingUser.save();
      }

      // Check if startup exists
      let startup = await Startup.findOne({ userId: existingUser._id });
      if (!startup) {
        const affiliateUser = await db.collection("AffiliateLinkUsers").findOne({ mailId: data.email });
        const startupData: any = {
          userId: existingUser._id,
          createdAt: new Date(),
          updatedAt: new Date(),
          isNewUser: true,
        };

        // Add affiliate data if available
        if (affiliateUser) {
          startupData.startupMailId = affiliateUser.mailId;
          startupData.contactNumber = affiliateUser.contactNumber;
          startupData.contactName = affiliateUser.contactName;
        }

        // Add detailed signup data if provided
        const addIfNotEmpty = (key: string, value: any) => {
          if (value !== undefined && value !== null && value !== "") {
            startupData[key] = value;
          }
        };

        addIfNotEmpty("startupName", data.startupName);
        addIfNotEmpty("contactName", data.contactName);
        addIfNotEmpty("contactNumber", data.contactNumber);
        addIfNotEmpty("founderName", data.founderName);
        addIfNotEmpty("founderDesignation", data.founderDesignation);
        addIfNotEmpty("entityType", data.entityType);
        addIfNotEmpty("teamSize", data.teamSize);
        addIfNotEmpty("dpiitNumber", data.dpiitNumber);
        addIfNotEmpty("cin", data.cin);
        addIfNotEmpty("gstnumber", data.gstnumber);
        addIfNotEmpty("secondarycontactname", data.secondarycontactname);
        addIfNotEmpty("secondarycontactdesignation", data.secondarycontactdesignation);
        addIfNotEmpty("secondarycontactnumber", data.secondarycontactnumber);
        addIfNotEmpty("industry", data.industry);
        addIfNotEmpty("sector", data.sector);
        addIfNotEmpty("stagecompleted", data.stagecompleted);
        addIfNotEmpty("startupMailId", data.startupMailId);
        addIfNotEmpty("website", data.website);
        addIfNotEmpty("linkedinStartupUrl", data.linkedinStartupUrl);
        addIfNotEmpty("linkedinFounderUrl", data.linkedinFounderUrl);
        addIfNotEmpty("instagramurl", data.instagramurl);
        addIfNotEmpty("twitterurl", data.twitterurl);
        addIfNotEmpty("address", data.address);
        addIfNotEmpty("city", data.city);
        addIfNotEmpty("state", data.state);
        addIfNotEmpty("pincode", data.pincode);
        addIfNotEmpty("country", data.country);
        addIfNotEmpty("category", data.category);
        addIfNotEmpty("logoUrl", data.logoUrl);
        addIfNotEmpty("bankName", data.bankName);
        addIfNotEmpty("accountNumber", data.accountNumber);
        addIfNotEmpty("ifscCode", data.ifscCode);
        addIfNotEmpty("accountHolderName", data.accountHolderName);
        addIfNotEmpty("bankBranch", data.bankBranch);
        addIfNotEmpty("confirmAccountNumber", data.confirmAccountNumber);
        

        if (Array.isArray(data.lookingFor) && data.lookingFor.length > 0) {
          startupData.lookingFor = data.lookingFor;
        }
startupData.isProfileComplete = false; // Add this field
        startup = await Startup.create(startupData);

      }

      return { success: true };
    }

    // Create new user
    // const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : null;
    const user = await User.create({
      email: data.email,
      password: data.password,
      userType: "startup",
      authProvider: "local",
      authProviderId: generateAuthProviderId(),
      isEmailVerified: false,
    });

    // Create startup with affiliate data or detailed data
    const affiliateUser = await db.collection("AffiliateLinkUsers").findOne({ mailId: data.email });
    const startupData: any = {
      userId: user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isNewUser: true,
    };

    // Add affiliate data if available
    if (affiliateUser) {
      startupData.startupMailId = affiliateUser.mailId;
      startupData.contactNumber = affiliateUser.contactNumber;
      startupData.contactName = affiliateUser.contactName;
    }

    // Add detailed signup data if provided
    const addIfNotEmpty = (key: string, value: any) => {
      if (value !== undefined && value !== null && value !== "") {
        startupData[key] = value;
      }
    };

    addIfNotEmpty("startupName", data.startupName);
    addIfNotEmpty("contactName", data.contactName);
    addIfNotEmpty("contactNumber", data.contactNumber);
    addIfNotEmpty("founderName", data.founderName);
    addIfNotEmpty("founderDesignation", data.founderDesignation);
    addIfNotEmpty("entityType", data.entityType);
    addIfNotEmpty("teamSize", data.teamSize);
    addIfNotEmpty("dpiitNumber", data.dpiitNumber);
    addIfNotEmpty("cin", data.cin);
    addIfNotEmpty("gstnumber", data.gstnumber);
    addIfNotEmpty("secondarycontactname", data.secondarycontactname);
    addIfNotEmpty("secondarycontactdesignation", data.secondarycontactdesignation);
    addIfNotEmpty("secondarycontactnumber", data.secondarycontactnumber);
    addIfNotEmpty("industry", data.industry);
    addIfNotEmpty("sector", data.sector);
    addIfNotEmpty("stagecompleted", data.stagecompleted);
    addIfNotEmpty("startupMailId", data.startupMailId);
    addIfNotEmpty("website", data.website);
    addIfNotEmpty("linkedinStartupUrl", data.linkedinStartupUrl);
    addIfNotEmpty("linkedinFounderUrl", data.linkedinFounderUrl);
    addIfNotEmpty("instagramurl", data.instagramurl);
    addIfNotEmpty("twitterurl", data.twitterurl);
    addIfNotEmpty("address", data.address);
    addIfNotEmpty("city", data.city);
    addIfNotEmpty("state", data.state);
    addIfNotEmpty("pincode", data.pincode);
    addIfNotEmpty("country", data.country);
    addIfNotEmpty("category", data.category);
    addIfNotEmpty("logoUrl", data.logoUrl);
    addIfNotEmpty("bankName", data.bankName);
    addIfNotEmpty("accountNumber", data.accountNumber);
    addIfNotEmpty("ifscCode", data.ifscCode);
    addIfNotEmpty("accountHolderName", data.accountHolderName);
    addIfNotEmpty("bankBranch", data.bankBranch);
    addIfNotEmpty("confirmAccountNumber", data.confirmAccountNumber);

    if (Array.isArray(data.lookingFor) && data.lookingFor.length > 0) {
      startupData.lookingFor = data.lookingFor;
    }

    await Startup.create(startupData);

    return { success: true };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { error: error.message || "Registration failed" };
  }
}

// Existing registerServiceProvider function (unchanged)
export async function registerServiceProvider(data: z.infer<typeof serviceProviderSignUpSchema>) {
  try {
   // console.log("Received data:", JSON.stringify(data, null, 2));
   // console.log("invoiceType from data:", data.invoiceType, "Type:", typeof data.invoiceType);
   // console.log("gstNumber from data:", data.gstNumber, "Type:", typeof data.gstNumber);
   // console.log("invoiceTemplate thigs", data.invoiceTemplate, "type", typeof data.invoiceTemplate);
   // console.log("Connecting to database...");
    await connectDB();

    if (!mongoose.connection.db) {
      throw new Error("Database connection not established");
    }
   // console.log("Connected to database");

    // Check if user already exists
   // console.log("Checking for existing user...");
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new Error("User already exists");
    }
   // console.log("No existing user found");

    // Create user
   // console.log("Creating user...");
    const user = await User.create({
      email: data.email,
      password: data.password,
      userType: "Service Provider",
      authProvider: "local",
      authProviderId: generateAuthProviderId(),
      isEmailVerified: false,
      invoiceType: data.invoiceType,
    });

    const userId = user._id;
   // console.log("User created:", userId);

    // Prepare service provider data
   // console.log("Creating service provider profile...");

    const cleanInvoiceType = data.invoiceType?.trim().toLowerCase();
    if (!["self", "cumma"].includes(cleanInvoiceType)) {
      throw new Error("Invalid invoice type value");
    }


    const cleanApplyGst = data.applyGst?.trim().toLowerCase();
    if (!["yes", "no"].includes(cleanApplyGst)) {
      throw new Error("Invalid apply GST value");
    }
    const cleanSettlementType = data.settlementType?.trim().toLowerCase();
    if (!["monthly", "weekly"].includes(cleanSettlementType)) {
      throw new Error("Invalid settlement type value");
    }

    const cleanInvoiceTemplate = data.invoiceTemplate?.trim().toLowerCase();
    if (!["template1", "template2"].includes(cleanInvoiceTemplate)) {
      throw new Error("Invalid Invoice Template Selection");
    }

    const serviceProviderData: any = {
      userId: userId,
      settlementType: cleanSettlementType,
      invoiceType: cleanInvoiceType,
      applyGst: cleanApplyGst,
      invoiceTemplate: cleanInvoiceTemplate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const addIfNotEmpty = (key: string, value: any) => {
      if (value !== undefined && value !== null && value !== "") {
        serviceProviderData[key] = value;
       // console.log(`Added ${key}:`, value);
      } else {
       // console.log(`Skipped ${key}:`, value);
      }
    };

    serviceProviderData.features = Array.isArray(data.features) ? data.features : [];
    serviceProviderData.images = Array.isArray(data.images) ? data.images : [];

    serviceProviderData.timings = data.timings || {
      monday: { isOpen: false },
      tuesday: { isOpen: false },
      wednesday: { isOpen: false },
      thursday: { isOpen: false },
      friday: { isOpen: false },
      saturday: { isOpen: false },
      sunday: { isOpen: false },
    };

    addIfNotEmpty("serviceProviderType", data.serviceProviderType);
    addIfNotEmpty("serviceName", data.serviceName);
    addIfNotEmpty("address", data.address);
    addIfNotEmpty("city", data.city);
    addIfNotEmpty("stateProvince", data.stateProvince);
    addIfNotEmpty("zipPostalCode", data.zipPostalCode);
    addIfNotEmpty("primaryContact1Name", data.primaryContact1Name);
    addIfNotEmpty("primaryContact1Designation", data.primaryContact1Designation);
    addIfNotEmpty("primaryContactNumber", data.primaryContactNumber);
    addIfNotEmpty("primaryEmailId", data.email);
    addIfNotEmpty("contact2Name", data.contact2Name);
    addIfNotEmpty("contact2Designation", data.contact2Designation);
    addIfNotEmpty("alternateContactNumber", data.alternateContactNumber);
    addIfNotEmpty("alternateEmailId", data.alternateEmailId);
    addIfNotEmpty("websiteUrl", data.websiteUrl);
    addIfNotEmpty("logoUrl", data.logoUrl);
    addIfNotEmpty("gstNumber", data.gstNumber);
    addIfNotEmpty("bankName", data.bankName);
    addIfNotEmpty("accountNumber", data.accountNumber);
    addIfNotEmpty("ifscCode", data.ifscCode);
    addIfNotEmpty("accountHolderName", data.accountHolderName);
    addIfNotEmpty("bankBranch", data.bankBranch);

    if (data.gstNumber && data.gstNumber.trim() !== "") {
      serviceProviderData.gstNumber = data.gstNumber.trim();
     // console.log("GST Number added:", serviceProviderData.gstNumber);
     // console.log("apply gst " , serviceProviderData.applyGst)
    } else {
      serviceProviderData.gstNumber = null;
     // console.log("GST Number set to null");
    }

    // Save Service Provider
    try {
      const serviceProvider = await ServiceProvider.create(serviceProviderData);
     // console.log("Service provider created successfully:", serviceProvider._id);

      // Send Agreement Email (non-blocking)
      try {
        await sendServiceProviderAgreementEmail({
          to: data.email,
          userId: userId,
          serviceProviderName: data.primaryContact1Name || "Service Provider",
          entityType: data.serviceName || "Individual",
          aadhaarNumber: data.gstNumber || "XXXX-XXXX",
          residentialAddress: data.primaryContact1Designation || "N/A",
          businessAddress: `${data.address || ""}, ${data.city || ""}, ${data.stateProvince || ""}, ${data.zipPostalCode || ""}`,
        })
      } catch (emailErr: any) {
        console.error('Non-fatal: failed to send agreement email:', emailErr?.message ?? emailErr)
        // Continue — registration succeeded, but agreement email failed. Consider retrying via background job.
      }

      return { success: true };
    } catch (createError) {
      console.error("Direct creation failed:", createError);

      const provider = new ServiceProvider(serviceProviderData);
      await provider.validate();
      const savedProvider = await provider.save();
     // console.log("Provider saved successfully:", savedProvider._id);

      // Send Agreement Email (non-blocking)
      try {
        await sendServiceProviderAgreementEmail({
          userId: userId,
          to: data.email,
          serviceProviderName: data.serviceName || "Service Provider",
          entityType: data.serviceProviderType || "Individual",
          aadhaarNumber: data.gstNumber || "XXXX-XXXX",
          residentialAddress: data.address || "N/A",
          businessAddress: `${data.address || ""}, ${data.city || ""}, ${data.stateProvince || ""}, ${data.zipPostalCode || ""}`,
        })
      } catch (emailErr: any) {
        console.error('Non-fatal: failed to send agreement email:', emailErr?.message ?? emailErr)
        // Continue — registration succeeded, but agreement email failed. Consider retrying via background job.
      }

      return { success: true };
    }
  } catch (error: any) {
    console.error("Registration error:", error);
    return { error: error.message };
  }
}
