import { NextResponse } from "next/server";
import { auth } from "@/auth";

const apiUrl = process.env.AUTH_API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function POST() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ success: false }, { status: 401 });
  if (!apiUrl || !process.env.AUTH_INTERNAL_SECRET)
    return NextResponse.json({ success: false }, { status: 503 });
  const upstream = await fetch(
    `${apiUrl.replace(/\/$/, "")}/auth/oauth/session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-internal-secret": process.env.AUTH_INTERNAL_SECRET,
      },
      body: JSON.stringify({
        userId: session.user.id,
        authenticatedAt: session.authenticatedAt,
      }),
      cache: "no-store",
    },
  );
  const result = await upstream.json().catch(() => ({}));
  if (!upstream.ok || !result?.data?.token)
    return NextResponse.json(
      {
        success: false,
        message: result?.message || "Unable to initialize account.",
      },
      { status: upstream.status || 503 },
    );
  const response = NextResponse.json({ success: true, user: result.data.user });
  response.cookies.set("token", result.data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    ...(process.env.NODE_ENV === "production" ? { domain: ".asif.to" } : {}),
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    ...(process.env.NODE_ENV === "production" ? { domain: ".asif.to" } : {}),
  });
  return response;
}
