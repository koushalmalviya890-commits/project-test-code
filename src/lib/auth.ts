import { NextAuthOptions } from 'next-auth'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { clientPromise } from '@/lib/db'
import User from '@/models/User'
import connectDB from '@/lib/db'
import bcrypt from 'bcryptjs'
import ServiceProviderModel from '@/models/ServiceProvider'

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise, {
    collections: {
      Users: "Users",
      Accounts: "Accounts",
      Sessions: "Sessions",
      VerificationTokens: "VerificationTokens",
    }
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          await connectDB()

          const user = await User.findOne({ email: credentials.email })

          if (!user) {
            throw new Error('No user found with this email')
          }
console.log("User Type:", user.userType);

          // If the user signed up with Google, don't allow password login
          if (user.googleProfile && !user.password) {
            throw new Error('Please sign in with Google')
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error('Invalid password')
          }

         if (user.userType === 'Service Provider' || user.role === 'enabler') {
       
       const serviceProviderProfile = await ServiceProviderModel.findOne({ userId: user._id });

       // Debug logs (keep these for now)
       console.log("Found Profile:", serviceProviderProfile);
       console.log("Approval Status:", serviceProviderProfile?.isApproved);

       if (!serviceProviderProfile) {
           throw new Error("Profile not found");
       }

       // ✅ CORRECT LOGIC: 
       // Check if isApproved is false (or undefined/null)
       if (!serviceProviderProfile.isApproved) {
           throw new Error("Account pending approval"); 
       }
    }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            userType: user.userType,
            image: user.image,
          }
        } catch (error: any) {
          throw new Error(error.message)
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.userType = user.userType
      }

      // Always fetch the latest user data from the database
      // This ensures we have the most up-to-date userType
      if (token.email) {
        try {
          await connectDB()
          const latestUser = await User.findOne({ email: token.email })
          if (latestUser) {
            token.id = latestUser._id.toString()
            token.userType = latestUser.userType
          }
        } catch (error) {
          console.error('Error fetching latest user data:', error)
        }
      }

      // If it's a Google sign-in
      if (account && account.provider === 'google') {
        try {
          await connectDB()
          
          // Check if user exists
          const existingUser = await User.findOne({ email: token.email })
          
          if (existingUser) {
            // Update the user's Google profile information
            existingUser.name = token.name
            existingUser.image = token.picture
            existingUser.googleProfile = {
              id: account.providerAccountId,
              name: token.name,
              email: token.email,
              image: token.picture,
            }
            await existingUser.save()
            
            token.id = existingUser._id.toString()
            token.userType = existingUser.userType
          } else {
            // Create a new user
            const newUser = await User.create({
              email: token.email,
              name: token.name,
              image: token.picture,
              googleProfile: {
                id: account.providerAccountId,
                name: token.name,
                email: token.email,
                image: token.picture,
              },
              userType: null, // Will be set in the choose-account-type page
            })
            
            token.id = newUser._id.toString()
            token.userType = newUser.userType
          }
        } catch (error) {
          console.error('Error in JWT callback:', error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.userType = token.userType as string | undefined
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // If the user is signing in with Google and doesn't have a userType,
      // redirect them to the choose-account-type page
      if (url.startsWith(baseUrl)) {
        try {
          const urlObj = new URL(url)
          // Check if the user is being redirected to a protected page
          if (urlObj.pathname === '/landing' || 
              urlObj.pathname.startsWith('/startup') || 
              urlObj.pathname.startsWith('/service-provider')) {
            
            await connectDB()
            const session = await fetch(`${baseUrl}/api/auth/session`).then(res => res.json())
            
            if (session?.user?.id) {
              const user = await User.findById(session.user.id)
              
              if (user && !user.userType) {
                return `${baseUrl}/auth/choose-account-type`
              }
            }
          }
        } catch (error) {
          console.error('Error in redirect callback:', error)
        }
      }
      return url
    }
  },
  pages: {
    signIn: '/sign-in',
    newUser: '/auth/choose-account-type',
    error: '/sign-in',
  },
  secret: process.env.NEXTAUTH_SECRET,
} 