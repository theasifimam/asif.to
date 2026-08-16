import LibraryWriter from "@/components/library/LibraryWriter";
export default async function NewLibraryEntryPage({ searchParams }) { const params = await searchParams; return <LibraryWriter initialType={params?.type || "note"} />; }
