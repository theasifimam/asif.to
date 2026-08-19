import { redirect } from "next/navigation";

import { auth } from "@/auth";

export const metadata = {
  title: "My Account",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  redirect(`/${session.user.username}`);
}
