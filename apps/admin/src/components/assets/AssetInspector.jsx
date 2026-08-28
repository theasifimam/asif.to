"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FolderInput,
  Heart,
  Info,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { assetsApi } from "@/lib/api";
import { ASSET_TYPE_LABELS, formatAssetBytes, getAssetUrl } from "@/lib/assets";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { hasPermission } from "@/lib/permissions";
import AssetThumbnail from "./AssetThumbnail";

function Detail({ label, children }) {
  return (
    <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-2 py-2 text-xs">
      <dt className="font-semibold text-zinc-400">{label}</dt>
      <dd className="min-w-0 wrap-break-word font-semibold text-zinc-200">
        {children || "—"}
      </dd>
    </div>
  );
}

export default function AssetInspector({
  asset,
  assets = [],
  onSelectAsset,
  user,
  onClose,
  onAction,
}) {
  const containerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const [usages, setUsages] = useState([]);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slideOffset, setSlideOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const publicUrl = getAssetUrl(asset);
  const downloadUrl = getAssetUrl(asset, { download: true });
  const canManage = hasPermission(user, "assets.manage");
  const canPermanentlyDelete = hasPermission(user, "assets.delete_permanent");

  const currentIndex = assets?.findIndex((a) => a._id === asset._id) ?? -1;
  const prevAsset = currentIndex > 0 ? assets[currentIndex - 1] : null;
  const nextAsset =
    currentIndex >= 0 && currentIndex < assets.length - 1
      ? assets[currentIndex + 1]
      : null;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const elem = containerRef.current || document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch {
      // Browser full-screen API handled gracefully
    }
  };

  const handleClose = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!asset?._id) return;
    let active = true;
    const timer = window.setTimeout(() => {
      setLoadingUsage(true);
      assetsApi.usages(asset._id).then((response) => {
        if (!active) return;
        setUsages(
          response.success ? response.data?.data || response.data || [] : [],
        );
        setLoadingUsage(false);
      });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [asset?._id]);

  // Smooth slide navigation transition handler
  const navigateTo = useCallback(
    (targetAsset, direction) => {
      if (!targetAsset || isTransitioning) return;
      setIsTransitioning(true);
      setIsDragging(false);

      // Phase 1: Slide current item off-screen in navigation direction
      const exitX =
        direction === "next" ? -window.innerWidth : window.innerWidth;
      setSlideOffset(exitX);

      // Phase 2: Switch asset and position new asset at entrance offset
      setTimeout(() => {
        onSelectAsset?.(targetAsset);
        const entranceX =
          direction === "next"
            ? Math.min(window.innerWidth * 0.4, 400)
            : Math.max(-window.innerWidth * 0.4, -400);
        setSlideOffset(entranceX);

        // Phase 3: Animate smoothly to center (0)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setSlideOffset(0);
            setTimeout(() => {
              setIsTransitioning(false);
            }, 220);
          });
        });
      }, 180);
    },
    [isTransitioning, onSelectAsset],
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "Esc") {
        handleClose();
      }
      if ((e.key === "ArrowLeft" || e.key === "Left") && prevAsset) {
        navigateTo(prevAsset, "prev");
      }
      if ((e.key === "ArrowRight" || e.key === "Right") && nextAsset) {
        navigateTo(nextAsset, "next");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, prevAsset, nextAsset, navigateTo]);

  // Touch & Pointer Drag gesture handling for interactive sliding
  const handleTouchStart = (e) => {
    if (isTransitioning) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    touchStartRef.current = { x: clientX, y: clientY };
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || isTransitioning) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const diffX = clientX - touchStartRef.current.x;
    const diffY = clientY - touchStartRef.current.y;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      setSlideOffset(diffX);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 60; // 60px swipe trigger threshold
    if (slideOffset < -threshold && nextAsset) {
      navigateTo(nextAsset, "next");
    } else if (slideOffset > threshold && prevAsset) {
      navigateTo(prevAsset, "prev");
    } else {
      // Spring back to center smoothly
      setIsTransitioning(true);
      setSlideOffset(0);
      setTimeout(() => setIsTransitioning(false), 200);
    }
  };

  if (!asset) return null;

  const copyUrl = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    onAction?.("copied", asset);
  };

  // Pure Full Screen Mode View
  if (isFullscreen) {
    return (
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handleTouchStart}
        onPointerMove={handleTouchMove}
        onPointerUp={handleTouchEnd}
        onPointerCancel={handleTouchEnd}
        className="fixed inset-0 z-3500 flex h-screen w-screen items-center justify-center bg-black select-none touch-pan-y"
        data-scroll-ignore
      >
        {/* Fullscreen Navigation Chevrons */}
        {prevAsset && (
          <button
            type="button"
            onClick={() => navigateTo(prevAsset, "prev")}
            className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-3 text-white backdrop-blur-md hover:bg-black/80 shadow-xl transition-all"
            aria-label="Previous file"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {nextAsset && (
          <button
            type="button"
            onClick={() => navigateTo(nextAsset, "next")}
            className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-3 text-white backdrop-blur-md hover:bg-black/80 shadow-xl transition-all"
            aria-label="Next file"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Pure Full Screen Media Display with Slide Animation */}
        <div
          className="flex h-full w-full items-center justify-center"
          style={{
            transform: `translateX(${slideOffset}px)`,
            transition: isDragging
              ? "none"
              : "transform 220ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {asset.category === "image" && publicUrl ? (
            <img
              src={publicUrl}
              alt={asset.name}
              className="h-full w-full object-contain pointer-events-none"
            />
          ) : asset.category === "video" && publicUrl ? (
            <video
              src={publicUrl}
              controls
              autoPlay
              className="h-full w-full object-contain"
            />
          ) : asset.extension === ".pdf" && publicUrl ? (
            <iframe
              title={`Preview ${asset.name}`}
              src={publicUrl}
              className="h-full w-full border-none bg-white"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 text-center text-white">
              <AssetThumbnail asset={asset} iconClassName="h-24 w-24" />
              <p className="text-base font-bold">{asset.name}</p>
            </div>
          )}
        </div>

        {/* Exit Fullscreen Button */}
        <div className="absolute top-4 right-4 z-50 opacity-80 transition-opacity hover:opacity-100">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-black/80"
            title="Exit Fullscreen (Esc)"
          >
            <Minimize2 className="h-4 w-4" />
            <span>Exit Fullscreen</span>
          </button>
        </div>
      </div>
    );
  }

  // Normal Lightbox Mode View
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-3000 flex flex-col bg-zinc-950/95 text-white backdrop-blur-xl transition-all select-none"
      data-scroll-ignore
    >
      {/* Top Bar Navigation & Actions */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800/80 px-4 sm:px-6 z-20">
        {/* File Name & Metadata */}
        <div className="flex items-center gap-3 min-w-0 pr-4">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-black text-white">
              {asset.name}
            </h2>
            <p className="text-[11px] font-medium text-zinc-400">
              {ASSET_TYPE_LABELS[asset.category]} ·{" "}
              {formatAssetBytes(asset.size)}
              {asset.width && asset.height
                ? ` · ${asset.width}×${asset.height}px`
                : ""}
            </p>
          </div>
        </div>
        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Details / Info Panel Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            className={cn(
              "border-zinc-800 bg-zinc-900/80 text-zinc-200 hover:bg-zinc-800 hover:text-white rounded-xl gap-1.5",
              showInfo &&
                "bg-blue-600 text-white border-blue-600 hover:bg-blue-500",
            )}
          >
            <Info className="h-4 w-4" />
            <span className="hidden md:inline">Details</span>
          </Button>

          {/* Summarized Options Dropdown Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-zinc-800 bg-zinc-900/80 text-zinc-200 hover:bg-zinc-800 hover:text-white rounded-xl gap-1.5 font-bold"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span>Options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 p-1.5">
              {publicUrl && (
                <DropdownMenuItem
                  onSelect={copyUrl}
                  className="gap-2.5 py-2 font-semibold"
                >
                  <Copy className="h-4 w-4 text-blue-500" /> Copy URL
                </DropdownMenuItem>
              )}
              {downloadUrl && (
                <DropdownMenuItem
                  asChild
                  className="gap-2.5 py-2 font-semibold"
                >
                  <a href={downloadUrl} download>
                    <Download className="h-4 w-4 text-emerald-500" /> Download
                    file
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onSelect={toggleFullscreen}
                className="gap-2.5 py-2 font-semibold"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4 text-purple-400" />
                ) : (
                  <Maximize2 className="h-4 w-4 text-purple-400" />
                )}
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen mode"}
              </DropdownMenuItem>
              {canManage && (
                <DropdownMenuItem
                  onSelect={() => onAction?.("favorite", asset)}
                  className="gap-2.5 py-2 font-semibold"
                >
                  <Heart
                    className={`h-4 w-4 ${asset.isFavorite ? "fill-rose-500 text-rose-500" : ""}`}
                  />
                  {asset.isFavorite
                    ? "Remove from favorites"
                    : "Add to favorites"}
                </DropdownMenuItem>
              )}
              {canManage && (
                <DropdownMenuItem
                  onSelect={() => onAction?.("rename", asset)}
                  className="gap-2.5 py-2 font-semibold"
                >
                  <Pencil className="h-4 w-4 text-amber-500" /> Rename
                </DropdownMenuItem>
              )}
              {canManage && asset.status === "active" && (
                <DropdownMenuItem
                  onSelect={() => onAction?.("move", asset)}
                  className="gap-2.5 py-2 font-semibold"
                >
                  <FolderInput className="h-4 w-4 text-indigo-500" /> Move to
                  folder
                </DropdownMenuItem>
              )}
              {canManage && (
                <>
                  <DropdownMenuSeparator />
                  {asset.status === "active" ? (
                    <DropdownMenuItem
                      onSelect={() => onAction?.("trash", asset)}
                      variant="destructive"
                      className="gap-2.5 py-2 font-semibold"
                    >
                      <Trash2 className="h-4 w-4" /> Move to Trash
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem
                        onSelect={() => onAction?.("restore", asset)}
                        className="gap-2.5 py-2 font-semibold"
                      >
                        <RotateCcw className="h-4 w-4 text-emerald-500" />{" "}
                        Restore file
                      </DropdownMenuItem>
                      {canPermanentlyDelete && (
                        <DropdownMenuItem
                          onSelect={() => onAction?.("permanent", asset)}
                          variant="destructive"
                          className="gap-2.5 py-2 font-semibold"
                        >
                          <Trash2 className="h-4 w-4" /> Delete permanently
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="ml-1 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Full-Screen Media Stage + Optional Details Drawer */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {/* Backward Navigation Arrow (Left Key) */}
        {prevAsset && (
          <button
            type="button"
            onClick={() => navigateTo(prevAsset, "prev")}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-zinc-800 bg-zinc-900/80 p-3 text-zinc-300 backdrop-blur-md hover:bg-zinc-800 hover:text-white shadow-xl transition-all"
            aria-label="Previous file (Backward key)"
            title="Previous file (Left Arrow)"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Forward Navigation Arrow (Right Key) */}
        {nextAsset && (
          <button
            type="button"
            onClick={() => navigateTo(nextAsset, "next")}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-zinc-800 bg-zinc-900/80 p-3 text-zinc-300 backdrop-blur-md hover:bg-zinc-800 hover:text-white shadow-xl transition-all"
            aria-label="Next file (Forward key)"
            title="Next file (Right Arrow)"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Center Media Stage with Animated Slide Transition */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onPointerDown={handleTouchStart}
          onPointerMove={handleTouchMove}
          onPointerUp={handleTouchEnd}
          onPointerCancel={handleTouchEnd}
          className="flex flex-1 items-center justify-center p-4 sm:p-8 min-w-0 min-h-0 touch-pan-y cursor-grab active:cursor-grabbing overflow-hidden"
        >
          <div
            className="flex items-center justify-center max-h-full max-w-full"
            style={{
              transform: `translateX(${slideOffset}px)`,
              transition: isDragging
                ? "none"
                : "transform 220ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {asset.category === "image" && publicUrl ? (
              <img
                src={publicUrl}
                alt={asset.name}
                className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl transition-all pointer-events-none"
              />
            ) : asset.category === "video" && publicUrl ? (
              <video
                src={publicUrl}
                controls
                autoPlay
                className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
              />
            ) : asset.extension === ".pdf" && publicUrl ? (
              <iframe
                title={`Preview ${asset.name}`}
                src={publicUrl}
                className="h-full w-full max-w-5xl rounded-2xl border border-zinc-800 bg-white"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-8 sm:p-12 text-center backdrop-blur-md max-w-md">
                <AssetThumbnail asset={asset} iconClassName="h-16 w-16" />
                <div>
                  <p className="text-base font-black text-white">{asset.name}</p>
                  <p className="mt-1 text-xs font-medium text-zinc-400">
                    No direct preview available for{" "}
                    {asset.extension || asset.mimeType} files
                  </p>
                </div>
                {downloadUrl && (
                  <Button asChild className="rounded-xl font-bold">
                    <a href={downloadUrl} download>
                      <Download className="h-4 w-4" /> Download file
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sliding Details Drawer */}
        {showInfo && (
          <aside className="w-80 border-l border-zinc-800/80 bg-zinc-900/95 p-5 overflow-y-auto shrink-0 backdrop-blur-md transition-all z-20">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 mb-3">
              File Information
            </h3>
            <dl className="divide-y divide-zinc-800 text-xs">
              <Detail label="Original name">{asset.originalName}</Detail>
              <Detail label="Type">
                {ASSET_TYPE_LABELS[asset.category] || asset.mimeType}
              </Detail>
              <Detail label="Extension">{asset.extension}</Detail>
              <Detail label="Size">{formatAssetBytes(asset.size)}</Detail>
              {asset.width && asset.height && (
                <Detail label="Dimensions">
                  {asset.width} × {asset.height}px
                </Detail>
              )}
              <Detail label="Folder">{asset.folder?.name || "Root"}</Detail>
              <Detail label="Visibility">{asset.visibility}</Detail>
              <Detail label="Uploaded by">
                {asset.uploadedBy?.fullName ||
                  asset.uploadedBy?.username ||
                  "Imported file"}
              </Detail>
              <Detail label="Uploaded">
                {new Date(asset.createdAt).toLocaleString()}
              </Detail>
              <Detail label="Usage">
                {asset.usageCount || usages.length} reference
                {(asset.usageCount || usages.length) === 1 ? "" : "s"}
              </Detail>
            </dl>

            <section className="mt-6">
              <div className="flex items-center gap-2 mb-2">
                <Bookmark className="h-4 w-4 text-blue-400" />
                <h4 className="text-xs font-black text-white">Used in</h4>
              </div>
              <div className="space-y-2">
                {loadingUsage ? (
                  <p className="text-xs font-medium text-zinc-400">
                    Loading usage…
                  </p>
                ) : usages.length ? (
                  usages.map((usage) => (
                    <a
                      key={usage._id}
                      href={usage.route || "#"}
                      className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 p-2.5 hover:border-blue-500 bg-zinc-950/50"
                    >
                      <span className="min-w-0">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                          {usage.entityType} · {usage.field}
                        </span>
                        <span className="block truncate text-xs font-bold text-white">
                          {usage.entityTitle || usage.entityId}
                        </span>
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    </a>
                  ))
                ) : (
                  <p className="rounded-xl bg-zinc-950/50 p-2.5 text-xs font-medium text-zinc-400">
                    No tracked content references.
                  </p>
                )}
              </div>
            </section>
          </aside>
        )}
      </div>
    </div>
  );
}
