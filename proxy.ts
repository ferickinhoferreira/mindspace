import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isAuth = !!req.auth
  const { nextUrl } = req

  // If trying to access protected routes without auth
  if (!isAuth && (nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname.startsWith("/onboarding"))) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // If already authenticated and trying to access login/register
  if (isAuth && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
