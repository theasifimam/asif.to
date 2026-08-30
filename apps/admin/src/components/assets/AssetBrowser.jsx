"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Files, FolderPlus, Plus, RefreshCw, Trash2, Upload } from "lucide-react";
import { toast } from "@/lib/toast";
import { assetsApi } from "@/lib/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { useAuth } from "@/contexts/AuthContext";
import { AdminEmptyState } from "@/components/admin";
import { Button } from "@/components/ui/button";
import LogoLoader from "@/components/ui/LogoLoader";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { hasPermission } from "@/lib/permissions";
import AssetInspector from "./AssetInspector";
import {
  AssetConfirmDialog,
  AssetTextDialog,
  AssetUploadDialog,
} from "./AssetDialogs";
import AssetToolbar from "./browser/AssetToolbar";
import AssetActiveFilters from "./browser/AssetActiveFilters";
import AssetBulkActions from "./browser/AssetBulkActions";
import AssetCardGrid from "./browser/AssetCardGrid";
import AssetContextMenu from "./browser/AssetContextMenu";
import AssetTableListView from "./browser/AssetTableListView";
import AssetTransferBar from "./browser/AssetTransferBar";
import {
  childrenFromDirectorySource,
  fileFromClipboardSource,
  isDirectorySource,
  isEditablePasteTarget,
  sourcesFromClipboardData,
  sourcesFromNavigatorClipboard,
} from "./browser/clipboard";
import {
  DATE_LABELS,
  emptyCopy,
  SCOPE_LABELS,
  SORT_LABELS,
  unwrap,
  USAGE_LABELS,
} from "./browser/constants";

const FILE_URL_DEFAULTS = {
  folder: "",
  q: "",
  scope: "all",
  sort: "newest",
  usage: "all",
  uploader: "all",
  date: "all",
  view: "card",
};

const MONGODB_ID = /^[a-f\d]{24}$/i;

function optionOrDefault(value, options, fallback) {
  return Object.prototype.hasOwnProperty.call(options, value) ? value : fallback;
}

function normalizeFileUrlState(state) {
  const folder = String(state.folder || "");
  const viewVal = String(state.view || "").toLowerCase();
  return {
    folder: !folder || MONGODB_ID.test(folder) ? folder : "",
    q: String(state.q || ""),
    scope: optionOrDefault(state.scope, SCOPE_LABELS, "all"),
    sort: optionOrDefault(state.sort, SORT_LABELS, "newest"),
    usage: optionOrDefault(state.usage, USAGE_LABELS, "all"),
    uploader: String(state.uploader || "all"),
    date: optionOrDefault(state.date, DATE_LABELS, "all"),
    view: viewVal === "list" || viewVal === "table" ? "list" : "card",
  };
}

export default function AssetBrowser({
  pickerMode = false,
  accept = "*/*",
  onChoose,
}) {
  const { user } = useAuth();
  const canUpload = hasPermission(user, "assets.upload");
  const canManage = hasPermission(user, "assets.manage");
  const [urlState, setUrlState] = useUrlFilters(FILE_URL_DEFAULTS, {
    enabled: !pickerMode,
  });
  const normalizedUrlState = useMemo(
    () => normalizeFileUrlState(urlState),
    [urlState],
  );
  const {
    folder,
    q: search,
    scope,
    sort,
    usage: usageFilter,
    uploader: uploaderFilter,
    date: dateFilter,
    view,
  } = normalizedUrlState;
  const currentFolderId = folder || null;
  const urlSetters = useMemo(() => {
    const setField = (field, normalize = (value) => value) => (nextValue) => {
      setUrlState((current) => {
        const resolved =
          typeof nextValue === "function"
            ? nextValue(current[field])
            : nextValue;
        return { ...current, [field]: normalize(resolved) };
      });
    };
    return {
      setCurrentFolderId: setField("folder", (value) => value || ""),
      setSearch: setField("q", (value) => String(value || "")),
      setScope: setField("scope"),
      setSort: setField("sort"),
      setUsageFilter: setField("usage"),
      setUploaderFilter: setField("uploader"),
      setDateFilter: setField("date"),
      setView: setField("view"),
    };
  }, [setUrlState]);
  const {
    setCurrentFolderId,
    setSearch,
    setScope,
    setSort,
    setUsageFilter,
    setUploaderFilter,
    setDateFilter,
    setView,
  } = urlSetters;
  const [breadcrumbState, setBreadcrumbState] = useState({
    folderId: null,
    items: [],
  });
  const breadcrumbs =
    breadcrumbState.folderId === currentFolderId ? breadcrumbState.items : [];
  const debouncedSearch = useDebouncedValue(search, 350);
  const [uploaders, setUploaders] = useState([]);
  const [page, setPage] = useState(1);
  const limit = pickerMode ? 20 : 24;
  const [assets, setAssets] = useState([]);
  const [folders, setFolders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState([]);
  const [pickerSelection, setPickerSelection] = useState(null);
  const [inspected, setInspected] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [working, setWorking] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pasting, setPasting] = useState(false);
  const [fileClipboard, setFileClipboard] = useState(null);
  const [destinationMode, setDestinationMode] = useState(null);
  const [transferring, setTransferring] = useState(false);
  const [dragOverTarget, setDragOverTarget] = useState(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const scrollContainerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSelectedIds([]);
      setSelectedFolderIds([]);
      setPickerSelection(null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [
    currentFolderId,
    dateFilter,
    debouncedSearch,
    scope,
    sort,
    uploaderFilter,
    usageFilter,
    view,
  ]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (scope !== "all") count += 1;
    if (sort !== "newest") count += 1;
    if (usageFilter !== "all") count += 1;
    if (uploaderFilter !== "all") count += 1;
    if (dateFilter !== "all") count += 1;
    return count;
  }, [scope, sort, usageFilter, uploaderFilter, dateFilter]);

  const resetFilters = useCallback(() => {
    setScope("all");
    setSort("newest");
    setUsageFilter("all");
    setUploaderFilter("all");
    setDateFilter("all");
    setPage(1);
  }, [
    setDateFilter,
    setScope,
    setSort,
    setUploaderFilter,
    setUsageFilter,
  ]);

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
    if (scope === "audio") params.type = "audio";
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
    const [assetResponse, folderResponse, uploaderResponse] =
      await Promise.all([
        assetsApi.list(params),
        isFirstPage && (scope === "all" || scope === "trash")
          ? assetsApi.folders(folderParams)
          : Promise.resolve(null),
        isFirstPage && !uploaders.length
          ? assetsApi.uploaders()
          : Promise.resolve(null),
      ]);
    if (requestId !== requestIdRef.current) return;
    const data = unwrap(assetResponse, {});
    if (!assetResponse.success)
      toast.error(assetResponse.error || "Unable to load files");
    const nextAssets = data.assets || [];
    setAssets((current) => {
      if (isFirstPage) return nextAssets;
      const knownIds = new Set(current.map((asset) => String(asset._id)));
      return [
        ...current,
        ...nextAssets.filter((asset) => !knownIds.has(String(asset._id))),
      ];
    });
    setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    if (folderResponse) setFolders(unwrap(folderResponse, []));
    if (uploaderResponse?.success) setUploaders(unwrap(uploaderResponse, []));
    if (isFirstPage) setLoading(false);
    else setLoadingMore(false);
  }, [
    accept,
    currentFolderId,
    dateFilter,
    debouncedSearch,
    limit,
    page,
    pickerMode,
    refreshKey,
    scope,
    sort,
    uploaderFilter,
    uploaders.length,
    usageFilter,
  ]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [
    accept,
    currentFolderId,
    dateFilter,
    debouncedSearch,
    scope,
    sort,
    uploaderFilter,
    usageFilter,
  ]);

  useEffect(() => {
    const target = loadMoreRef.current;
    const root = scrollContainerRef.current;
    const hasMore = pagination.page < pagination.pages;
    if (!target || !root || loading || loadingMore || !hasMore)
      return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPage((current) => Math.min(current + 1, pagination.pages));
        }
      },
      { root, rootMargin: "280px 0px", threshold: 0.01 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loading, loadingMore, pagination.page, pagination.pages]);

  useEffect(() => {
    let active = true;
    if (!currentFolderId) return undefined;
    assetsApi.folder(currentFolderId).then((response) => {
      if (active && response.success)
        setBreadcrumbState({
          folderId: currentFolderId,
          items: unwrap(response, {}).breadcrumbs || [],
        });
    });
    return () => {
      active = false;
    };
  }, [currentFolderId]);

  const refresh = useCallback(() => {
    setPage(1);
    setRefreshKey((value) => value + 1);
  }, []);
  const resetNavigationState = () => {
    setPage(1);
    setSelectedIds([]);
    setPickerSelection(null);
  };
  const openFolder = (folder) => {
    setCurrentFolderId(folder?._id || null);
    if (!folder) setBreadcrumbState({ folderId: null, items: [] });
    setScope(scope === "trash" ? "trash" : "all");
    resetNavigationState();
  };
  const toggleSelected = (id) =>
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );

  const uploadDroppedFile = async (file, folderId, duplicateStrategy) => {
    const toastId = `asset-drop-${file.name}-${file.size}-${file.lastModified}`;
    let lastShown = -10;
    toast.loading(`Uploading ${file.name}`, {
      id: toastId,
      description: folderId
        ? "Uploading directly to the selected folder…"
        : "Uploading to All Files…",
    });
    const response = await assetsApi.upload(
      file,
      { folderId, duplicateStrategy },
      (progress) => {
        if (progress - lastShown >= 10 || progress === 100) {
          lastShown = progress;
          toast.loading(`Uploading ${file.name}`, {
            id: toastId,
            description: `${progress}% complete`,
          });
        }
      },
    );
    const result = response.data?.results?.[0];
    if (result?.status === "created") {
      toast.success(`${file.name} uploaded`, {
        id: toastId,
        description: result.reusedStorage
          ? "A new library entry now reuses the existing stored file."
          : "The file is ready to reuse.",
      });
      refresh();
      return;
    }
    if (result?.status === "duplicate") {
      toast.warning("This file already exists", {
        id: toastId,
        description: `${result.asset?.name || file.name} has identical content.`,
        action: {
          label: "Create entry",
          onClick: () => uploadDroppedFile(file, folderId, "upload-anyway"),
        },
        cancel: { label: "Use existing", onClick: refresh },
        duration: 12000,
      });
      return;
    }
    toast.error(`Could not upload ${file.name}`, {
      id: toastId,
      description: result?.error || response.error || "Upload failed.",
    });
  };

  const createPastedFolder = useCallback(async (name, parentId) => {
    const baseName = String(name || "New folder").trim().slice(0, 120) || "New folder";

    for (let attempt = 1; attempt <= 100; attempt += 1) {
      const suffix = attempt === 1 ? "" : ` (${attempt})`;
      const candidate = `${baseName.slice(0, 120 - suffix.length)}${suffix}`;
      const response = await assetsApi.createFolder({
        name: candidate,
        parentId,
      });
      if (response.success) return unwrap(response, null);
      if (response.status !== 409) {
        throw new Error(response.error || `Could not create ${candidate}`);
      }
    }

    throw new Error(`Could not create a unique copy of ${baseName}`);
  }, []);

  const pasteClipboardSources = useCallback(
    async (sources) => {
      if (!sources?.length) {
        toast.error("No files found on the clipboard", {
          description: "Copy files or a folder from your device, then try again.",
        });
        return;
      }
      if (scope === "trash") {
        toast.error("Files cannot be pasted into Trash.");
        return;
      }
      if (!canUpload) {
        toast.error("You do not have permission to upload files.");
        return;
      }
      if (pasting) return;

      const toastId = "asset-clipboard-paste";
      const stats = { files: 0, folders: 0, failed: 0 };
      setPasting(true);
      toast.loading("Pasting clipboard items…", {
        id: toastId,
        description: currentFolderId
          ? "Recreating items in the current folder."
          : "Recreating items in All Files.",
      });

      const pasteSource = async (source, destinationFolderId) => {
        if (isDirectorySource(source)) {
          if (!canManage) {
            stats.failed += 1;
            return;
          }
          try {
            const folder = await createPastedFolder(
              source.name,
              destinationFolderId,
            );
            if (!folder?._id) throw new Error("Folder creation failed");
            stats.folders += 1;
            const children = await childrenFromDirectorySource(source);
            for (const child of children) {
              await pasteSource(child, folder._id);
            }
          } catch {
            stats.failed += 1;
          }
          return;
        }

        try {
          const file = await fileFromClipboardSource(source);
          if (!file) throw new Error("Clipboard file is unavailable");
          const response = await assetsApi.upload(file, {
            folderId: destinationFolderId,
            duplicateStrategy: "upload-anyway",
          });
          const result = response.data?.results?.[0];
          if (!response.success || result?.status !== "created") {
            throw new Error(result?.error || response.error || "Upload failed");
          }
          stats.files += 1;
        } catch {
          stats.failed += 1;
        }
      };

      try {
        for (const source of sources) {
          await pasteSource(source, currentFolderId);
        }

        const recreated = [
          stats.files && `${stats.files} file${stats.files === 1 ? "" : "s"}`,
          stats.folders &&
            `${stats.folders} folder${stats.folders === 1 ? "" : "s"}`,
        ]
          .filter(Boolean)
          .join(" and ");

        if (recreated) {
          toast.success(`${recreated} pasted`, {
            id: toastId,
            description: stats.failed
              ? `${stats.failed} item${stats.failed === 1 ? "" : "s"} could not be recreated.`
              : "The clipboard structure was recreated successfully.",
          });
          refresh();
        } else {
          toast.error("Clipboard items could not be pasted", {
            id: toastId,
            description:
              !canManage && sources.some(isDirectorySource)
                ? "Folder pasting requires permission to manage folders."
                : "The browser did not provide readable files.",
          });
        }
      } finally {
        setPasting(false);
      }
    },
    [
      canManage,
      canUpload,
      createPastedFolder,
      currentFolderId,
      pasting,
      refresh,
      scope,
    ],
  );

  const pasteFromSystemClipboard = useCallback(async () => {
    try {
      const sources = await sourcesFromNavigatorClipboard();
      await pasteClipboardSources(sources);
    } catch (error) {
      toast.error("Clipboard access was unavailable", {
        description:
          error?.name === "NotAllowedError"
            ? "Allow clipboard access, or click the Files area and press Ctrl+V."
            : "Click the Files area and press Ctrl+V to paste device files.",
      });
    }
  }, [pasteClipboardSources]);

  const assetEntriesForIds = useCallback(
    (ids) =>
      ids.map((id) => {
        const asset = assets.find((item) => item._id === id);
        return { id, kind: "asset", name: asset?.name || "File" };
      }),
    [assets],
  );

  const entriesForItemAction = useCallback(
    (item, isFolder) => {
      if (!isFolder && selectedIds.includes(item._id)) {
        return assetEntriesForIds(selectedIds);
      }
      return [
        {
          id: item._id,
          kind: isFolder ? "folder" : "asset",
          name: item.name,
        },
      ];
    },
    [assetEntriesForIds, selectedIds],
  );

  const putItemsOnClipboard = useCallback((operation, items) => {
    if (!items.length) return;
    setFileClipboard({ operation, items });
    setDestinationMode(null);
    setSelectedIds([]);
    toast.success(
      `${items.length === 1 ? items[0].name : `${items.length} items`} ${
        operation === "copy" ? "copied" : "cut"
      }`,
      {
        description: "Open a destination folder and choose Paste here.",
      },
    );
  }, []);

  const beginDestinationSelection = useCallback(
    (operation, items, fromClipboard = false) => {
      if (!items?.length) return;
      setDestinationMode({ operation, items, fromClipboard });
      setScope("all");
      setSearch("");
      setSelectedIds([]);
      setPage(1);
    },
    [setScope, setSearch],
  );

  const executeFileTransfer = useCallback(
    async (operation, items, destinationFolderId, consumeClipboard = false) => {
      if (!items?.length || transferring) return;
      if (scope === "trash") {
        toast.error("Items cannot be transferred into Trash.");
        return;
      }
      setTransferring(true);
      const response = await assetsApi.transfer(
        operation,
        items.map(({ id, kind }) => ({ id, kind })),
        destinationFolderId,
      );
      setTransferring(false);
      if (!response.success) {
        toast.error(response.error || "Unable to transfer the selected items");
        return;
      }
      toast.success(response.data?.message || (operation === "copy" ? "Items copied" : "Items moved"));
      if (consumeClipboard) setFileClipboard(null);
      setDestinationMode(null);
      setSelectedIds([]);
      setInspected(null);
      refresh();
    },
    [refresh, scope, transferring],
  );

  const pasteInternalClipboardHere = useCallback(
    () =>
      fileClipboard
        ? executeFileTransfer(
            fileClipboard.operation,
            fileClipboard.items,
            currentFolderId,
            fileClipboard.operation === "move",
          )
        : undefined,
    [currentFolderId, executeFileTransfer, fileClipboard],
  );

  const handleClipboardPaste = useCallback(
    async (event) => {
      if (pickerMode || isEditablePasteTarget(event.target)) return;
      if (fileClipboard) {
        event.preventDefault();
        await pasteInternalClipboardHere();
        return;
      }
      const clipboardData = event.clipboardData;
      const hasFiles =
        clipboardData?.files?.length > 0 ||
        Array.from(clipboardData?.items || []).some(
          (item) => item.kind === "file",
        );
      if (!hasFiles) return;

      event.preventDefault();
      const sources = await sourcesFromClipboardData(clipboardData);
      await pasteClipboardSources(sources);
    },
    [fileClipboard, pasteClipboardSources, pasteInternalClipboardHere, pickerMode],
  );

  useEffect(() => {
    if (pickerMode) return undefined;
    const onPaste = (event) => void handleClipboardPaste(event);
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleClipboardPaste, pickerMode]);

  useEffect(() => {
    if (pickerMode || scope === "trash" || !canManage) return undefined;
    const onKeyDown = (event) => {
      if (
        (!event.ctrlKey && !event.metaKey) ||
        isEditablePasteTarget(event.target) ||
        !selectedIds.length
      ) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key !== "c" && key !== "x") return;
      event.preventDefault();
      putItemsOnClipboard(
        key === "c" ? "copy" : "move",
        assetEntriesForIds(selectedIds),
      );
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    assetEntriesForIds,
    canManage,
    pickerMode,
    putItemsOnClipboard,
    scope,
    selectedIds,
  ]);

  const handleDragStart = (event, item, kind) => {
    if (scope === "trash" || !canManage) return;
    const ids =
      kind === "asset" && selectedIds.includes(item._id)
        ? selectedIds
        : [item._id];
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "application/x-asif-media-library",
      JSON.stringify({ kind, ids }),
    );
    event.dataTransfer.setData("text/plain", item.name);
  };

  const handleDragOver = (event, destinationId) => {
    if (scope === "trash") return;
    const transferTypes = Array.from(event.dataTransfer.types || []);
    const supportsDrop =
      (canUpload && transferTypes.includes("Files")) ||
      (canManage && transferTypes.includes("application/x-asif-media-library"));
    if (!supportsDrop) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = transferTypes.includes("Files")
      ? "copy"
      : "move";
    setDragOverTarget(destinationId || "root");
  };

  const handleDrop = async (event, destinationFolderId = null) => {
    if (scope === "trash") return;
    event.preventDefault();
    event.stopPropagation();
    setDragOverTarget(null);
    if (event.dataTransfer.files?.length) {
      if (!canUpload)
        return toast.error("You do not have permission to upload files.");
      Array.from(event.dataTransfer.files).forEach((file) =>
        uploadDroppedFile(file, destinationFolderId),
      );
      return;
    }
    if (!canManage)
      return toast.error("You do not have permission to move library items.");
    try {
      const payload = JSON.parse(
        event.dataTransfer.getData("application/x-asif-media-library") || "{}",
      );
      if (!payload.ids?.length) return;
      const response =
        payload.kind === "folder"
          ? await assetsApi.updateFolder(payload.ids[0], {
              parentId: destinationFolderId,
            })
          : await assetsApi.bulk("move", payload.ids, {
              folderId: destinationFolderId,
            });
      if (!response.success)
        return toast.error(response.error || "Unable to move the dropped item");
      toast.success(
        payload.kind === "folder"
          ? "Folder moved"
          : `${payload.ids.length} file${payload.ids.length === 1 ? "" : "s"} moved`,
      );
      setSelectedIds([]);
      refresh();
    } catch {
      toast.error("The dropped item could not be moved.");
    }
  };

  const clearDropTarget = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget))
      setDragOverTarget(null);
  };

  const handleAction = async (action, item, isFolder = false) => {
    if (action === "select") {
      if (isFolder) {
        toggleSelectedFolder(item._id);
      } else {
        toggleSelected(item._id);
      }
      return;
    }
    if (["copy", "cut", "move"].includes(action)) {
      const items = entriesForItemAction(item, isFolder);
      setInspected(null);
      if (action === "move") {
        beginDestinationSelection("move", items);
      } else {
        putItemsOnClipboard(action === "copy" ? "copy" : "move", items);
      }
      return;
    }
    if (action === "inspect") return setInspected(item);
    if (action === "favorite") {
      const response = await assetsApi.update(item._id, {
        isFavorite: !item.isFavorite,
      });
      if (!response.success)
        return toast.error(response.error || "Unable to update favorite");
      toast.success(
        item.isFavorite ? "Removed from favorites" : "Added to favorites",
      );
      setInspected((current) =>
        current?._id === item._id
          ? { ...current, isFavorite: !item.isFavorite }
          : current,
      );
      return refresh();
    }
    if (action === "restore") {
      const response = isFolder
        ? await assetsApi.restoreFolder(item._id)
        : await assetsApi.restore(item._id);
      if (!response.success)
        return toast.error(response.error || "Unable to restore item");
      toast.success(isFolder ? "Folder restored" : "File restored");
      setInspected(null);
      return refresh();
    }
    setDialog({
      type: action,
      item,
      isFolder,
      ids: item ? [item._id] : selectedIds,
    });
  };

  const toggleSelectedFolder = useCallback((folderId) => {
    setSelectedFolderIds((current) =>
      current.includes(folderId)
        ? current.filter((id) => id !== folderId)
        : [...current, folderId],
    );
  }, []);

  const runDialogAction = async (value) => {
    if (!dialog) return;
    setWorking(true);
    let response;
    if (dialog.type === "create-folder")
      response = await assetsApi.createFolder({
        name: value,
        parentId: currentFolderId,
      });
    if (dialog.type === "rename")
      response = dialog.isFolder
        ? await assetsApi.updateFolder(dialog.item._id, { name: value })
        : await assetsApi.update(dialog.item._id, { name: value });
    if (dialog.type === "trash") {
      if (dialog.item) {
        response = dialog.isFolder
          ? await assetsApi.trashFolder(dialog.item._id)
          : await assetsApi.bulk("trash", [dialog.item._id]);
      } else {
        const promises = [];
        if (dialog.folderIds?.length) {
          promises.push(
            ...dialog.folderIds.map((id) => assetsApi.trashFolder(id)),
          );
        }
        if (dialog.ids?.length) {
          promises.push(assetsApi.bulk("trash", dialog.ids));
        }
        const results = await Promise.all(promises);
        const failed = results.find((r) => !r?.success);
        response = failed || {
          success: true,
          data: { message: "Selected items moved to Trash." },
        };
      }
    }
    if (dialog.type === "permanent") {
      if (dialog.item) {
        response = dialog.isFolder
          ? await assetsApi.deleteFolderPermanently(dialog.item._id)
          : await assetsApi.bulk("permanent_delete", [dialog.item._id]);
      } else {
        const promises = [];
        if (dialog.folderIds?.length) {
          promises.push(
            ...dialog.folderIds.map((id) =>
              assetsApi.deleteFolderPermanently(id),
            ),
          );
        }
        if (dialog.ids?.length) {
          promises.push(assetsApi.bulk("permanent_delete", dialog.ids));
        }
        const results = await Promise.all(promises);
        const failed = results.find((r) => !r?.success);
        response = failed || {
          success: true,
          data: { message: "Selected items permanently deleted." },
        };
      }
    }
    setWorking(false);
    if (!response?.success) {
      const itemError = Array.isArray(response?.data)
        ? response.data.find((entry) => !entry.success)?.error
        : null;
      return toast.error(
        itemError || response?.error || "The action could not be completed",
      );
    }
    toast.success(response?.data?.message || "Media Library updated");
    setDialog(null);
    setSelectedIds([]);
    setSelectedFolderIds([]);
    setInspected(null);
    refresh();
  };

  const runBulk = async (action) => {
    if (action === "restore") {
      setWorking(true);
      const promises = [];
      if (selectedFolderIds.length > 0) {
        promises.push(
          ...selectedFolderIds.map((id) => assetsApi.restoreFolder(id)),
        );
      }
      if (selectedIds.length > 0) {
        promises.push(assetsApi.bulk("restore", selectedIds));
      }
      const results = await Promise.all(promises);
      setWorking(false);
      const failed = results.find((r) => !r?.success);
      if (failed)
        return toast.error(failed?.error || "Unable to restore items");
      toast.success("Selected items restored");
      setSelectedIds([]);
      setSelectedFolderIds([]);
      refresh();
      return;
    }

    if (["move", "copy", "cut"].includes(action)) {
      const items = assetEntriesForIds(selectedIds);
      if (action === "move") {
        beginDestinationSelection("move", items);
      } else {
        putItemsOnClipboard(action === "copy" ? "copy" : "move", items);
      }
      return;
    }
    if (action === "trash" || action === "permanent")
      return setDialog({
        type: action,
        ids: selectedIds,
        folderIds: selectedFolderIds,
        isFolder: false,
      });
    const response = await assetsApi.bulk(action, selectedIds);
    if (!response.success)
      return toast.error(response.error || "Unable to update files");
    toast.success("Files updated");
    setSelectedIds([]);
    setSelectedFolderIds([]);
    refresh();
  };

  const folderSectionVisible =
    (scope === "all" || scope === "trash") && !debouncedSearch;
  const selectedAll =
    (folders.length > 0 || assets.length > 0) &&
    (folderSectionVisible
      ? folders.every((f) => selectedFolderIds.includes(f._id))
      : true) &&
    assets.every((asset) => selectedIds.includes(asset._id));

  const toggleSelectAll = useCallback(() => {
    if (selectedAll) {
      setSelectedIds([]);
      setSelectedFolderIds([]);
    } else {
      setSelectedIds(assets.map((asset) => asset._id));
      if (folderSectionVisible) {
        setSelectedFolderIds(folders.map((folder) => folder._id));
      }
    }
  }, [assets, folderSectionVisible, folders, selectedAll]);
  const empty = emptyCopy[scope] || [
    "No matching files",
    "Try another search or filter.",
  ];

  return (
    <div
      className={cn(
        "min-w-0 relative flex-1 flex flex-col h-full w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 min-h-0",
        pickerMode && "flex h-[70vh] flex-col",
      )}
    >
      <main
        onDragOver={(event) => handleDragOver(event, currentFolderId || "root")}
        onDragLeave={clearDropTarget}
        onDrop={(event) => handleDrop(event, currentFolderId)}
        className={cn(
          "flex min-w-0 flex-1 flex-col h-full w-full overflow-hidden bg-white dark:bg-zinc-950 min-h-0",
          dragOverTarget === (currentFolderId || "root") &&
            "ring-2 ring-blue-500/30",
          pickerMode && "flex min-h-0 flex-1 flex-col",
        )}
      >
        {/* Navigation & Action Header */}
        <AssetToolbar
          scope={scope}
          setScope={setScope}
          currentFolderId={currentFolderId}
          breadcrumbs={breadcrumbs}
          openFolder={openFolder}
          handleDragOver={handleDragOver}
          clearDropTarget={clearDropTarget}
          handleDrop={handleDrop}
          search={search}
          setSearch={setSearch}
          setPage={setPage}
          setSelectedIds={setSelectedIds}
          mobileSearchOpen={mobileSearchOpen}
          setMobileSearchOpen={setMobileSearchOpen}
          view={view}
          setView={setView}
          refresh={refresh}
          canUpload={canUpload}
          canManage={canManage}
          setUploadOpen={setUploadOpen}
          setDialog={setDialog}
          pickerMode={pickerMode}
          sort={sort}
          setSort={setSort}
          usageFilter={usageFilter}
          setUsageFilter={setUsageFilter}
          uploaderFilter={uploaderFilter}
          setUploaderFilter={setUploaderFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          uploaders={uploaders}
          activeFilterCount={activeFilterCount}
          resetFilters={resetFilters}
          onScopeChange={() => {
            setCurrentFolderId(null);
            setBreadcrumbState({ folderId: null, items: [] });
            resetNavigationState();
          }}
        />

        {/* Active Filter Badges Row */}
        <AssetActiveFilters
          activeFilterCount={activeFilterCount}
          search={search}
          setSearch={setSearch}
          scope={scope}
          setScope={setScope}
          sort={sort}
          setSort={setSort}
          usageFilter={usageFilter}
          setUsageFilter={setUsageFilter}
          uploaderFilter={uploaderFilter}
          setUploaderFilter={setUploaderFilter}
          uploaders={uploaders}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          resetFilters={resetFilters}
        />

        <AssetTransferBar
          clipboard={fileClipboard}
          destinationMode={destinationMode}
          breadcrumbs={breadcrumbs}
          currentFolderId={currentFolderId}
          loading={transferring}
          onPasteHere={pasteInternalClipboardHere}
          onChooseDestination={() =>
            beginDestinationSelection(
              fileClipboard?.operation,
              fileClipboard?.items,
              true,
            )
          }
          onConfirmDestination={() =>
            executeFileTransfer(
              destinationMode?.operation,
              destinationMode?.items,
              currentFolderId,
              Boolean(
                destinationMode?.fromClipboard &&
                  destinationMode?.operation === "move",
              ),
            )
          }
          onCancelDestination={() => setDestinationMode(null)}
          onClearClipboard={() => setFileClipboard(null)}
        />

        {/* Selected Items Bulk Action Bar */}
        <AssetBulkActions
          selectedIds={selectedIds}
          selectedFolderIds={selectedFolderIds}
          setSelectedIds={setSelectedIds}
          setSelectedFolderIds={setSelectedFolderIds}
          scope={scope}
          runBulk={runBulk}
          user={user}
          pickerMode={pickerMode}
        />

        {/* Main Canvas Scroll Area */}
        <AssetContextMenu
          scope={scope}
          canManage={canManage}
          canUpload={canUpload}
          onCreateFolder={() => setDialog({ type: "create-folder" })}
          onUpload={() => setUploadOpen(true)}
          clipboard={fileClipboard}
          onPasteItems={pasteInternalClipboardHere}
          onPaste={pasteFromSystemClipboard}
          pasteDisabled={pasting || transferring}
          onRefresh={refresh}
          onSelectAll={toggleSelectAll}
          hasSelectableItems={assets.length > 0 || folders.length > 0}
          view={view}
          onViewChange={setView}
          disabled={pickerMode || loading}
        >
          <div
            ref={scrollContainerRef}
            className={cn(
              "flex-1 overflow-y-auto min-h-0 pb-16 lg:pb-0 scrollbar-none",
              pickerMode && "min-h-0 pb-0",
            )}
            data-scroll-ignore
            aria-busy={loading || loadingMore || pasting}
          >
          {loading ? (
            view === "card" ? (
              <div className="grid grid-cols-4 gap-2.5 p-3 sm:gap-3 sm:p-4 sm:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-2.5 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <Skeleton className="aspect-4/3 w-full rounded-lg" />
                    <div className="mt-2 space-y-1.5 p-1">
                      <Skeleton className="h-3.5 w-3/4 rounded-md" />
                      <Skeleton className="h-2.5 w-1/2 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-100 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <tr>
                      <th className="px-3 sm:px-4 py-3">
                        <Skeleton className="h-3 w-16 rounded" />
                      </th>
                      <th className="hidden md:table-cell px-3 py-3">
                        <Skeleton className="h-3 w-12 rounded" />
                      </th>
                      <th className="px-3 py-3">
                        <Skeleton className="h-3 w-20 rounded" />
                      </th>
                      <th className="hidden lg:table-cell px-3 py-3">
                        <Skeleton className="h-3 w-14 rounded" />
                      </th>
                      <th className="hidden xl:table-cell px-3 py-3">
                        <Skeleton className="h-3 w-20 rounded" />
                      </th>
                      <th className="hidden sm:table-cell px-3 py-3">
                        <Skeleton className="h-3 w-16 rounded" />
                      </th>
                      <th className="hidden md:table-cell px-3 py-3">
                        <Skeleton className="h-3 w-12 rounded" />
                      </th>
                      <th className="w-8 sm:w-12" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <tr key={index}>
                        <td className="px-3 sm:px-4 py-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Skeleton className="h-8 w-9 sm:h-10 sm:w-12 rounded-lg shrink-0" />
                            <Skeleton className="h-4 w-32 sm:w-44 rounded-md" />
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-3 py-3">
                          <Skeleton className="h-3 w-14 rounded" />
                        </td>
                        <td className="px-2 sm:px-3 py-3">
                          <Skeleton className="h-3 w-16 rounded" />
                        </td>
                        <td className="hidden lg:table-cell px-3 py-3">
                          <Skeleton className="h-3 w-14 rounded" />
                        </td>
                        <td className="hidden xl:table-cell px-3 py-3">
                          <Skeleton className="h-3 w-20 rounded" />
                        </td>
                        <td className="hidden sm:table-cell px-3 py-3">
                          <Skeleton className="h-3 w-16 rounded" />
                        </td>
                        <td className="hidden md:table-cell px-3 py-3">
                          <Skeleton className="h-3 w-10 rounded" />
                        </td>
                        <td className="w-8 sm:w-12 px-1 sm:px-2 py-3">
                          <Skeleton className="h-6 w-6 rounded-full" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )
          ) : !assets.length && !folders.length ? (
            <AdminEmptyState
              icon={scope === "trash" ? Trash2 : Files}
              title={empty[0]}
              description={
                debouncedSearch ? "Try a broader search." : empty[1]
              }
              action={
                scope !== "trash" && !pickerMode && canUpload ? (
                  <Button onClick={() => setUploadOpen(true)}>
                    <Upload className="h-4 w-4" /> Upload files
                  </Button>
                ) : null
              }
            />
          ) : view === "card" ? (
            <AssetCardGrid
              folderSectionVisible={folderSectionVisible}
              folders={folders}
              assets={assets}
              pickerMode={pickerMode}
              scope={scope}
              canManage={canManage}
              dragOverTarget={dragOverTarget}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              clearDropTarget={clearDropTarget}
              handleDrop={handleDrop}
              openFolder={openFolder}
              handleAction={handleAction}
              pickerSelection={pickerSelection}
              setPickerSelection={setPickerSelection}
              selectedIds={selectedIds}
              toggleSelected={toggleSelected}
              selectedFolderIds={selectedFolderIds}
              toggleSelectedFolder={toggleSelectedFolder}
              setInspected={setInspected}
              accept={accept}
            />
          ) : (
            <AssetTableListView
              folderSectionVisible={folderSectionVisible}
              folders={folders}
              assets={assets}
              pickerMode={pickerMode}
              scope={scope}
              canManage={canManage}
              dragOverTarget={dragOverTarget}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              clearDropTarget={clearDropTarget}
              handleDrop={handleDrop}
              openFolder={openFolder}
              handleAction={handleAction}
              pickerSelection={pickerSelection}
              setPickerSelection={setPickerSelection}
              selectedIds={selectedIds}
              toggleSelected={toggleSelected}
              selectedFolderIds={selectedFolderIds}
              toggleSelectedFolder={toggleSelectedFolder}
              selectedAll={selectedAll}
              toggleSelectAll={toggleSelectAll}
              setInspected={setInspected}
              accept={accept}
            />
          )}

          <div
            ref={loadMoreRef}
            className="flex min-h-14 items-center justify-center px-4 py-3"
            aria-live="polite"
          >
            {loadingMore ? (
              <span className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500">
                <LogoLoader className="h-3.5 w-3.5" />{" "}
                Loading more files…
              </span>
            ) : assets.length > 0 && pagination.page < pagination.pages ? (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Scroll to load more
              </span>
            ) : assets.length > 0 ? (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                All {pagination.total} files loaded
              </span>
            ) : null}
          </div>
          </div>
        </AssetContextMenu>

        {pickerMode && (
          <div className="flex items-center justify-between gap-3 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <p className="min-w-0 truncate text-xs font-semibold text-zinc-500">
              {pickerSelection
                ? pickerSelection.name
                : "Select a file from the library"}
            </p>
            <Button
              type="button"
              disabled={!pickerSelection}
              onClick={() => onChoose?.(pickerSelection)}
            >
              Select file
            </Button>
          </div>
        )}
      </main>

      {/* Mobile Floating Action Button (FAB) */}
      {scope !== "trash" && (canUpload || canManage) && !pickerMode && (
        <div className="fixed bottom-22 sm:bottom-6 right-5 z-40 lg:hidden">
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
                <DropdownMenuItem
                  onSelect={() => setUploadOpen(true)}
                  className="gap-2.5 py-2 font-semibold"
                >
                  <Upload className="h-4 w-4 text-blue-600" />
                  <span>Upload files</span>
                </DropdownMenuItem>
              )}
              {canManage && (
                <DropdownMenuItem
                  onSelect={() => setDialog({ type: "create-folder" })}
                  className="gap-2.5 py-2 font-semibold"
                >
                  <FolderPlus className="h-4 w-4 text-amber-500" />
                  <span>New folder</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Dialog Modals */}
      {!pickerMode && inspected && (
        <AssetInspector
          asset={inspected}
          assets={assets}
          onSelectAsset={setInspected}
          user={user}
          onClose={() => setInspected(null)}
          onAction={(action, item) => {
            if (action === "copied") return toast.success("URL copied");
            handleAction(action, item, false);
          }}
        />
      )}
      <AssetUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        folderId={currentFolderId}
        onUploaded={() => refresh()}
      />
      <AssetTextDialog
        key="create-folder"
        open={dialog?.type === "create-folder"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Create folder"
        description="Folders organize the library without becoming part of file URLs."
        label="Folder name"
        confirmLabel="Create folder"
        loading={working}
        onConfirm={runDialogAction}
      />
      <AssetTextDialog
        key={`rename-${dialog?.item?._id || "none"}`}
        open={dialog?.type === "rename"}
        onOpenChange={(open) => !open && setDialog(null)}
        title={`Rename ${dialog?.isFolder ? "folder" : "file"}`}
        description={
          dialog?.isFolder
            ? "The folder path is organizational only."
            : "The storage key and content references will not change."
        }
        label="Name"
        initialValue={dialog?.item?.name || ""}
        loading={working}
        onConfirm={runDialogAction}
      />
      <AssetConfirmDialog
        open={dialog?.type === "trash"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Move to Trash?"
        description={
          dialog?.item
            ? dialog.isFolder
              ? "The folder, nested folders, and active files inside it will move to Trash. Existing public URLs continue to work until permanent deletion."
              : "Selected file will be hidden from the active library but remain recoverable."
            : `${(dialog?.folderIds?.length || 0) + (dialog?.ids?.length || 0)} selected item${(dialog?.folderIds?.length || 0) + (dialog?.ids?.length || 0) === 1 ? "" : "s"} will be hidden from the active library but remain recoverable.`
        }
        confirmLabel="Move to Trash"
        loading={working}
        onConfirm={runDialogAction}
      />
      <AssetConfirmDialog
        open={dialog?.type === "permanent"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Delete permanently?"
        description={
          dialog?.item
            ? dialog.isFolder
              ? "This folder and its contents will be permanently deleted. This cannot be undone."
              : "This file will be permanently deleted. This cannot be undone."
            : `${(dialog?.folderIds?.length || 0) + (dialog?.ids?.length || 0)} selected item${(dialog?.folderIds?.length || 0) + (dialog?.ids?.length || 0) === 1 ? "" : "s"} will be permanently deleted. This cannot be undone.`
        }
        confirmLabel="Delete forever"
        destructive
        loading={working}
        onConfirm={runDialogAction}
      />
    </div>
  );
}
