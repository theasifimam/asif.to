import { redirect } from "next/navigation";

import { auth } from "@/auth";

export const metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  redirect(`/${session.user.username}`);
}
