import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AuthCard from "@/components/auth/AuthCard";
import AuthLayout from "@/components/auth/AuthLayout";

export const metadata = {
  title: "Forgot Password - asif.to",
  description: "Reset your asif.to account password.",
};

export default async function ForgotPasswordPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <AuthLayout>
      <AuthCard
        defaultTab="signin"
        initialForgotPassword={true}
        isModal={false}
        updateUrl={false}
      />
    </AuthLayout>
  );
}
