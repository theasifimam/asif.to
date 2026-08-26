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

// Map NextAuth error codes to user-friendly messages
const ERROR_MESSAGES = {
  Configuration: "Sign-in is not configured correctly. Please try again later.",
  AccessDenied:
    "Access was denied. Your account may not be allowed to sign in.",
  Verification: "The sign-in link has expired or was already used.",
  OAuthSignin: "Could not start the sign-in flow. Please try again.",
  OAuthCallback: "Something went wrong during sign-in. Please try again.",
  OAuthCreateAccount:
    "Could not create an account with that provider. Try a different sign-in method.",
  EmailCreateAccount: "Could not create an account with that email.",
  Callback: "An error occurred during sign-in. Please try again.",
  OAuthAccountNotLinked:
    "This email is already registered with a different sign-in method.",
  Default: "An unexpected error occurred. Please try again.",
};

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

  const errorCode = typeof params?.error === "string" ? params.error : null;
  const initialError = errorCode
    ? (ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default)
    : null;

  return (
    <AuthLayout>
      <AuthCard
        defaultTab={defaultTab}
        callbackUrl={callbackUrl}
        isModal={false}
        updateUrl={true}
        initialError={initialError}
      />
    </AuthLayout>
  );
}
