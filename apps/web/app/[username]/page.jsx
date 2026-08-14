import { redirect, notFound } from "next/navigation";
import { getCourse } from "@/lib/publicContent";
import { TECH_STACKS, COURSES } from "@/lib/tutorialData";
import UserProfileClient from "@/components/UserProfileClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { username } = await params;
  const rawSlug = decodeURIComponent(username || "").trim();
  const cleanUsername = rawSlug.replace(/^@+/, "");

  if (
    rawSlug.toLowerCase() === "robot.txt" ||
    rawSlug.toLowerCase() === "robots.txt" ||
    rawSlug.toLowerCase() === "sitemap.xml"
  ) {
    return { title: "Redirecting...", robots: { index: false, follow: false } };
  }

  const isProfile = rawSlug.startsWith("@");

  return {
    title: `@${cleanUsername} - Profile | asif.to`,
    description: `View @${cleanUsername}'s learning progress and profile on asif.to.`,
    ...(isProfile ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function UserProfilePage({ params }) {
  const { username } = await params;
  const rawSlug = decodeURIComponent(username || "").trim();

  // 1. Handle robot.txt and robots.txt
  if (
    rawSlug.toLowerCase() === "robot.txt" ||
    rawSlug.toLowerCase() === "robots.txt"
  ) {
    redirect("/robots.txt");
  }

  // 2. Handle sitemap.xml
  if (rawSlug.toLowerCase() === "sitemap.xml") {
    redirect("/sitemap.xml");
  }

  // 3. Reject file extensions that aren't valid routes
  if (/\.[a-zA-Z0-9]+$/.test(rawSlug)) {
    notFound();
  }

  // 4. Handle explicit user profiles prefixed with @ (e.g., /@username)
  if (rawSlug.startsWith("@")) {
    const cleanUsername = rawSlug.replace(/^@+/, "");
    return <UserProfileClient username={cleanUsername} />;
  }

  // 5. If not prefixed with @, check if it matches a course slug
  const isStaticCourse =
    TECH_STACKS.some((t) => t.id?.toLowerCase() === rawSlug.toLowerCase()) ||
    COURSES.some(
      (c) =>
        c.id?.toLowerCase() === rawSlug.toLowerCase() ||
        c.slug?.toLowerCase() === rawSlug.toLowerCase() ||
        c.techId?.toLowerCase() === rawSlug.toLowerCase(),
    );

  if (isStaticCourse) {
    redirect(`/courses/${encodeURIComponent(rawSlug)}`);
  }

  const dynamicCourse = await getCourse(rawSlug);
  if (dynamicCourse) {
    redirect(`/courses/${encodeURIComponent(dynamicCourse.slug || rawSlug)}`);
  }

  // 6. If not a course or static file, redirect standard usernames to the canonical /@username format
  redirect(`/@${encodeURIComponent(rawSlug)}`);
}
