// // import * as z from "zod"
// // import { SECTORS, ENTITY_TYPES, LOOKING_FOR } from '@/lib/constants'
// // import { INDUSTRIES, STAGES_COMPLETED } from '@/lib/constants/dropdowns'

// // // Define the timings schema
// // const dayTimingSchema = z.object({
// //   isOpen: z.boolean(),
// //   openTime: z.string().optional(),
// //   closeTime: z.string().optional(),
// // })

// // const timingsSchema = z.object({
// //   monday: dayTimingSchema,
// //   tuesday: dayTimingSchema,
// //   wednesday: dayTimingSchema,
// //   thursday: dayTimingSchema,
// //   friday: dayTimingSchema,
// //   saturday: dayTimingSchema,
// //   sunday: dayTimingSchema,
// // })

// // export const serviceProviderSignUpSchema = z.object({
// //   email: z.string().email("Please enter a valid email address"),
// //   password: z
// //     .string()
// //     .min(8, "Password must be at least 8 characters")
// //     .regex(
// //       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
// //       "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
// //     ),
// //   serviceProviderType: z.enum([
// //     "Incubator",
// //     "Accelerator",
// //     "Institution/University",
// //     "Private Coworking Space",
// //     "Community Space",
// //     "Studio"
// //   ]).optional().nullable(),
// //   serviceName: z.string().optional().nullable(),
// //   address: z.string().optional().nullable(),
// //   city: z.string().optional().nullable(),
// //   stateProvince: z.string().optional().nullable(),
// //   zipPostalCode: z.string().optional().nullable(),
// //   primaryContact1Name: z.string().optional().nullable(),
// //   primaryContact1Designation: z.string().optional().nullable(),
// //   primaryContactNumber: z.string().optional().nullable(),
// //   contact2Name: z.string().optional().nullable(),
// //   contact2Designation: z.string().optional().nullable(),
// //   alternateContactNumber: z.string().optional().nullable(),
// //   alternateEmailId: z.string().email("Please enter a valid email address").optional().nullable(),
// //   websiteUrl: z.string().url("Please enter a valid URL").optional().nullable(),
// //   features: z.array(z.string()).optional().default([]),
// //   images: z.array(z.string()).optional().default([]),
// //   primaryEmailId: z.string().email("Please enter a valid email address").optional().nullable(),
// //   logoUrl: z.string().optional().nullable(),
// //   invoiceType: z.enum(["self", "cumma"]).optional().default("self"),
// //   timings: timingsSchema.optional(),
// //   terms: z.literal(true, {
// //     errorMap: () => ({ message: "You must accept the terms and conditions" }),
// //   }),
// // })

// // export const startupSignUpSchema = z.object({
// //   email: z.string().email("Please enter a valid email address"),
// //   password: z
// //     .string()
// //     .min(8, "Password must be at least 8 characters")
// //     .regex(
// //       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
// //       "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
// //     ),
// //   confirmPassword: z
// //     .string()
// //     .min(1, "Confirm password is required"),
// //   startupName: z.string().min(1, "Company name is required"),
// //   contactName: z.string().optional().nullable(),
// //   contactNumber: z.string().min(1, "Contact number is required"),
// //   founderName: z.string().optional().nullable(),
// //   founderDesignation: z.string().optional().nullable(),
// //   entityType: z.string().min(1, "Entity type is required"),
// //   teamSize: z.number({
// //     invalid_type_error: "Team size must be a number",
// //   }).min(0, "Team size must be 0 or greater").optional().nullable(),
// //   dpiitNumber: z.string().optional().nullable(),
// //   cin: z.string().optional().nullable(),
// //   gstnumber: z.string().optional().nullable(),
// //   secondarycontactname: z.string().optional().nullable(),
// //   secondarycontactdesignation: z.string().optional().nullable(),
// //   secondarycontactnumber: z.string().optional().nullable(),
// //   industry: z.string().min(1, "Industry is required"),
// //   sector: z.string().min(1, "Sector is required"),
// //   stagecompleted: z.string().min(1, "Stage is required"),
// //   startupMailId: z.string().email("Please enter a valid startup email address").optional().nullable(),
// //   website: z.string().optional().nullable(),
// //   linkedinStartupUrl: z.string().optional().nullable(),
// //   linkedinFounderUrl: z.string().optional().nullable(),
// //   instagramurl: z.string().optional().nullable(),
// //   twitterurl: z.string().optional().nullable(),
// //   lookingFor: z.array(z.string()).min(1, "Please select at least one option"),
// //   address: z.string().min(1, "Address is required"),
// //   city: z.string().min(1, "City is required"),
// //   state: z.string().min(1, "State is required"),
// //   pincode: z.string().min(1, "ZIP/Postal code is required"),
// //   country: z.string().min(1, "Country is required"),
// //   category: z.string().min(1, "Category is required"),
// //   logoUrl: z.string().optional().nullable(),
// //   invoiceType: z.enum(["self", "cumma"]).optional().default("self"),
// //   terms: z.literal(true, {
// //     errorMap: () => ({ message: "You must accept the terms and conditions" }),
// //   }),
// // }).refine((data) => data.password === data.confirmPassword, {
// //   message: "Passwords do not match",
// //   path: ["confirmPassword"],
// // }).refine(
// //   (data) => {
// //     // Check if at least one social link is provided
// //     return !!(
// //       data.website || 
// //       data.linkedinStartupUrl || 
// //       data.linkedinFounderUrl || 
// //       data.instagramurl || 
// //       data.twitterurl
// //     );
// //   },
// //   {
// //     message: "At least one social link is required",
// //     path: ["website"], // Show error on the website field
// //   }
// // )

// // export const signInSchema = z.object({
// //   email: z.string().email("Please enter a valid email address"),
// //   password: z.string().min(1, "Password is required"),
// //   rememberMe: z.boolean().optional(),
// // }) 

// import * as z from "zod"
// import { SECTORS, ENTITY_TYPES, LOOKING_FOR } from '@/lib/constants'
// import { INDUSTRIES, STAGES_COMPLETED } from '@/lib/constants/dropdowns'

// // Define the timings schema
// const dayTimingSchema = z.object({
//   isOpen: z.boolean(),
//   openTime: z.string().optional(),
//   closeTime: z.string().optional(),
// })

// const timingsSchema = z.object({
//   monday: dayTimingSchema,
//   tuesday: dayTimingSchema,
//   wednesday: dayTimingSchema,
//   thursday: dayTimingSchema,
//   friday: dayTimingSchema,
//   saturday: dayTimingSchema,
//   sunday: dayTimingSchema,
// })

// export const serviceProviderSignUpSchema = z.object({
//   gstNumber: z
//   .string()
//   .regex(
//     /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
//     "Please enter a valid GST number"
//   )
//   .optional()
//   .nullable(),
//   email: z.string().email("Please enter a valid email address"),
//   password: z
//     .string()
//     .min(8, "Password must be at least 8 characters")
//     .regex(
//       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
//       "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
//     ),
//   serviceProviderType: z.enum([
//     "Incubator",
//     "Accelerator",
//     "Institution/University",
//     "Private Coworking Space",
//     "Community Space",
//     "Studio"
//   ]).optional().nullable(),
//   serviceName: z.string().optional().nullable(),
//   address: z.string().optional().nullable(),
//   city: z.string().optional().nullable(),
//   stateProvince: z.string().optional().nullable(),
//   zipPostalCode: z.string().optional().nullable(),
//   primaryContact1Name: z.string().optional().nullable(),
//   primaryContact1Designation: z.string().optional().nullable(),
//   primaryContactNumber: z.string().optional().nullable(),
//   contact2Name: z.string().optional().nullable(),
//   contact2Designation: z.string().optional().nullable(),
//   alternateContactNumber: z.string().optional().nullable(),
//   alternateEmailId: z.string().email("Please enter a valid email address").optional().nullable(),
//   websiteUrl: z.string().url("Please enter a valid URL").optional().nullable(),
//   features: z.array(z.string()).optional().default([]),
//   images: z.array(z.string()).optional().default([]),
//   primaryEmailId: z.string().email("Please enter a valid email address").optional().nullable(),
//   logoUrl: z.string().optional().nullable(),
//   invoiceType: z.enum(["self", "cumma"]).default("self"), 
//   invoiceTemplate: z.enum(["template1" , "template2"]).default
//   ("template1"),
//   settlementType: z.enum(["monthly", "weekly"]).default("monthly"),
//   bankName: z.string().optional().nullable(),
//  accountNumber: z.string().optional().nullable(),
//  ifscCode: z.string().optional().nullable(),
//   accountHolderName: z.string().optional().nullable(),
//   bankBranch: z.string().optional().nullable(),
//   timings: timingsSchema.optional(),
//   terms: z.literal(true, {
//     errorMap: () => ({ message: "You must accept the terms and conditions" }),
//   }),
// })

// export const startupSignUpSchema = z.object({
//     // ✅ Add this line below
//   email: z.string().email("Please enter a valid email address"),
//   password: z
//     .string()
//     .min(8, "Password must be at least 8 characters")
//     .regex(
//       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
//       "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
//     ),
//   confirmAccountNumber: z.string().optional().nullable(),
//   bankName: z.string().optional().nullable(),
//   accountNumber: z.string().optional().nullable(),
//   ifscCode: z.string().optional().nullable(),
//   accountHolderName: z.string().optional().nullable(),
//   bankBranch: z.string().optional().nullable(),
//   confirmPassword: z
//     .string()
//     .min(1, "Confirm password is required"),
//   startupName: z.string().min(1, "Company name is required"),
//   contactName: z.string().optional().nullable(),
//   contactNumber: z.string().min(1, "Contact number is required"),
//   founderName: z.string().optional().nullable(),
//   founderDesignation: z.string().optional().nullable(),
//   entityType: z.string().min(1, "Entity type is required"),
//   teamSize: z.number({
//     invalid_type_error: "Team size must be a number",
//   }).min(0, "Team size must be 0 or greater").optional().nullable(),
//   dpiitNumber: z.string().optional().nullable(),
//   cin: z.string().optional().nullable(),
//   gstnumber: z.string().optional().nullable(),
//   secondarycontactname: z.string().optional().nullable(),
//   secondarycontactdesignation: z.string().optional().nullable(),
//   secondarycontactnumber: z.string().optional().nullable(),
//   industry: z.string().min(1, "Industry is required"),
//   sector: z.string().min(1, "Sector is required"),
//   stagecompleted: z.string().min(1, "Stage is required"),
//   startupMailId: z.string().email("Please enter a valid startup email address").optional().nullable(),
//   website: z.string().optional().nullable(),
//   linkedinStartupUrl: z.string().optional().nullable(),
//   linkedinFounderUrl: z.string().optional().nullable(),
//   instagramurl: z.string().optional().nullable(),
//   twitterurl: z.string().optional().nullable(),
//   lookingFor: z.array(z.string()).min(1, "Please select at least one option"),
//   address: z.string().min(1, "Address is required"),
//   city: z.string().min(1, "City is required"),
//   state: z.string().min(1, "State is required"),
//    pincode: z.string()
//   .regex(/^[1-9][0-9]{5}$/, { message: 'Invalid pincode format' }),
//   country: z.string().min(1, "Country is required"),
//   category: z.string().min(1, "Category is required"),
//   logoUrl: z.string().optional().nullable(),
//   // Removed invoiceType from startup schema
//   terms: z.literal(true, {
//     errorMap: () => ({ message: "You must accept the terms and conditions" }),
//   }),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords do not match",
//   path: ["confirmPassword"],
// }).refine(
//   (data) => {
//     // Check if at least one social link is provided
//     return !!(
//       data.website || 
//       data.linkedinStartupUrl || 
//       data.linkedinFounderUrl || 
//       data.instagramurl || 
//       data.twitterurl
//     );
//   },
//   {
//     message: "At least one social link is required",
//     path: ["website"], // Show error on the website field
//   }
// )



import * as z from "zod";

export const startupEmailSignUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export const setPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const startupSignUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    )
    .optional()
    .nullable(),
  confirmPassword: z.string().min(1, "Confirm password is required").optional().nullable(),
  startupName: z.string().min(1, "Company name is required").optional().nullable(),
  contactName: z.string().optional().nullable(),
  contactNumber: z.string().min(1, "Contact number is required").optional().nullable(),
  founderName: z.string().optional().nullable(),
  founderDesignation: z.string().optional().nullable(),
  entityType: z.string().min(1, "Entity type is required").optional().nullable(),
  teamSize: z
    .number({ invalid_type_error: "Team size must be a number" })
    .min(0, "Team size must be 0 or greater")
    .optional()
    .nullable(),
  dpiitNumber: z.string().optional().nullable(),
  cin: z.string().optional().nullable(),
  gstnumber: z.string().optional().nullable(),
  secondarycontactname: z.string().optional().nullable(),
  secondarycontactdesignation: z.string().optional().nullable(),
  secondarycontactnumber: z.string().optional().nullable(),
  industry: z.string().min(1, "Industry is required").optional().nullable(),
  sector: z.string().min(1, "Sector is required").optional().nullable(),
  stagecompleted: z.string().min(1, "Stage is required").optional().nullable(),
  startupMailId: z.string().email("Please enter a valid startup email address").optional().nullable(),
  website: z.string().optional().nullable(),
  linkedinStartupUrl: z.string().optional().nullable(),
  linkedinFounderUrl: z.string().optional().nullable(),
  instagramurl: z.string().optional().nullable(),
  twitterurl: z.string().optional().nullable(),
  lookingFor: z.array(z.string()).min(1, "Please select at least one option").optional().nullable(),
  address: z.string().min(1, "Address is required").optional().nullable(),
  city: z.string().min(1, "City is required").optional().nullable(),
  state: z.string().min(1, "State is required").optional().nullable(),
  pincode: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, { message: "Invalid pincode format" })
    .optional()
    .nullable(),
  country: z.string().min(1, "Country is required").optional().nullable(),
  category: z.string().min(1, "Category is required").optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  ifscCode: z.string().optional().nullable(),
  accountHolderName: z.string().optional().nullable(),
  bankBranch: z.string().optional().nullable(),
  confirmAccountNumber: z.string().optional().nullable(),
  terms: z
    .literal(true, { errorMap: () => ({ message: "You must accept the terms and conditions" }) })
    .optional(),
}).refine(
  (data) => !data.password || data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
)

export const serviceProviderSignUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
  confirmPassword: z.string().min(1, "Confirm password is required"),
  invoiceType: z.enum(["self", "cumma"], {
    errorMap: () => ({ message: "Please select a valid invoice type" }),
  }),
  settlementType: z.enum(["monthly", "weekly"], {
    errorMap: () => ({ message: "Please select a valid settlement type" }),
  }),
  invoiceTemplate: z.enum(["template1", "template2"], {
    errorMap: () => ({ message: "Please select a valid invoice template" }),
  }),
  serviceProviderType: z.string().optional().nullable(),
  serviceName: z.string().min(1, "Service name is required"),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  stateProvince: z.string().optional().nullable(),
  zipPostalCode: z.string().optional().nullable(),
  primaryContact1Name: z.string().optional().nullable(),
  primaryContact1Designation: z.string().optional().nullable(),
  primaryContactNumber: z.string().optional().nullable(),
  primaryEmailId: z.string().email("Please enter a valid email address").optional().nullable(),
  contact2Name: z.string().optional().nullable(),
  contact2Designation: z.string().optional().nullable(),
  alternateContactNumber: z.string().optional().nullable(),
  alternateEmailId: z.string().email("Please enter a valid alternate email address").optional().nullable(),
  websiteUrl: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  gstNumber: z.string().optional().nullable(),
  applyGst: z.enum(["yes", "no"]).default("no"),
  bankName: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  ifscCode: z.string().optional().nullable(),
  accountHolderName: z.string().optional().nullable(),
  bankBranch: z.string().optional().nullable(),
  features: z.array(z.string()).optional().nullable(),
  images: z.array(z.string()).optional().nullable(),
  timings: z.object({
    monday: z.object({ isOpen: z.boolean(), openTime: z.string().optional(), closeTime: z.string().optional() }).optional(),
    tuesday: z.object({ isOpen: z.boolean(), openTime: z.string().optional(), closeTime: z.string().optional() }).optional(),
    wednesday: z.object({ isOpen: z.boolean(), openTime: z.string().optional(), closeTime: z.string().optional() }).optional(),
    thursday: z.object({ isOpen: z.boolean(), openTime: z.string().optional(), closeTime: z.string().optional() }).optional(),
    friday: z.object({ isOpen: z.boolean(), openTime: z.string().optional(), closeTime: z.string().optional() }).optional(),
    saturday: z.object({ isOpen: z.boolean(), openTime: z.string().optional(), closeTime: z.string().optional() }).optional(),
    sunday: z.object({ isOpen: z.boolean(), openTime: z.string().optional(), closeTime: z.string().optional() }).optional(),
  }).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
})