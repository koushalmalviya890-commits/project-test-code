// // import mongoose, { Schema, Document } from 'mongoose'
// // import bcrypt from 'bcryptjs'

// // export interface IUser extends Document {
// //   email: string
// //   password?: string
// //   userType?: string
// //   name?: string
// //   image?: string
// //   googleProfile?: {
// //     id: string
// //     name: string
// //     email: string
// //     image: string
// //   }
// //   resetOTP?: string
// //   resetOTPExpiry?: Date
// //   resetOTPCreatedAt?: Date
// //   comparePassword(candidatePassword: string): Promise<boolean>
// // }

// // const UserSchema = new Schema<IUser>(
// //   {
// //     email: {
// //       type: String,
// //       required: [true, 'Please provide an email'],
// //       unique: true,
// //       lowercase: true,
// //       trim: true,
// //     },
// //     password: {
// //       type: String,
// //       required: false,
// //       minlength: 6,
// //     },
// //     userType: {
// //       type: String,
// //       enum: ['startup', 'Service Provider', null],
// //       default: null,
// //     },
// //     name: {
// //       type: String,
// //       trim: true,
// //     },
// //     image: {
// //       type: String,
// //     },
// //     googleProfile: {
// //       id: String,
// //       name: String,
// //       email: String,
// //       image: String,
// //     },

// //     // 🔐 OTP-related fields
// //     resetOTP: {
// //       type: String,
// //     },
// //     resetOTPExpiry: {
// //       type: Date,
// //     },
// //     resetOTPCreatedAt: {
// //       type: Date,
// //     },
// //   },
// //   { 
// //     timestamps: true,
// //     collection: 'Users' // Explicitly set the collection name to 'Users'
// //   }
// // )

// // // Hash password before saving
// // UserSchema.pre('save', async function (next) {
// //   if (!this.isModified('password') || !this.password) return next()

// //   try {
// //     const salt = await bcrypt.genSalt(10)
// //     this.password = await bcrypt.hash(this.password, salt)
// //     next()
// //   } catch (error: any) {
// //     next(error)
// //   }
// // })

// // // Method to compare password for login
// // UserSchema.methods.comparePassword = async function (candidatePassword: string) {
// //   try {
// //     if (!this.password) return false
// //     return await bcrypt.compare(candidatePassword, this.password)
// //   } catch (error) {
// //     return false
// //   }
// // }

// // // Delete the User model if it exists to prevent OverwriteModelError
// // const User = mongoose.models.Users || mongoose.model<IUser>('Users', UserSchema)

// // export default User
// import mongoose, { Schema, Document } from 'mongoose'
// import bcrypt from 'bcryptjs'

// export interface IUser extends Document {
//   email: string
//   password?: string
//   userType?: string
//   name?: string
//   image?: string
//   googleProfile?: {
//     id: string
//     name: string
//     email: string
//     image: string
//   }
//   resetOTP?: string
//   resetOTPExpiry?: Date
//   resetOTPCreatedAt?: Date
//   comparePassword(candidatePassword: string): Promise<boolean>
//   isOTPValid(otp: string): boolean
//   isOTPExpired(): boolean
// }

// const UserSchema = new Schema(
//   {
//     email: {
//       type: String,
//       required: [true, 'Please provide an email'],
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },
//     password: {
//       type: String,
//       required: false,
//       minlength: 6,
//     },
//     userType: {
//       type: String,
//       enum: ['startup', 'Service Provider', null],
//       default: null,
//     },
//     name: {
//       type: String,
//       trim: true,
//     },
//     image: {
//       type: String,
//     },
//     googleProfile: {
//       id: String,
//       name: String,
//       email: String,
//       image: String,
//     },
    
//     // 🔐 OTP-related fields
//     resetOTP: {
//       type: String,
//       // select: false, // Don't include in queries by default for security
//     },
//     resetOTPExpiry: {
//       type: Date,
//       // select: false,
//     },
//     resetOTPCreatedAt: {
//       type: Date,
//       // select: false,
//     },
//   },
//   {
//     timestamps: true,
//     collection: 'Users' // Explicitly set the collection name to 'Users'
//   }
// )

// // Hash password before saving
// UserSchema.pre('save', async function (next) {
//   if (!this.isModified('password') || !this.password) return next()
  
//   try {
//     const salt = await bcrypt.genSalt(10)
//     this.password = await bcrypt.hash(this.password, salt)
//     next()
//   } catch (error: any) {
//     next(error)
//   }
// })

// // Method to compare password for login
// UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
//   try {
//     if (!this.password) return false
//     return await bcrypt.compare(candidatePassword, this.password)
//   } catch (error) {
//     return false
//   }
// }

// // Method to check if OTP is valid
// UserSchema.methods.isOTPValid = function (otp: string): boolean {
//   return this.resetOTP === otp && !this.isOTPExpired()
// }

// // Method to check if OTP is expired (5 minutes)
// UserSchema.methods.isOTPExpired = function (): boolean {
//   if (!this.resetOTPCreatedAt) return true
  
//   const now = new Date()
//   const createdAt = new Date(this.resetOTPCreatedAt)
//   const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)
  
//   return diffInMinutes > 5
// }

// // Index for automatic cleanup of expired OTPs
// UserSchema.index({ resetOTPCreatedAt: 1 }, { expireAfterSeconds: 300 }) // 5 minutes

// // Delete the User model if it exists to prevent OverwriteModelError
// const User = mongoose.models.Users || mongoose.model<IUser>('Users', UserSchema)

// export default User

// models/User.ts
import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  email: string
  password?: string
  userType?: string
  name?: string
  image?: string
  invoiceType?: string // Add invoice type to interface
  authProvider?: string
  authProviderId?: string
  isEmailVerified?: boolean
  googleProfile?: {
    id: string
    name: string
    email: string
    image: string
  }
  resetOTP?: string
  resetOTPExpiry?: Date
  resetOTPCreatedAt?: Date
     
  comparePassword(candidatePassword: string): Promise<boolean>
  isOTPValid(otp: string): boolean
  isOTPExpired(): boolean
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      minlength: 6,
    },
    userType: {
      type: String,
      enum: ['startup', 'Service Provider', null],
      default: null,
    },
    name: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    // Add invoice type field
    invoiceType: {
      type: String,
      enum: ['self', 'cumma'],
      default: 'self',
    },
    // Add auth provider fields (these were missing from your original model)
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    authProviderId: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    googleProfile: {
      id: String,
      name: String,
      email: String,
      image: String,
    },
    resetOTP: {
      type: String,
      select: false, // Hide from default queries
    },
    resetOTPExpiry: {
      type: Date,
      select: false,
    },
    resetOTPCreatedAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: 'Users',
  }
)

// 🔐 Pre-save hook to hash password if modified
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
 
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// 🔐 Compare entered password with hashed one
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false
  return await bcrypt.compare(candidatePassword, this.password)
}

// 🔐 OTP validity check
UserSchema.methods.isOTPValid = function (otp: string): boolean {
  return this.resetOTP === otp && !this.isOTPExpired()
}

// 🔐 OTP expiry check (5 minutes logic)
UserSchema.methods.isOTPExpired = function (): boolean {
  if (!this.resetOTPCreatedAt) return true
 
  const now = new Date()
  const createdAt = new Date(this.resetOTPCreatedAt)
  const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)
 
  return diffInMinutes > 5
}

// 🧹 MongoDB TTL index: auto deletes OTP fields after 5 minutes
// UserSchema.index({ resetOTPCreatedAt: 1 }, { expireAfterSeconds: 300 })

// ⛔ Prevent OverwriteModelError during hot reloads
const User =
  mongoose.models.Users || mongoose.model<IUser>('Users', UserSchema)

export default User