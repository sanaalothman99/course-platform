import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware(routing)

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const isMaintenancePage = pathname.includes('/maintenance')
  const isAdminPage = pathname.includes('/admin')

  if (!isMaintenancePage && !isAdminPage) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/settings?t=${Date.now()}`,
        { cache: 'no-store' }
      )
      const data = await res.json()
      if (data?.maintenanceMode === true) {
        const locale = pathname.startsWith('/ar') ? 'ar' : 'en'
        const response = NextResponse.redirect(new URL(`/${locale}/maintenance`, req.url))
        response.headers.set('Cache-Control', 'no-store, no-cache')
        return response
      }
    } catch {
    }
  }

  const response = intlMiddleware(req)
  response.headers.set('Cache-Control', 'no-store, no-cache')
  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.\\..).*)'],
}