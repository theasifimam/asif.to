import LibraryWriter from "@/components/library/LibraryWriter";
export default async function EditLibraryEntryPage({ params }) { const { id } = await params; return <LibraryWriter entryId={id} />; }
