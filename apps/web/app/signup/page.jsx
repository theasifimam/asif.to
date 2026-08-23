import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AuthCard from "@/components/auth/AuthCard";
import AuthLayout from "@/components/auth/AuthLayout";

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
    <AuthLayout>
      <AuthCard
        defaultTab="signup"
        callbackUrl={callbackUrl}
        isModal={false}
        updateUrl={true}
      />
    </AuthLayout>
  );
}
