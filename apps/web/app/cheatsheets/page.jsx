import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheatsheetsClient from "@/components/CheatsheetsClient";
import { getCourses, getCheatsheets } from "@/lib/publicContent";
import { absoluteUrl } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { getSeoSetting } from "@/lib/publicContent";
import { mergePageMetadata } from "@/lib/pageMetadata";

export const revalidate = 60;

export async function generateMetadata() {
  const title = "Coding Cheatsheets & Syntax Reference | asif.to";
  const description =
    "Quick syntax reference guides, code examples, and cheatsheets for React, Next.js, Express, MongoDB, Tailwind CSS, and more.";
  const canonical = absoluteUrl("/cheatsheets");

  return mergePageMetadata(
    { title, description },
    await getSeoSetting("/cheatsheets"),
    canonical,
  );
}

export default async function CheatsheetsPage() {
  const [courses, cheatsheets] = await Promise.all([
    getCourses(),
    getCheatsheets(),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 text-foreground dark:bg-zinc-950">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Coding Cheatsheets & Syntax Reference",
          url: absoluteUrl("", "/cheatsheets"),
          mainEntity: {
            "@type": "ItemList",
            itemListElement: (cheatsheets || []).map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.title,
              url: absoluteUrl("", `/cheatsheets/${item.slug}`),
            })),
          },
        }}
      />
      <Header />
      <CheatsheetsClient
        initialCourses={courses || []}
        initialCheatsheets={cheatsheets || []}
      />
      <Footer />
    </div>
  );
}
