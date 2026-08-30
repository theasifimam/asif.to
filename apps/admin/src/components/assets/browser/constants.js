export const emptyCopy = {
  favorites: [
    "No favorite files",
    "Favorite useful assets to find them quickly.",
  ],
  unused: [
    "No orphan files found",
    "Every indexed asset currently has a tracked content reference.",
  ],
  trash: [
    "Trash is empty",
    "Files and folders moved to Trash will appear here.",
  ],
  all: ["No files yet", "Upload your first file or create a folder."],
};

export const SCOPE_LABELS = {
  all: "All Files",
  images: "Images",
  videos: "Videos",
  audio: "Audio",
  documents: "Documents",
  code: "Code & Archives",
  recent: "Recent",
  favorites: "Favorites",
  unused: "Orphans",
  trash: "Trash",
};

export const SORT_LABELS = {
  newest: "Newest first",
  oldest: "Oldest first",
  name_az: "Name (A–Z)",
  name_za: "Name (Z–A)",
  largest: "Size (Largest)",
  smallest: "Size (Smallest)",
};

export const USAGE_LABELS = {
  all: "Any usage",
  used: "Used",
  unused: "Orphan",
};

export const DATE_LABELS = {
  all: "Any date",
  7: "Last 7 days",
  30: "Last 30 days",
  90: "Last 90 days",
};

export const unwrap = (response, fallback) =>
  response?.data?.data ?? response?.data ?? fallback;

export function folderOptions(folders) {
  const map = new Map(folders.map((folder) => [String(folder._id), folder]));
  return folders
    .map((folder) => {
      const names = (folder.ancestors || [])
        .map((id) => map.get(String(id))?.name)
        .filter(Boolean);
      return { ...folder, pathLabel: [...names, folder.name].join(" / ") };
    })
    .sort((a, b) => a.pathLabel.localeCompare(b.pathLabel));
}
