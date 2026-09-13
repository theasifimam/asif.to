import { notFound } from "next/navigation";
import CommunicationsPanel from "@/components/communications/CommunicationsPanel";
export default async function Page({ params }) {
  const { section } = await params;
  if (!["inbox", "campaigns", "subscribers", "automations", "transactional", "templates", "discussions", "analytics", "settings"].includes(section)) notFound();
  return <CommunicationsPanel section={section} />;
}
