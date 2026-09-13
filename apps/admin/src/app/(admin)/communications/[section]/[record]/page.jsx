import { notFound } from "next/navigation";
import CommunicationsPanel from "@/components/communications/CommunicationsPanel";
export default async function Page({ params }) {
  const { section, record } = await params;
  if (!["campaigns", "templates", "automations"].includes(section) || !["new", "notify"].includes(record) && !/^[a-f0-9]{24}$/.test(record)) notFound();
  if (record === "notify" && section !== "campaigns") notFound();
  return <CommunicationsPanel section={section} record={record} />;
}
