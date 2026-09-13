import { Suspense } from "react";
import EmailPreferences from "./preferences";
export const metadata = { title: "Email preferences | asif.to", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function Page() { return <Suspense fallback={<p className="p-8">Loading preferences…</p>}><EmailPreferences /></Suspense>; }
