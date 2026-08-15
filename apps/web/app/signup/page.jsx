import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AuthCard from "@/components/auth/AuthCard";

export const metadata = {
  title: "Create Account - asif.to",
  description: "Create your asif.to learning account.",
};

function safeCallback(value) {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : "/auth/continue";
}

export default async function SignupPage({ searchParams }) {
  const params = await searchParams;
  const invite =
    typeof params?.invite === "string" && /^[a-f0-9]{64}$/.test(params.invite)
      ? params.invite
      : "";
  const callbackUrl = params?.callbackUrl
    ? safeCallback(params.callbackUrl)
    : invite
      ? `/auth/continue?invite=${invite}`
      : "/auth/continue";

  const session = await auth();
  if (session?.user) redirect(callbackUrl);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,.12),transparent_42%)] dark:bg-[radial-gradient(circle_at_top,rgba(59,130,246,.15),transparent_42%)]" />
      <div className="relative z-10 w-full max-w-[460px]">
        <AuthCard
          defaultTab="signup"
          callbackUrl={callbackUrl}
          isModal={false}
          updateUrl={true}
        />
      </div>
    </main>
  );
}
