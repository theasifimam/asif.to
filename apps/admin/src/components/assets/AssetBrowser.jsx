"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Files,
  Folder,
  FolderInput,
  FolderPlus,
  HardDrive,
  Heart,
  Image as ImageIcon,
  ListFilter,
  MoreHorizontal,
  PanelLeft,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  User,
  Video,
  X,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { assetsApi } from "@/lib/api";
import { assetAccepts, ASSET_TYPE_LABELS, formatAssetBytes } from "@/lib/assets";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAuth } from "@/contexts/AuthContext";
import { AdminEmptyState } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ViewToggle } from "@/components/ui/ViewToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { hasPermission } from "@/lib/permissions";
import AssetThumbnail from "./AssetThumbnail";
import AssetInspector from "./AssetInspector";
import {
  AssetConfirmDialog,
  AssetMoveDialog,
  AssetTextDialog,
  AssetUploadDialog,
} from "./AssetDialogs";

const scopeGroups = [
  {
    title: "Library",
    items: [
      ["all", "All Files", Files],
      ["images", "Images", ImageIcon],
      ["videos", "Videos", Video],
      ["documents", "Documents", FileText],
      ["code", "Code & Archives", Archive],
    ],
  },
  {
    title: "Quick Access",
    items: [
      ["recent", "Recent", Clock3],
      ["favorites", "Favorites", Heart],
      ["unused", "Unused", ListFilter],
    ],
  },
  {
    title: "System",
    items: [
      ["trash", "Trash", Trash2],
    ],
  },
];

const emptyCopy = {
  favorites: ["No favorite files", "Favorite useful assets to find them quickly."],
  unused: ["No unused files found", "Every indexed asset currently has a tracked content reference."],
  trash: ["Trash is empty", "Files and folders moved to Trash will appear here."],
  all: ["No files yet", "Upload your first file or create a folder."],
};

const SORT_LABELS = {
  newest: "Newest first",
  oldest: "Oldest first",
  name_az: "Name (A–Z)",
  name_za: "Name (Z–A)",
  largest: "Size (Largest)",
  smallest: "Size (Smallest)",
};

const USAGE_LABELS = {
  all: "Any usage",
  used: "Used",
  unused: "Unused",
};

const DATE_LABELS = {
  all: "Any date",
  7: "Last 7 days",
  30: "Last 30 days",
  90: "Last 90 days",
};

const unwrap = (response, fallback) => response?.data?.data ?? response?.data ?? fallback;

function folderOptions(folders) {
  const map = new Map(folders.map((folder) => [String(folder._id), folder]));
  return folders.map((folder) => {
    const names = (folder.ancestors || []).map((id) => map.get(String(id))?.name).filter(Boolean);
    return { ...folder, pathLabel: [...names, folder.name].join(" / ") };
  }).sort((a, b) => a.pathLabel.localeCompare(b.pathLabel));
}

function ItemMenu({ item, isFolder = false, scope, onAction }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label={`Actions for ${item.name}`} onClick={(event) => event.stopPropagation()} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {scope === "trash" ? (
          <>
            <DropdownMenuItem onSelect={() => onAction("restore", item, isFolder)}><RotateCcw /> Restore</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => onAction("permanent", item, isFolder)}><Trash2 /> Delete forever</DropdownMenuItem>
          </>
        ) : (
          <>
            {!isFolder && <DropdownMenuItem onSelect={() => onAction("inspect", item, false)}><Search /> Preview details</DropdownMenuItem>}
            <DropdownMenuItem onSelect={() => onAction("rename", item, isFolder)}><Pencil /> Rename</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAction("move", item, isFolder)}><FolderInput /> Move</DropdownMenuItem>
            {!isFolder && <DropdownMenuItem onSelect={() => onAction("favorite", item, false)}><Heart /> {item.isFavorite ? "Unfavorite" : "Favorite"}</DropdownMenuItem>}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => onAction("trash", item, isFolder)}><Trash2 /> Move to Trash</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AssetBrowser({ pickerMode = false, accept = "*/*", onChoose }) {
  const { user } = useAuth();
  const canUpload = hasPermission(user, "assets.upload");
  const canManage = hasPermission(user, "assets.manage");
  const [scope, setScope] = useState("all");
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);
  const [sort, setSort] = useState("newest");
  const [usageFilter, setUsageFilter] = useState("all");
  const [uploaderFilter, setUploaderFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [uploaders, setUploaders] = useState([]);
  const [view, setView] = useState("card");
  const [page, setPage] = useState(1);
  const limit = pickerMode ? 20 : 24;
  const [assets, setAssets] = useState([]);
  const [folders, setFolders] = useState([]);
  const [tree, setTree] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [summary, setSummary] = useState({ total: 0, totalBytes: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [pickerSelection, setPickerSelection] = useState(null);
  const [inspected, setInspected] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [working, setWorking] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [dragOverTarget, setDragOverTarget] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const scrollContainerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const requestIdRef = useRef(0);

  const moveFolders = useMemo(() => folderOptions(tree), [tree]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (sort !== "newest") count += 1;
    if (usageFilter !== "all") count += 1;
    if (uploaderFilter !== "all") count += 1;
    if (dateFilter !== "all") count += 1;
    return count;
  }, [sort, usageFilter, uploaderFilter, dateFilter]);

  const resetFilters = useCallback(() => {
    setSort("newest");
    setUsageFilter("all");
    setUploaderFilter("all");
    setDateFilter("all");
    setPage(1);
  }, []);

  const load = useCallback(async () => {
    void refreshKey;
    const requestId = ++requestIdRef.current;
    const isFirstPage = page === 1;
    if (isFirstPage) {
      setLoading(true);
      setLoadingMore(false);
    } else {
      setLoadingMore(true);
    }
    const params = { page, limit, sort };
    if (debouncedSearch) params.search = debouncedSearch;
    if (scope === "images") params.type = "image";
    if (scope === "videos") params.type = "video";
    if (scope === "documents") params.type = "document";
    if (scope === "code") params.type = "code_archive";
    if (scope === "favorites") params.favorite = "true";
    if (scope === "unused") params.usage = "unused";
    else if (usageFilter !== "all") params.usage = usageFilter;
    if (scope === "trash") params.status = "trashed";
    if (uploaderFilter !== "all") params.uploadedBy = uploaderFilter;
    if (dateFilter !== "all") {
      const from = new Date();
      from.setDate(from.getDate() - Number(dateFilter));
      params.from = from.toISOString();
    }
    if (currentFolderId) params.folder = currentFolderId;
    else if (scope === "all" || scope === "trash") params.folder = "root";
    if (pickerMode && accept.startsWith("image/")) params.type = "image";

    const folderParams = {
      status: scope === "trash" ? "trashed" : "active",
      parentId: currentFolderId || "root",
    };
    const [assetResponse, folderResponse, treeResponse, uploaderResponse] = await Promise.all([
      assetsApi.list(params),
      isFirstPage && (scope === "all" || scope === "trash") ? assetsApi.folders(folderParams) : Promise.resolve(null),
      isFirstPage ? assetsApi.folders({ tree: "true" }) : Promise.resolve(null),
      isFirstPage && !uploaders.length ? assetsApi.uploaders() : Promise.resolve(null),
    ]);
    if (requestId !== requestIdRef.current) return;
    const data = unwrap(assetResponse, {});
    if (!assetResponse.success) toast.error(assetResponse.error || "Unable to load files");
    const nextAssets = data.assets || [];
    setAssets((current) => {
      if (isFirstPage) return nextAssets;
      const knownIds = new Set(current.map((asset) => String(asset._id)));
      return [...current, ...nextAssets.filter((asset) => !knownIds.has(String(asset._id)))];
    });
    setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    setSummary(data.summary || { total: 0, totalBytes: 0 });
    if (folderResponse) setFolders(unwrap(folderResponse, []));
    if (treeResponse?.success) setTree(unwrap(treeResponse, []));
    if (uploaderResponse?.success) setUploaders(unwrap(uploaderResponse, []));
    if (isFirstPage) setLoading(false);
    else setLoadingMore(false);
  }, [accept, currentFolderId, dateFilter, debouncedSearch, limit, page, pickerMode, refreshKey, scope, sort, uploaderFilter, uploaders.length, usageFilter]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [accept, currentFolderId, dateFilter, debouncedSearch, scope, sort, uploaderFilter, usageFilter]);

  useEffect(() => {
    const target = loadMoreRef.current;
    const root = scrollContainerRef.current;
    const hasMore = pagination.page < pagination.pages;
    if (!target || !root || loading || loadingMore || !hasMore) return undefined;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setPage((current) => Math.min(current + 1, pagination.pages));
      }
    }, { root, rootMargin: "280px 0px", threshold: 0.01 });

    observer.observe(target);
    return () => observer.disconnect();
  }, [loading, loadingMore, pagination.page, pagination.pages]);

  useEffect(() => {
    let active = true;
    if (!currentFolderId) return undefined;
    assetsApi.folder(currentFolderId).then((response) => {
      if (active && response.success) setBreadcrumbs(unwrap(response, {}).breadcrumbs || []);
    });
    return () => { active = false; };
  }, [currentFolderId]);

  const refresh = () => {
    setPage(1);
    setRefreshKey((value) => value + 1);
  };
  const resetNavigationState = () => { setPage(1); setSelectedIds([]); setPickerSelection(null); };
  const openFolder = (folder) => {
    setCurrentFolderId(folder?._id || null);
    if (!folder) setBreadcrumbs([]);
    setScope(scope === "trash" ? "trash" : "all");
    resetNavigationState();
  };
  const toggleSelected = (id) => setSelectedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);

  const uploadDroppedFile = async (file, folderId, duplicateStrategy) => {
    const toastId = `asset-drop-${file.name}-${file.size}-${file.lastModified}`;
    let lastShown = -10;
    toast.loading(`Uploading ${file.name}`, { id: toastId, description: folderId ? "Uploading directly to the selected folder…" : "Uploading to All Files…" });
    const response = await assetsApi.upload(file, { folderId, duplicateStrategy }, (progress) => {
      if (progress - lastShown >= 10 || progress === 100) {
        lastShown = progress;
        toast.loading(`Uploading ${file.name}`, { id: toastId, description: `${progress}% complete` });
      }
    });
    const result = response.data?.results?.[0];
    if (result?.status === "created") {
      toast.success(`${file.name} uploaded`, { id: toastId, description: result.reusedStorage ? "A new library entry now reuses the existing stored file." : "The file is ready to reuse." });
      refresh();
      return;
    }
    if (result?.status === "duplicate") {
      toast.warning("This file already exists", {
        id: toastId,
        description: `${result.asset?.name || file.name} has identical content.`,
        action: { label: "Create entry", onClick: () => uploadDroppedFile(file, folderId, "upload-anyway") },
        cancel: { label: "Use existing", onClick: refresh },
        duration: 12000,
      });
      return;
    }
    toast.error(`Could not upload ${file.name}`, { id: toastId, description: result?.error || response.error || "Upload failed." });
  };

  const handleDragStart = (event, item, kind) => {
    if (scope === "trash" || !canManage) return;
    const ids = kind === "asset" && selectedIds.includes(item._id) ? selectedIds : [item._id];
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-asif-media-library", JSON.stringify({ kind, ids }));
    event.dataTransfer.setData("text/plain", item.name);
  };

  const handleDragOver = (event, destinationId) => {
    if (scope === "trash") return;
    const transferTypes = Array.from(event.dataTransfer.types || []);
    const supportsDrop = (canUpload && transferTypes.includes("Files"))
      || (canManage && transferTypes.includes("application/x-asif-media-library"));
    if (!supportsDrop) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = transferTypes.includes("Files") ? "copy" : "move";
    setDragOverTarget(destinationId || "root");
  };

  const handleDrop = async (event, destinationFolderId = null) => {
    if (scope === "trash") return;
    event.preventDefault();
    event.stopPropagation();
    setDragOverTarget(null);
    if (event.dataTransfer.files?.length) {
      if (!canUpload) return toast.error("You do not have permission to upload files.");
      Array.from(event.dataTransfer.files).forEach((file) => uploadDroppedFile(file, destinationFolderId));
      return;
    }
    if (!canManage) return toast.error("You do not have permission to move library items.");
    try {
      const payload = JSON.parse(event.dataTransfer.getData("application/x-asif-media-library") || "{}");
      if (!payload.ids?.length) return;
      const response = payload.kind === "folder"
        ? await assetsApi.updateFolder(payload.ids[0], { parentId: destinationFolderId })
        : await assetsApi.bulk("move", payload.ids, { folderId: destinationFolderId });
      if (!response.success) return toast.error(response.error || "Unable to move the dropped item");
      toast.success(payload.kind === "folder" ? "Folder moved" : `${payload.ids.length} file${payload.ids.length === 1 ? "" : "s"} moved`);
      setSelectedIds([]);
      refresh();
    } catch {
      toast.error("The dropped item could not be moved.");
    }
  };

  const clearDropTarget = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setDragOverTarget(null);
  };

  const handleAction = async (action, item, isFolder = false) => {
    if (action === "inspect") return setInspected(item);
    if (action === "favorite") {
      const response = await assetsApi.update(item._id, { isFavorite: !item.isFavorite });
      if (!response.success) return toast.error(response.error || "Unable to update favorite");
      toast.success(item.isFavorite ? "Removed from favorites" : "Added to favorites");
      setInspected((current) => current?._id === item._id ? { ...current, isFavorite: !item.isFavorite } : current);
      return refresh();
    }
    if (action === "restore") {
      const response = isFolder ? await assetsApi.restoreFolder(item._id) : await assetsApi.restore(item._id);
      if (!response.success) return toast.error(response.error || "Unable to restore item");
      toast.success(isFolder ? "Folder restored" : "File restored");
      setInspected(null);
      return refresh();
    }
    setDialog({ type: action, item, isFolder, ids: item ? [item._id] : selectedIds });
  };

  const runDialogAction = async (value) => {
    if (!dialog) return;
    setWorking(true);
    let response;
    if (dialog.type === "create-folder") response = await assetsApi.createFolder({ name: value, parentId: currentFolderId });
    if (dialog.type === "rename") response = dialog.isFolder ? await assetsApi.updateFolder(dialog.item._id, { name: value }) : await assetsApi.update(dialog.item._id, { name: value });
    if (dialog.type === "move") response = dialog.isFolder ? await assetsApi.updateFolder(dialog.item._id, { parentId: value }) : await assetsApi.bulk("move", dialog.ids, { folderId: value });
    if (dialog.type === "trash") response = dialog.isFolder ? await assetsApi.trashFolder(dialog.item._id) : await assetsApi.bulk("trash", dialog.ids);
    if (dialog.type === "permanent") response = dialog.isFolder ? await assetsApi.deleteFolderPermanently(dialog.item._id) : await assetsApi.bulk("permanent_delete", dialog.ids);
    setWorking(false);
    if (!response?.success) {
      const itemError = Array.isArray(response?.data) ? response.data.find((entry) => !entry.success)?.error : null;
      return toast.error(itemError || response?.error || "The action could not be completed");
    }
    toast.success(response?.data?.message || "Media Library updated");
    setDialog(null);
    setSelectedIds([]);
    setInspected(null);
    refresh();
  };

  const runBulk = async (action) => {
    if (action === "move" || action === "trash" || action === "permanent") return setDialog({ type: action, ids: selectedIds, isFolder: false });
    const response = await assetsApi.bulk(action, selectedIds);
    if (!response.success) return toast.error(response.error || "Unable to update files");
    toast.success("Files updated");
    setSelectedIds([]);
    refresh();
  };

  const folderSectionVisible = (scope === "all" || scope === "trash") && !debouncedSearch;
  const selectedAll = assets.length > 0 && assets.every((asset) => selectedIds.includes(asset._id));
  const empty = emptyCopy[scope] || ["No matching files", "Try another search or filter."];

  return (
    <div className={cn("min-w-0 relative", pickerMode ? "flex h-[70vh] flex-col" : "flex h-full w-full flex-1 overflow-hidden bg-zinc-50 dark:bg-zinc-950")}>
      {/* Desktop File Explorer Left Sidebar */}
      <aside className={cn("w-60 shrink-0 flex-col justify-between border-r border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/60", pickerMode ? "hidden" : "hidden lg:flex")}>
        <div className="space-y-6">
          {/* App Brand Title Header */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <Folder className="h-5 w-5 fill-white/20" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white">Media Explorer</h1>
              <p className="text-[10px] font-semibold text-zinc-400">asif.to file manager</p>
            </div>
          </div>

          {/* Navigation Groups */}
          <nav className="space-y-5" aria-label="File explorer sidebar navigation">
            {scopeGroups.map((group) => {
              const visibleItems = group.items.filter(([key]) => !pickerMode || !["unused", "trash"].includes(key));
              if (!visibleItems.length) return null;
              return (
                <div key={group.title} className="space-y-1.5">
                  <p className="px-3 text-[10px] font-black uppercase tracking-wider text-zinc-400">{group.title}</p>
                  <div className="space-y-0.5">
                    {visibleItems.map(([key, label, Icon]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setScope(key); setCurrentFolderId(null); setBreadcrumbs([]); resetNavigationState(); }}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-all",
                          scope === key
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20 font-bold"
                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                        )}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0", scope === key ? "text-white" : "text-zinc-400")} />
                        <span className="truncate">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Storage Widget */}
        <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-blue-500" />
              <span>Storage</span>
            </div>
            <span className="text-[10px] text-zinc-400">{formatAssetBytes(summary.totalBytes)}</span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, Math.max(5, (summary.totalBytes / (1024 * 1024 * 500)) * 100))}%` }} />
          </div>
          <p className="mt-2 text-[10px] font-medium text-zinc-400">{summary.total} indexed assets</p>
        </div>
      </aside>

      {/* Mobile Navigation Drawer Sheet */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" data-scroll-ignore>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={() => setMobileNavOpen(false)} />
          <aside className="relative flex w-72 max-w-[85vw] flex-col justify-between border-r border-zinc-200/80 bg-white p-4 shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-950">
            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                    <Folder className="h-5 w-5 fill-white/20" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white">Media Explorer</h2>
                    <p className="text-[10px] font-semibold text-zinc-400">Mobile File Manager</p>
                  </div>
                </div>
                <button type="button" onClick={() => setMobileNavOpen(false)} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-5">
                {scopeGroups.map((group) => {
                  const visibleItems = group.items.filter(([key]) => !pickerMode || !["unused", "trash"].includes(key));
                  if (!visibleItems.length) return null;
                  return (
                    <div key={group.title} className="space-y-1.5">
                      <p className="px-3 text-[10px] font-black uppercase tracking-wider text-zinc-400">{group.title}</p>
                      <div className="space-y-0.5">
                        {visibleItems.map(([key, label, Icon]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setScope(key);
                              setCurrentFolderId(null);
                              setBreadcrumbs([]);
                              resetNavigationState();
                              setMobileNavOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-all",
                              scope === key
                                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20 font-bold"
                                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                            )}
                          >
                            <Icon className={cn("h-4 w-4 shrink-0", scope === key ? "text-white" : "text-zinc-400")} />
                            <span className="truncate">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </nav>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/80">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-blue-500" />
                  <span>Storage</span>
                </div>
                <span className="text-[10px] text-zinc-400">{formatAssetBytes(summary.totalBytes)}</span>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, Math.max(5, (summary.totalBytes / (1024 * 1024 * 500)) * 100))}%` }} />
              </div>
              <p className="mt-2 text-[10px] font-medium text-zinc-400">{summary.total} indexed assets</p>
            </div>
          </aside>
        </div>
      )}

      {/* Main File Explorer App Frame */}
      <main
        onDragOver={(event) => handleDragOver(event, currentFolderId || "root")}
        onDragLeave={clearDropTarget}
        onDrop={(event) => handleDrop(event, currentFolderId)}
        className={cn(
          "flex min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-zinc-950",
          dragOverTarget === (currentFolderId || "root") && "ring-2 ring-blue-500/30",
          pickerMode && "flex min-h-0 flex-1 flex-col",
        )}
      >
        {/* App Navigation & Action Toolbar */}
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-zinc-100 p-2.5 sm:p-3 sm:px-5 dark:border-zinc-800/80">
          {/* Breadcrumb & Mobile Drawer Trigger */}
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/80 text-zinc-600 hover:bg-zinc-100 lg:hidden dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
              aria-label="Open File Manager Menu"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => openFolder(null)} disabled={!currentFolderId && scope === "all"} className="hidden sm:flex rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold text-zinc-500 truncate scrollbar-none">
              <button type="button" onClick={() => openFolder(null)} onDragOver={(event) => handleDragOver(event, "root")} onDragLeave={clearDropTarget} onDrop={(event) => handleDrop(event, null)} className={cn("flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800", currentFolderId === null && "font-bold text-zinc-900 dark:text-white")}>
                <Folder className="h-3.5 w-3.5 text-blue-500" />
                <span>{scope === "trash" ? "Trash" : "All Files"}</span>
              </button>
              {breadcrumbs.map((folder) => (
                <span key={folder._id} className="flex items-center gap-1"><ChevronRight className="h-3.5 w-3.5 text-zinc-400" /><button type="button" onClick={() => openFolder(folder)} onDragOver={(event) => handleDragOver(event, folder._id)} onDragLeave={clearDropTarget} onDrop={(event) => handleDrop(event, folder._id)} className="rounded-lg px-2 py-1 font-bold text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800">{folder.name}</button></span>
              ))}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile Search Button Toggle */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/80 text-zinc-600 sm:hidden dark:border-zinc-800 dark:text-zinc-300"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Desktop Search Input */}
            <div className="relative hidden sm:block sm:min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1); setSelectedIds([]); }}
                placeholder="Search files…"
                className="h-9 rounded-xl bg-zinc-50 pl-9 pr-8 text-xs dark:bg-zinc-900"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* View Switcher Toggle */}
            <ViewToggle view={view} onViewChange={setView} />

            {/* Refresh Button */}
            <Button type="button" variant="outline" size="icon" onClick={refresh} aria-label="Refresh" className="h-9 w-9 rounded-xl">
              <RefreshCw className="h-4 w-4" />
            </Button>

            {/* Filter & Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant={activeFilterCount > 0 ? "secondary" : "outline"}
                  className={cn(
                    "h-9 relative gap-1.5 rounded-xl transition-all text-xs font-semibold px-2.5 sm:px-3",
                    activeFilterCount > 0 && "border-blue-500/50 bg-blue-50/50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold"
                  )}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter & Sort</span>
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1.5">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="rounded-xl px-2.5 py-2 text-xs font-semibold">
                    <ArrowUpDown className="mr-2 h-4 w-4 text-zinc-400" />
                    <span>Sort by</span>
                    <span className="ml-auto mr-1 max-w-[80px] truncate text-[11px] font-medium text-zinc-400">
                      {SORT_LABELS[sort] || "Newest"}
                    </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="w-48 p-1">
                      <DropdownMenuRadioGroup value={sort} onValueChange={(val) => { setSort(val); setPage(1); }}>
                        <DropdownMenuRadioItem value="newest" className="text-xs">Newest first</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="oldest" className="text-xs">Oldest first</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="name_az" className="text-xs">Name (A to Z)</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="name_za" className="text-xs">Name (Z to A)</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="largest" className="text-xs">Size (Largest first)</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="smallest" className="text-xs">Size (Smallest first)</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                {!pickerMode && (
                  <>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="rounded-xl px-2.5 py-2 text-xs font-semibold">
                        <ListFilter className="mr-2 h-4 w-4 text-zinc-400" />
                        <span>Usage</span>
                        <span className="ml-auto mr-1 text-[11px] font-medium text-zinc-400">
                          {USAGE_LABELS[usageFilter] || "Any"}
                        </span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="w-40 p-1">
                          <DropdownMenuRadioGroup value={usageFilter} onValueChange={(val) => { setUsageFilter(val); setPage(1); }}>
                            <DropdownMenuRadioItem value="all" className="text-xs">Any usage</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="used" className="text-xs">Used only</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="unused" className="text-xs">Unused only</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="rounded-xl px-2.5 py-2 text-xs font-semibold">
                        <User className="mr-2 h-4 w-4 text-zinc-400" />
                        <span>Uploaded by</span>
                        <span className="ml-auto mr-1 max-w-[70px] truncate text-[11px] font-medium text-zinc-400">
                          {uploaderFilter === "all" ? "All" : (uploaders.find(u => u._id === uploaderFilter)?.fullName || "User")}
                        </span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="max-h-60 w-48 overflow-y-auto p-1 scrollbar-none">
                          <DropdownMenuRadioGroup value={uploaderFilter} onValueChange={(val) => { setUploaderFilter(val); setPage(1); }}>
                            <DropdownMenuRadioItem value="all" className="text-xs">All uploaders</DropdownMenuRadioItem>
                            {uploaders.map((uploader) => (
                              <DropdownMenuRadioItem key={uploader._id} value={uploader._id} className="text-xs">
                                {uploader.fullName || uploader.username}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="rounded-xl px-2.5 py-2 text-xs font-semibold">
                        <Clock3 className="mr-2 h-4 w-4 text-zinc-400" />
                        <span>Date modified</span>
                        <span className="ml-auto mr-1 text-[11px] font-medium text-zinc-400">
                          {DATE_LABELS[dateFilter] || "Any"}
                        </span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="w-40 p-1">
                          <DropdownMenuRadioGroup value={dateFilter} onValueChange={(val) => { setDateFilter(val); setPage(1); }}>
                            <DropdownMenuRadioItem value="all" className="text-xs">Any date</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="7" className="text-xs">Last 7 days</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="30" className="text-xs">Last 30 days</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="90" className="text-xs">Last 90 days</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </>
                )}

                {activeFilterCount > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={resetFilters}
                      className="justify-center rounded-xl font-bold text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-950/50"
                    >
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset all filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Consolidated Action Dropdown (+ New) for Desktop */}
            {scope !== "trash" && (canUpload || canManage) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" className="hidden sm:flex h-9 gap-1 rounded-xl font-bold text-xs shadow-md shadow-blue-600/15 px-3">
                    <Plus className="h-4 w-4" />
                    <span>New</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-1.5">
                  {canUpload && (
                    <DropdownMenuItem onSelect={() => setUploadOpen(true)} className="gap-2.5 py-2 font-semibold">
                      <Upload className="h-4 w-4 text-blue-600" />
                      <span>Upload files</span>
                    </DropdownMenuItem>
                  )}
                  {!pickerMode && canManage && (
                    <DropdownMenuItem onSelect={() => setDialog({ type: "create-folder" })} className="gap-2.5 py-2 font-semibold">
                      <FolderPlus className="h-4 w-4 text-amber-500" />
                      <span>New folder</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        {/* Mobile Expandable Search Bar */}
        {mobileSearchOpen && (
          <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50 p-2 sm:hidden dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1); setSelectedIds([]); }}
                placeholder="Search files by name..."
                className="h-9 rounded-xl bg-white pl-9 pr-8 text-xs dark:bg-zinc-950"
                autoFocus
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="rounded-lg p-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Mobile Horizontal Quick Navigation Categories Bar */}
        {!pickerMode && (
          <div className="flex shrink-0 gap-1.5 overflow-x-auto bg-zinc-50/50 px-3 py-2 text-xs lg:hidden dark:bg-zinc-900/40 scrollbar-none">
            {scopeGroups.flatMap((g) => g.items).map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => { setScope(key); setCurrentFolderId(null); setBreadcrumbs([]); resetNavigationState(); }}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all",
                  scope === key
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "bg-zinc-200/60 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Active Filter Badges Bar */}
        {(activeFilterCount > 0 || search) && (
          <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-100 bg-zinc-50/50 px-4 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Active Filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200/60 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                Search: &ldquo;{search}&rdquo;
                <button type="button" onClick={() => setSearch("")} className="hover:text-zinc-950 dark:hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {sort !== "newest" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                Sort: {SORT_LABELS[sort]}
                <button type="button" onClick={() => setSort("newest")} className="hover:text-blue-950 dark:hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {usageFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                Usage: {USAGE_LABELS[usageFilter]}
                <button type="button" onClick={() => setUsageFilter("all")} className="hover:text-blue-950 dark:hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {uploaderFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                Uploaded by: {uploaders.find((u) => u._id === uploaderFilter)?.fullName || "User"}
                <button type="button" onClick={() => setUploaderFilter("all")} className="hover:text-blue-950 dark:hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {dateFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                Date: {DATE_LABELS[dateFilter]}
                <button type="button" onClick={() => setDateFilter("all")} className="hover:text-blue-950 dark:hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => { setSearch(""); resetFilters(); }}
              className="ml-auto text-xs font-bold text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Selected Items Bulk Action Bar */}
        {selectedIds.length > 0 && !pickerMode && (
          <div className="flex flex-wrap items-center gap-2 border-b border-blue-100 bg-blue-50 px-4 py-2.5 dark:border-blue-900/40 dark:bg-blue-950/30">
            <span className="mr-1 text-xs font-black text-blue-700 dark:text-blue-300">{selectedIds.length} selected</span>
            {scope === "trash" ? (
              <><Button size="sm" variant="outline" onClick={() => runBulk("restore")}><RotateCcw className="h-3.5 w-3.5" /> Restore</Button>{user?.role === "super_admin" && <Button size="sm" variant="destructive" onClick={() => runBulk("permanent")}><Trash2 className="h-3.5 w-3.5" /> Delete forever</Button>}</>
            ) : (
              <><Button size="sm" variant="outline" onClick={() => runBulk("move")}><FolderInput className="h-3.5 w-3.5" /> Move</Button><Button size="sm" variant="outline" onClick={() => runBulk("favorite")}><Heart className="h-3.5 w-3.5" /> Favorite</Button><Button size="sm" variant="outline" className="text-red-600" onClick={() => runBulk("trash")}><Trash2 className="h-3.5 w-3.5" /> Trash</Button></>
            )}
            <button type="button" className="ml-auto text-xs font-bold text-zinc-500" onClick={() => setSelectedIds([])}>Clear</button>
          </div>
        )}

        {/* Main Canvas Scroll Area */}
        <div ref={scrollContainerRef} className={cn("flex-1 overflow-y-auto min-h-0 pb-16 lg:pb-0 scrollbar-none", pickerMode && "min-h-0 pb-0")} data-scroll-ignore aria-busy={loading || loadingMore}>
          {loading ? (
            <div className={cn("grid gap-2.5 p-3 sm:gap-3 sm:p-4", view === "card" ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
              {Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className={view === "card" ? "h-40 sm:h-48 rounded-3xl" : "h-14 rounded-2xl"} />)}
            </div>
          ) : (
            <>
              {!assets.length && !folders.length ? (
                <AdminEmptyState icon={scope === "trash" ? Trash2 : Files} title={empty[0]} description={debouncedSearch ? "Try a broader search." : empty[1]} action={scope !== "trash" && !pickerMode && canUpload ? <Button onClick={() => setUploadOpen(true)}><Upload className="h-4 w-4" /> Upload files</Button> : null} />
              ) : view === "card" ? (
                <div className="grid grid-cols-2 gap-2.5 p-3 sm:gap-3 sm:p-4 sm:grid-cols-3 xl:grid-cols-4">
                  {/* Folder Cards styled like File Cards */}
                  {folderSectionVisible && folders.map((folder) => (
                    <article
                      key={folder._id}
                      role="button"
                      tabIndex={0}
                      draggable={!pickerMode && scope !== "trash" && canManage}
                      onDragStart={(event) => handleDragStart(event, folder, "folder")}
                      onDragOver={(event) => { event.stopPropagation(); handleDragOver(event, folder._id); }}
                      onDragLeave={clearDropTarget}
                      onDrop={(event) => handleDrop(event, folder._id)}
                      onClick={() => openFolder(folder)}
                      onKeyDown={(event) => { if (event.key === "Enter") openFolder(folder); }}
                      className={cn(
                        "group relative cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl border bg-white transition-all dark:bg-zinc-950",
                        dragOverTarget === folder._id
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20 dark:bg-blue-950/30"
                          : "border-zinc-200/80 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg dark:border-zinc-800"
                      )}
                    >
                      <div className="aspect-4/3 flex items-center justify-center overflow-hidden bg-blue-50/50 dark:bg-blue-950/20">
                        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 shadow-xs transition-transform duration-300 group-hover:scale-110 dark:bg-blue-500/20 dark:text-blue-400">
                          <Folder className="h-7 w-7 sm:h-8 sm:w-8 fill-blue-500/20" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 sm:p-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-xs font-black text-zinc-900 dark:text-white">{folder.name}</h3>
                          <p className="mt-0.5 truncate text-[10px] font-medium text-zinc-400">Folder · {folder.assetCount} files · {folder.childCount} folders</p>
                        </div>
                        {!pickerMode && canManage && <ItemMenu item={folder} isFolder scope={scope} onAction={handleAction} />}
                      </div>
                    </article>
                  ))}

                  {/* File Cards */}
                  {assets.map((asset) => {
                    const selected = pickerMode ? pickerSelection?._id === asset._id : selectedIds.includes(asset._id);
                    const accepted = assetAccepts(asset, accept);
                    return (
                      <article key={asset._id} draggable={!pickerMode && scope !== "trash" && canManage} onDragStart={(event) => handleDragStart(event, asset, "asset")} onClick={() => { if (!accepted) return; if (pickerMode) setPickerSelection(asset); else setInspected(asset); }} className={cn("group relative cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl border bg-white transition-all dark:bg-zinc-950", selected ? "border-blue-500 ring-2 ring-blue-500/20" : "border-zinc-200/80 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg dark:border-zinc-800", !accepted && "cursor-not-allowed opacity-40")}>
                        {!pickerMode && canManage && <button type="button" aria-label={`Select ${asset.name}`} onClick={(event) => { event.stopPropagation(); toggleSelected(asset._id); }} className={cn("absolute left-2.5 top-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full border shadow-sm", selected ? "border-blue-600 bg-blue-600 text-white" : "border-white/80 bg-white/90 text-transparent dark:border-zinc-700 dark:bg-zinc-900")}><Check className="h-3.5 w-3.5" /></button>}
                        <div className="aspect-4/3 overflow-hidden bg-zinc-100 dark:bg-zinc-900"><AssetThumbnail asset={asset} className="transition-transform duration-300 group-hover:scale-[1.03]" /></div>
                        <div className="flex items-center gap-2 p-2.5 sm:p-3"><div className="min-w-0 flex-1"><h3 className="truncate text-xs font-black text-zinc-900 dark:text-white">{asset.name}</h3><p className="mt-0.5 truncate text-[10px] font-medium text-zinc-400">{ASSET_TYPE_LABELS[asset.category]} · {formatAssetBytes(asset.size)} · {asset.usageCount || 0} uses</p></div>{!pickerMode && canManage && <ItemMenu item={asset} scope={scope} onAction={handleAction} />}</div>
                        {asset.isFavorite && <Heart className="absolute right-3 top-3 h-4 w-4 fill-rose-500 text-rose-500 drop-shadow" />}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <>
                  {/* Desktop Full Column Table (shown on sm screens and wider) */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-xs">
                      <thead className="border-b border-zinc-100 bg-zinc-50/70 text-[10px] uppercase tracking-wider text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <tr>
                          <th className="w-10 px-4 py-3">{!pickerMode && canManage && <input type="checkbox" checked={selectedAll} onChange={() => setSelectedIds(selectedAll ? [] : assets.map((asset) => asset._id))} />}</th>
                          <th className="px-3 py-3">Name</th>
                          <th className="px-3 py-3">Type</th>
                          <th className="px-3 py-3">Size / Items</th>
                          <th className="px-3 py-3">Folder</th>
                          <th className="px-3 py-3">Uploaded by</th>
                          <th className="px-3 py-3">Date</th>
                          <th className="px-3 py-3">Usage</th>
                          <th className="w-12" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {/* Desktop Folder Rows */}
                        {folderSectionVisible && folders.map((folder) => (
                          <tr
                            key={folder._id}
                            draggable={!pickerMode && scope !== "trash" && canManage}
                            onDragStart={(event) => handleDragStart(event, folder, "folder")}
                            onDragOver={(event) => { event.stopPropagation(); handleDragOver(event, folder._id); }}
                            onDragLeave={clearDropTarget}
                            onDrop={(event) => handleDrop(event, folder._id)}
                            onClick={() => openFolder(folder)}
                            className={cn(
                              "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
                              dragOverTarget === folder._id && "bg-blue-50/70 dark:bg-blue-950/20"
                            )}
                          >
                            <td className="px-4 py-2" onClick={(event) => event.stopPropagation()} />
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                                  <Folder className="h-5 w-5 fill-blue-500/20" />
                                </div>
                                <span className="max-w-[240px] truncate font-bold text-zinc-900 dark:text-white">{folder.name}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 font-medium text-zinc-500">Folder</td>
                            <td className="px-3 py-2 font-medium text-zinc-500">{folder.assetCount} files</td>
                            <td className="px-3 py-2 font-medium text-zinc-500">—</td>
                            <td className="px-3 py-2 font-medium text-zinc-500">—</td>
                            <td className="px-3 py-2 font-medium text-zinc-500">{folder.createdAt ? new Date(folder.createdAt).toLocaleDateString() : "—"}</td>
                            <td className="px-3 py-2 font-bold text-zinc-600 dark:text-zinc-300">{folder.childCount || 0} subfolders</td>
                            <td className="px-2" onClick={(event) => event.stopPropagation()}>
                              {!pickerMode && canManage && <ItemMenu item={folder} isFolder scope={scope} onAction={handleAction} />}
                            </td>
                          </tr>
                        ))}

                        {/* Desktop File Rows */}
                        {assets.map((asset) => {
                          const accepted = assetAccepts(asset, accept);
                          const selected = pickerMode ? pickerSelection?._id === asset._id : selectedIds.includes(asset._id);
                          return <tr key={asset._id} draggable={!pickerMode && scope !== "trash" && canManage} onDragStart={(event) => handleDragStart(event, asset, "asset")} onClick={() => { if (!accepted) return; if (pickerMode) setPickerSelection(asset); else setInspected(asset); }} className={cn("cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50", selected && "bg-blue-50/70 dark:bg-blue-950/20", !accepted && "opacity-40")}><td className="px-4 py-2" onClick={(event) => event.stopPropagation()}>{!pickerMode && canManage && <input type="checkbox" checked={selected} onChange={() => toggleSelected(asset._id)} />}</td><td className="px-3 py-2"><div className="flex items-center gap-3"><div className="h-10 w-12 shrink-0 overflow-hidden rounded-xl"><AssetThumbnail asset={asset} iconClassName="h-5 w-5" /></div><span className="max-w-[240px] truncate font-bold text-zinc-900 dark:text-white">{asset.name}</span></div></td><td className="px-3 py-2 font-medium text-zinc-500">{ASSET_TYPE_LABELS[asset.category]}</td><td className="px-3 py-2 font-medium text-zinc-500">{formatAssetBytes(asset.size)}</td><td className="px-3 py-2 font-medium text-zinc-500">{asset.folder?.name || "Root"}</td><td className="px-3 py-2 font-medium text-zinc-500">{asset.uploadedBy?.fullName || "Imported"}</td><td className="px-3 py-2 font-medium text-zinc-500">{new Date(asset.createdAt).toLocaleDateString()}</td><td className="px-3 py-2 font-bold text-zinc-600 dark:text-zinc-300">{asset.usageCount || 0}</td><td className="px-2">{!pickerMode && canManage && <ItemMenu item={asset} scope={scope} onAction={handleAction} />}</td></tr>;
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Touch File Manager List View (shown on mobile screens < sm) */}
                  <div className="sm:hidden space-y-1.5 p-2.5">
                    {/* Mobile Folder List Tiles */}
                    {folderSectionVisible && folders.map((folder) => (
                      <div
                        key={folder._id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openFolder(folder)}
                        className="flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white p-3 transition-colors active:bg-blue-50/50 dark:border-zinc-800 dark:bg-zinc-950 dark:active:bg-blue-950/30"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                          <Folder className="h-5 w-5 fill-blue-500/20" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-black text-zinc-900 dark:text-white">{folder.name}</p>
                          <p className="mt-0.5 truncate text-[10px] font-medium text-zinc-400">Folder · {folder.assetCount} files</p>
                        </div>
                        {!pickerMode && canManage && (
                          <div onClick={(event) => event.stopPropagation()}>
                            <ItemMenu item={folder} isFolder scope={scope} onAction={handleAction} />
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Mobile File List Tiles */}
                    {assets.map((asset) => {
                      const accepted = assetAccepts(asset, accept);
                      const selected = pickerMode ? pickerSelection?._id === asset._id : selectedIds.includes(asset._id);
                      return (
                        <div
                          key={asset._id}
                          role="button"
                          tabIndex={0}
                          onClick={() => { if (!accepted) return; if (pickerMode) setPickerSelection(asset); else setInspected(asset); }}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white p-3 transition-colors active:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:active:bg-zinc-900/50",
                            selected && "border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 dark:bg-blue-950/30",
                            !accepted && "opacity-40"
                          )}
                        >
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                            <AssetThumbnail asset={asset} iconClassName="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-black text-zinc-900 dark:text-white">{asset.name}</p>
                            <p className="mt-0.5 truncate text-[10px] font-medium text-zinc-400">
                              {ASSET_TYPE_LABELS[asset.category]} · {formatAssetBytes(asset.size)}
                            </p>
                          </div>
                          {!pickerMode && canManage && (
                            <div onClick={(event) => event.stopPropagation()}>
                              <ItemMenu item={asset} scope={scope} onAction={handleAction} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}

          <div ref={loadMoreRef} className="flex min-h-14 items-center justify-center px-4 py-3" aria-live="polite">
            {loadingMore ? (
              <span className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600" /> Loading more files…
              </span>
            ) : assets.length > 0 && pagination.page < pagination.pages ? (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Scroll to load more</span>
            ) : assets.length > 0 ? (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">All {pagination.total} files loaded</span>
            ) : null}
          </div>
        </div>

        {pickerMode && (
          <div className="flex items-center justify-between gap-3 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <p className="min-w-0 truncate text-xs font-semibold text-zinc-500">{pickerSelection ? pickerSelection.name : "Select a file from the library"}</p>
            <Button type="button" disabled={!pickerSelection} onClick={() => onChoose?.(pickerSelection)}>Select file</Button>
          </div>
        )}
      </main>

      {/* Mobile Floating Action Button (FAB) for Quick Upload / New Folder */}
      {scope !== "trash" && (canUpload || canManage) && !pickerMode && (
        <div className="fixed bottom-6 right-5 z-40 lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl shadow-blue-600/40 transition-transform active:scale-95"
                aria-label="Create or upload"
              >
                <Plus className="h-6 w-6" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1.5">
              {canUpload && (
                <DropdownMenuItem onSelect={() => setUploadOpen(true)} className="gap-2.5 py-2 font-semibold">
                  <Upload className="h-4 w-4 text-blue-600" />
                  <span>Upload files</span>
                </DropdownMenuItem>
              )}
              {canManage && (
                <DropdownMenuItem onSelect={() => setDialog({ type: "create-folder" })} className="gap-2.5 py-2 font-semibold">
                  <FolderPlus className="h-4 w-4 text-amber-500" />
                  <span>New folder</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {!pickerMode && inspected && <AssetInspector asset={inspected} assets={assets} onSelectAsset={setInspected} user={user} onClose={() => setInspected(null)} onAction={(action, item) => { if (action === "copied") return toast.success("URL copied"); handleAction(action, item, false); }} />}
      <AssetUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} folderId={currentFolderId} onUploaded={() => refresh()} />
      <AssetTextDialog key="create-folder" open={dialog?.type === "create-folder"} onOpenChange={(open) => !open && setDialog(null)} title="Create folder" description="Folders organize the library without becoming part of file URLs." label="Folder name" confirmLabel="Create folder" loading={working} onConfirm={runDialogAction} />
      <AssetTextDialog key={`rename-${dialog?.item?._id || "none"}`} open={dialog?.type === "rename"} onOpenChange={(open) => !open && setDialog(null)} title={`Rename ${dialog?.isFolder ? "folder" : "file"}`} description={dialog?.isFolder ? "The folder path is organizational only." : "The storage key and content references will not change."} label="Name" initialValue={dialog?.item?.name || ""} loading={working} onConfirm={runDialogAction} />
      <AssetMoveDialog key={`move-${dialog?.item?._id || dialog?.ids?.join("-") || "none"}`} open={dialog?.type === "move"} onOpenChange={(open) => !open && setDialog(null)} folders={moveFolders.filter((folder) => folder._id !== dialog?.item?._id)} currentFolderId={currentFolderId} title={dialog?.isFolder ? "Move folder" : `Move ${dialog?.ids?.length || 1} file${(dialog?.ids?.length || 1) === 1 ? "" : "s"}`} loading={working} onConfirm={runDialogAction} />
      <AssetConfirmDialog open={dialog?.type === "trash"} onOpenChange={(open) => !open && setDialog(null)} title="Move to Trash?" description={dialog?.isFolder ? "The folder, nested folders, and active files inside it will move to Trash. Existing public URLs continue to work until permanent deletion." : `${dialog?.ids?.length || 1} selected file${(dialog?.ids?.length || 1) === 1 ? "" : "s"} will be hidden from the active library but remain recoverable.`} confirmLabel="Move to Trash" loading={working} onConfirm={runDialogAction} />
      <AssetConfirmDialog open={dialog?.type === "permanent"} onOpenChange={(open) => !open && setDialog(null)} title="Delete permanently?" description="This cannot be undone. Files referenced by published content will be protected and not deleted." confirmLabel="Delete forever" destructive loading={working} onConfirm={runDialogAction} />
    </div>
  );
}
