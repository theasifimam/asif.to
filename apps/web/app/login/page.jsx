import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AuthCard from "@/components/auth/AuthCard";
import AuthLayout from "@/components/auth/AuthLayout";

export const metadata = {
  title: "Sign In - asif.to",
  description: "Sign in to your asif.to learning account.",
};

function safeCallback(value) {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : "/auth/continue";
}

export default async function LoginPage({ searchParams }) {
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

  const defaultTab =
    params?.mode === "signup" || params?.tab === "signup" ? "signup" : "signin";

  return (
    <AuthLayout>
      <AuthCard
        defaultTab={defaultTab}
        callbackUrl={callbackUrl}
        isModal={false}
        updateUrl={true}
      />
    </AuthLayout>
  );
}
