import { NextResponse } from "next/server";

export function middleware(request) {
  const response = NextResponse.next();

  // Example check
  const token = request.cookies.get("token")?.value;

  // DEBUG via header
  response.headers.set("x-debug-token", token || "no-token");

  return response;
}
