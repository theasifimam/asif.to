import { NextResponse } from "next/server";
import { PRACTICE_PROBLEMS } from "@/lib/playground/problems";

export const revalidate = 60;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  let remote = [];
  if (baseUrl) {
    try {
      const response = await fetch(`${baseUrl}/search/index`, { next: { revalidate } });
      if (response.ok) remote = (await response.json())?.data?.items || [];
    } catch (error) {
      console.error("Search index fetch failed:", error);
    }
  }
  const practice = PRACTICE_PROBLEMS.map((item) => ({
    id: `practice:${item.technology}:${item.slug}`, type: "practice", title: item.title,
    url: `/practice/${item.technology}/${item.slug}`, description: item.description,
    keywords: item.topics || [], course: item.technology, category: `${item.difficulty} Practice`,
    technology: item.technology, priority: 7,
  }));
  return NextResponse.json({ items: [...remote, ...practice] }, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
