import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AuthContinuePage({ searchParams }) {
  const session = await auth();
  if (!session?.user) redirect("/login?error=Configuration");
  const params = await searchParams;
  const invite = typeof params?.invite === "string" ? params.invite : "";
  if (/^[a-f0-9]{64}$/.test(invite)) {
    const apiUrl = process.env.AUTH_API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl && process.env.AUTH_INTERNAL_SECRET) {
      const response = await fetch(
        `${apiUrl.replace(/\/$/, "")}/auth/invitations/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-internal-secret": process.env.AUTH_INTERNAL_SECRET,
          },
          body: JSON.stringify({ token: invite, userId: session.user.id }),
          cache: "no-store",
        },
      );
      if (!response.ok) redirect("/login?error=AccessDenied");
    }
  }
  redirect(`/${session.user.username}`);
}
