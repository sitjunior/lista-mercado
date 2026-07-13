import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = process.env.ACCESS_TOKEN
  if (!token) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next/static') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    const urlToken = request.nextUrl.searchParams.get('token')
    if (urlToken === token) {
      return NextResponse.next()
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0 && segments[0] === token) {
    return NextResponse.next()
  }

  if (pathname === '/') {
    return NextResponse.next()
  }

  return new NextResponse('Not Found', { status: 404 })
}

export const config = {
  matcher: ['/((?!_next/static|favicon.ico).*)'],
}
