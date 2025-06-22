import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;

  console.log("Middleware triggered");
  console.log("Request path:", request.nextUrl.pathname);
  console.log("Token:", token);

  // لو مفيش توكن
  if (!token) {
    console.log("No token found");

    // لو حاول يدخل على صفحة مش خاصة زي صفحة اللوجين او الريجيستر نسيبه يدخل
    if (
      request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/rejester")
    ) {
      console.log("Allow access to public page:", request.nextUrl.pathname);
      return NextResponse.next();
    }

    // لو دخل على صفحة خاصة بدون توكن، نرجعّه للصفحة تسجيل الدخول
    const loginUrl = new URL("/login", request.url);
    console.log("Redirecting to login");
    return NextResponse.redirect(loginUrl);
  }

  // لو التوكن موجود، لو هو داخل على صفحة لوجين او ريجيستر، نوجهه للصفحة الرئيسية (main)
  if (
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/rejester"
  ) {
    const mainUrl = new URL("/main", request.url);
    console.log("Token exists but accessing login/register - redirect to main");
    return NextResponse.redirect(mainUrl);
  }

  // مسموح له يكمل
  console.log("Token exists, allow access to:", request.nextUrl.pathname);
  return NextResponse.next();
}

// تحدد في أي صفحات تستخدم الميدل وير (مثلاً كل الصفحات ما عدا api و _next)
export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
