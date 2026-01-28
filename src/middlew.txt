import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { withAuth } from 'next-auth/middleware'
import { NextRequest } from 'next/server'

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req })
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/sign-in') ||
                      req.nextUrl.pathname.startsWith('/sign-up')
    const isLandingPage = req.nextUrl.pathname === '/'

    // If the user is authenticated but doesn't have a userType, redirect to choose-account-type
    // This handles the Google OAuth flow
    if (isAuth && token && !token.userType && 
        !req.nextUrl.pathname.startsWith('/auth/choose-account-type')) {
      return NextResponse.redirect(new URL('/auth/choose-account-type', req.url))
    }

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/', req.url))
      }
      return null
    }

    // Don't redirect from landing page even if authenticated
    if (isLandingPage) {
      return null
    }

    // Only check auth for protected routes
    if (req.nextUrl.pathname.startsWith('/startup') || 
        req.nextUrl.pathname.startsWith('/service-provider')) {
      if (!isAuth) {
        let from = req.nextUrl.pathname;
        if (req.nextUrl.search) {
          from += req.nextUrl.search;
        }

        return NextResponse.redirect(
          new URL(`/sign-in?from=${encodeURIComponent(from)}`, req.url)
        );
      }

      // Handle route protection based on user type
      if (token.userType === 'startup' && req.nextUrl.pathname.startsWith('/service-provider')) {
        return NextResponse.redirect(new URL('/startup/bookings', req.url))
      }

      if (token.userType === 'Service Provider' && req.nextUrl.pathname.startsWith('/startup')) {
        return NextResponse.redirect(new URL('/service-provider/dashboard', req.url))
      }

      // Redirect /startup to /startup/bookings
      if (token.userType === 'startup' && req.nextUrl.pathname === '/startup/dashboard') {
        return NextResponse.redirect(new URL('/startup/bookings', req.url))
      }
    }

    // Check if the request is for the add facilities page
    if (req.nextUrl.pathname.startsWith('/service-provider/add-facilities')) {
      try {
        // Get the base URL from the request
        const baseUrl = req.headers.get('x-forwarded-host') || req.nextUrl.host
        const protocol = req.headers.get('x-forwarded-proto') || req.nextUrl.protocol
        const apiUrl = `${protocol}://${baseUrl}/api/service-provider/profile`
        
        // Fetch the service provider profile with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(apiUrl, {
          headers: {
            'Cookie': req.headers.get('cookie') || '',
          },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.error(`Profile fetch failed with status: ${response.status}`);
          throw new Error('Failed to fetch profile')
        }
        
        const profile = await response.json()
        
        // Check if all required fields are filled
        const requiredFields = [
          profile.serviceProviderType,
          profile.serviceName,
          profile.address,
          profile.city,
          profile.stateProvince,
          profile.zipPostalCode,
          profile.primaryContact1Name,
          profile.primaryContact1Designation,
          profile.primaryContactNumber,
          profile.logoUrl
        ]
        
        const isProfileComplete = requiredFields.every(field => 
          field !== null && field !== undefined && field !== ''
        )
        
        if (!isProfileComplete) {
          return NextResponse.redirect(new URL('/service-provider/profile', req.url))
        }
      } catch (error) {
        console.error('Error in middleware:', error)
        // If there's an error, allow access to the page instead of redirecting
        // This prevents blocking access when there are network issues
        return null
      }
    }

    // Check if the request is for the booking API routes
    // if (req.nextUrl.pathname.startsWith('/api/bookings') && token && token.userType === 'startup') {
    //   try {
    //     // Get the base URL from the request
    //     const baseUrl = req.headers.get('x-forwarded-host') || req.nextUrl.host
    //     const protocol = req.headers.get('x-forwarded-proto') || req.nextUrl.protocol
    //     const apiUrl = `${protocol}://${baseUrl}/api/startup/profile`
        
    //     // Fetch the startup profile with a timeout
    //     const controller = new AbortController();
    //     const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
    //     const response = await fetch(apiUrl, {
    //       headers: {
    //         'Cookie': req.headers.get('cookie') || '',
    //       },
    //       signal: controller.signal
    //     })
        
    //     clearTimeout(timeoutId);
        
    //     if (!response.ok) {
    //       console.error(`Profile fetch failed with status: ${response.status}`);
    //       throw new Error('Failed to fetch profile')
    //     }
        
    //     const profile = await response.json()
        
    //     // Check if all required fields are filled
    //     const requiredFields = [
    //       profile.startupName,
    //       profile.contactName,
    //       profile.contactNumber,
    //       profile.founderName,
    //       profile.founderDesignation,
    //       profile.entityType,
    //       profile.teamSize,
    //       profile.startupMailId,
    //       profile.address,
    //       profile.logoUrl,
    //       profile.website,
    //       profile.linkedinStartupUrl,
    //       profile.linkedinFounderUrl
    //     ]
        
    //     const isProfileComplete = requiredFields.every(field => 
    //       field !== null && field !== undefined && field !== ''
    //     )
        
    //     if (!isProfileComplete) {
    //       return NextResponse.redirect(new URL('/startup/profile', req.url))
    //     }
    //   } catch (error) {
    //     console.error('Error in middleware:', error)
    //     // If there's an error, allow access instead of redirecting
    //     // This prevents blocking access when there are network issues
    //     return null
    //   }
    // }

    // Allow access to all other routes
    return null
  },
  {
    callbacks: {
      authorized: () => true
    },
  }
)

// Protect specific routes
export const config = {
  matcher: [
    '/startup/:path*',
    '/service-provider/:path*',
    '/sign-in',
    '/sign-up',
    '/auth/complete-profile',
    '/landing',
    '/service-provider/add-facilities/:path*'
    // '/api/bookings/:path*'
  ]
}  