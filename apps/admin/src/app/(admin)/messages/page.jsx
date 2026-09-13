import { redirect } from "next/navigation";
export default async function LegacyMessages({ searchParams }) {
 const params = new URLSearchParams(await searchParams);
 redirect(`/communications/team${params.size ? `?${params}` : ""}`);
}
