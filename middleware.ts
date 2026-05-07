import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE = 'shevora_admin_session'
const SESSION_VALUE  = process.env.ADMIN_SESSION_VALUE ?? 'authenticated_shevora_2025'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /admin page routes (except login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = request.cookies.get(SESSION_COOKIE)?.value
    if (session !== SESSION_VALUE) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protect /api/admin/* routes (defense-in-depth; route handlers also check)
  if (pathname.startsWith('/api/admin/') && !pathname.startsWith('/api/admin/auth')) {
    const session = request.cookies.get(SESSION_COOKIE)?.value
    if (session !== SESSION_VALUE) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
