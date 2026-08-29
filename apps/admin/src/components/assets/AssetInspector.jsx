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
  Scissors,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
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

const SLIDE_DURATION = 260;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function touchDistance(touches) {
  return Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY,
  );
}

function touchCenter(touches) {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  };
}

function constrainImagePan(pan, zoom, surface, asset) {
  if (zoom <= MIN_ZOOM || !surface) return { x: 0, y: 0 };
  const rect = surface.getBoundingClientRect();
  let fittedWidth = rect.width;
  let fittedHeight = rect.height;

  if (asset?.width && asset?.height) {
    const fit = Math.min(rect.width / asset.width, rect.height / asset.height);
    fittedWidth = asset.width * fit;
    fittedHeight = asset.height * fit;
  }

  const maxX = Math.max(0, (fittedWidth * zoom - rect.width) / 2);
  const maxY = Math.max(0, (fittedHeight * zoom - rect.height) / 2);
  return {
    x: clamp(pan.x, -maxX, maxX),
    y: clamp(pan.y, -maxY, maxY),
  };
}

function isViewerControl(target) {
  return Boolean(
    target?.closest?.(
      "button, a, input, textarea, select, video, iframe, [role='menu'], [role='menuitem']",
    ),
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
  const mediaStageRef = useRef(null);
  const gestureRef = useRef({ mode: null });
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const transitionTimersRef = useRef([]);
  const [usages, setUsages] = useState([]);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverlayControls, setShowOverlayControls] = useState(false);
  const wasDraggingRef = useRef(false);
  const [slideOffset, setSlideOffset] = useState(0);
  const [animateSlide, setAnimateSlide] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

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
  const positionLabel =
    currentIndex >= 0 && assets.length
      ? `${currentIndex + 1} of ${assets.length}`
      : "";

  const setViewerTransform = useCallback(
    (nextZoom, nextPan = panRef.current, surface = mediaStageRef.current) => {
      const normalizedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
      const normalizedPan = constrainImagePan(
        nextPan,
        normalizedZoom,
        surface,
        asset,
      );
      zoomRef.current = normalizedZoom;
      panRef.current = normalizedPan;
      setZoom(normalizedZoom);
      setPan(normalizedPan);
    },
    [asset],
  );

  const changeZoom = useCallback(
    (nextZoom, focalPoint = null, surface = mediaStageRef.current) => {
      const currentZoom = zoomRef.current;
      let nextPan = panRef.current;
      if (focalPoint && surface && currentZoom > 0) {
        const rect = surface.getBoundingClientRect();
        const focalX = focalPoint.x - (rect.left + rect.width / 2);
        const focalY = focalPoint.y - (rect.top + rect.height / 2);
        const ratio = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM) / currentZoom;
        nextPan = {
          x: focalX - (focalX - nextPan.x) * ratio,
          y: focalY - (focalY - nextPan.y) * ratio,
        };
      }
      setViewerTransform(nextZoom, nextPan, surface);
    },
    [setViewerTransform],
  );

  const resetViewerTransform = useCallback(() => {
    zoomRef.current = 1;
    panRef.current = { x: 0, y: 0 };
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsPanning(false);
    setIsPinching(false);
    gestureRef.current = { mode: null };
  }, []);

  const clearTransitionTimers = useCallback(() => {
    transitionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    transitionTimersRef.current = [];
  }, []);

  const scheduleTransition = useCallback((callback, delay) => {
    const timer = window.setTimeout(callback, delay);
    transitionTimersRef.current.push(timer);
    return timer;
  }, []);

  useEffect(
    () => () => {
      clearTransitionTimers();
    },
    [clearTransitionTimers],
  );

  useEffect(() => {
    const neighbors = [prevAsset, nextAsset].filter(
      (item) => item?.category === "image",
    );
    neighbors.forEach((item) => {
      const url = getAssetUrl(item);
      if (url) {
        const preload = new window.Image();
        preload.src = url;
      }
    });
  }, [nextAsset, prevAsset]);

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
      clearTransitionTimers();
      setIsTransitioning(true);
      setIsDragging(false);
      setAnimateSlide(true);
      resetViewerTransform();

      // The outgoing item follows the navigation direction.
      const distance = Math.max(window.innerWidth, 640);
      const exitX = direction === "next" ? -distance : distance;
      setSlideOffset(exitX);

      scheduleTransition(() => {
        // Reposition the incoming item without a transition so it never crosses
        // the viewer from the outgoing side.
        setAnimateSlide(false);
        const entranceX = direction === "next" ? distance : -distance;
        setSlideOffset(entranceX);
        onSelectAsset?.(targetAsset);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimateSlide(true);
            setSlideOffset(0);
            scheduleTransition(() => {
              setIsTransitioning(false);
            }, SLIDE_DURATION);
          });
        });
      }, SLIDE_DURATION);
    },
    [
      clearTransitionTimers,
      isTransitioning,
      onSelectAsset,
      resetViewerTransform,
      scheduleTransition,
    ],
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isViewerControl(e.target)) return;
      if (e.key === "Escape" || e.key === "Esc") {
        if (document.fullscreenElement) {
          e.preventDefault();
          document.exitFullscreen().catch(() => {});
          return;
        }
        handleClose();
        return;
      }
      if ((e.key === "ArrowLeft" || e.key === "Left") && prevAsset) {
        e.preventDefault();
        navigateTo(prevAsset, "prev");
      }
      if ((e.key === "ArrowRight" || e.key === "Right") && nextAsset) {
        e.preventDefault();
        navigateTo(nextAsset, "next");
      }
      if (asset.category === "image" && ["+", "="].includes(e.key)) {
        e.preventDefault();
        changeZoom(zoomRef.current + 0.5);
      }
      if (asset.category === "image" && e.key === "-") {
        e.preventDefault();
        changeZoom(zoomRef.current - 0.5);
      }
      if (asset.category === "image" && e.key === "0") {
        e.preventDefault();
        resetViewerTransform();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    asset.category,
    changeZoom,
    handleClose,
    navigateTo,
    nextAsset,
    prevAsset,
    resetViewerTransform,
  ]);

  const beginSingleGesture = (point, surface) => {
    if (asset.category === "image" && zoomRef.current > MIN_ZOOM) {
      gestureRef.current = {
        mode: "pan",
        startX: point.x,
        startY: point.y,
        startPan: { ...panRef.current },
        surface,
      };
      setIsPanning(true);
      return;
    }

    gestureRef.current = {
      mode: "slide",
      startX: point.x,
      startY: point.y,
      slideOffset: 0,
    };
    setIsDragging(true);
  };

  const updateSingleGesture = (point) => {
    const gesture = gestureRef.current;
    const diffX = point.x - gesture.startX;
    const diffY = point.y - gesture.startY;

    if (gesture.mode === "pan") {
      setViewerTransform(
        zoomRef.current,
        {
          x: gesture.startPan.x + diffX,
          y: gesture.startPan.y + diffY,
        },
        gesture.surface,
      );
      return;
    }

    if (gesture.mode === "slide" && Math.abs(diffX) > Math.abs(diffY)) {
      gesture.slideOffset = diffX;
      setSlideOffset(diffX);
    }
  };

  const finishSingleGesture = () => {
    const gesture = gestureRef.current;
    gestureRef.current = { mode: null };
    if (gesture.mode === "pan") {
      setIsPanning(false);
      return;
    }
    if (gesture.mode !== "slide") return;

    setIsDragging(false);
    const offset = gesture.slideOffset || 0;
    if (Math.abs(offset) > 10) {
      wasDraggingRef.current = true;
    }
    if (offset < -60 && nextAsset) {
      navigateTo(nextAsset, "next");
    } else if (offset > 60 && prevAsset) {
      navigateTo(prevAsset, "prev");
    } else {
      setIsTransitioning(true);
      setAnimateSlide(true);
      setSlideOffset(0);
      scheduleTransition(() => setIsTransitioning(false), 200);
    }
  };

  const handleStageClick = (e) => {
    if (isViewerControl(e.target)) return;
    if (wasDraggingRef.current) {
      wasDraggingRef.current = false;
      return;
    }
    setShowFullscreenControls((prev) => !prev);
  };

  const handlePointerStart = (event) => {
    if (
      event.pointerType === "touch" ||
      event.button !== 0 ||
      isTransitioning ||
      isViewerControl(event.target)
    ) {
      return;
    }
    event.currentTarget.setPointerCapture?.(event.pointerId);
    beginSingleGesture(
      { x: event.clientX, y: event.clientY },
      event.currentTarget,
    );
  };

  const handlePointerMove = (event) => {
    if (event.pointerType === "touch" || !gestureRef.current.mode) return;
    event.preventDefault();
    updateSingleGesture({ x: event.clientX, y: event.clientY });
  };

  const handlePointerEnd = (event) => {
    if (event.pointerType === "touch") return;
    finishSingleGesture();
  };

  const handleTouchStart = (event) => {
    if (isTransitioning || isViewerControl(event.target)) return;
    if (event.touches.length >= 2 && asset.category === "image") {
      event.preventDefault();
      setAnimateSlide(false);
      setSlideOffset(0);
      requestAnimationFrame(() => setAnimateSlide(true));
      const center = touchCenter(event.touches);
      gestureRef.current = {
        mode: "pinch",
        startDistance: touchDistance(event.touches),
        startZoom: zoomRef.current,
        startPan: { ...panRef.current },
        startCenter: center,
        surface: event.currentTarget,
      };
      setIsDragging(false);
      setIsPanning(false);
      setIsPinching(true);
      return;
    }
    const touch = event.touches[0];
    if (touch) {
      beginSingleGesture(
        { x: touch.clientX, y: touch.clientY },
        event.currentTarget,
      );
    }
  };

  const handleTouchMove = (event) => {
    const gesture = gestureRef.current;
    if (gesture.mode === "pinch" && event.touches.length >= 2) {
      event.preventDefault();
      const center = touchCenter(event.touches);
      const nextZoom =
        gesture.startZoom *
        (touchDistance(event.touches) / Math.max(gesture.startDistance, 1));
      const rect = gesture.surface.getBoundingClientRect();
      const focalX = gesture.startCenter.x - (rect.left + rect.width / 2);
      const focalY = gesture.startCenter.y - (rect.top + rect.height / 2);
      const ratio = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM) / gesture.startZoom;
      setViewerTransform(
        nextZoom,
        {
          x:
            focalX - (focalX - gesture.startPan.x) * ratio +
            (center.x - gesture.startCenter.x),
          y:
            focalY - (focalY - gesture.startPan.y) * ratio +
            (center.y - gesture.startCenter.y),
        },
        gesture.surface,
      );
      return;
    }

    const touch = event.touches[0];
    if (touch && gesture.mode) {
      event.preventDefault();
      updateSingleGesture({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = (event) => {
    const gesture = gestureRef.current;
    if (gesture.mode === "pinch") {
      setIsPinching(false);
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        beginSingleGesture(
          { x: touch.clientX, y: touch.clientY },
          gesture.surface,
        );
      } else {
        gestureRef.current = { mode: null };
      }
      return;
    }
    finishSingleGesture();
  };

  useEffect(() => {
    const stage = mediaStageRef.current;
    if (!stage || asset.category !== "image") return undefined;
    const handleWheel = (event) => {
      if (isTransitioning || isViewerControl(event.target)) return;
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.002);
      changeZoom(
        zoomRef.current * factor,
        { x: event.clientX, y: event.clientY },
        stage,
      );
    };
    stage.addEventListener("wheel", handleWheel, { passive: false });
    return () => stage.removeEventListener("wheel", handleWheel);
  }, [asset.category, changeZoom, isFullscreen, isTransitioning]);

  if (!asset) return null;

  const copyUrl = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    onAction?.("copied", asset);
  };

  const zoomIn = () => changeZoom(zoomRef.current + 0.5);
  const zoomOut = () => changeZoom(zoomRef.current - 0.5);
  const toggleImageZoom = () => {
    if (asset.category !== "image") return;
    if (zoomRef.current > MIN_ZOOM) resetViewerTransform();
    else changeZoom(2);
  };

  // Pure Full Screen Mode View
  if (isFullscreen) {
    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          mediaStageRef.current = node;
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onPointerDown={handlePointerStart}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClick={handleStageClick}
        className="fixed inset-0 z-3500 flex h-screen w-screen items-center justify-center bg-black select-none touch-none cursor-pointer"
        data-scroll-ignore
      >
        {/* Fullscreen Navigation Chevrons */}
        {prevAsset && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigateTo(prevAsset, "prev");
            }}
            disabled={isTransitioning}
            className={cn(
              "absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-3 text-white backdrop-blur-md hover:bg-black/80 shadow-xl transition-all duration-300",
              showOverlayControls
                ? "opacity-100 pointer-events-auto scale-100"
                : "opacity-0 pointer-events-none scale-95",
            )}
            aria-label="Previous file"
            title="Previous file"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {nextAsset && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigateTo(nextAsset, "next");
            }}
            disabled={isTransitioning}
            className={cn(
              "absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-3 text-white backdrop-blur-md hover:bg-black/80 shadow-xl transition-all duration-300",
              showOverlayControls
                ? "opacity-100 pointer-events-auto scale-100"
                : "opacity-0 pointer-events-none scale-95",
            )}
            aria-label="Next file"
            title="Next file"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Pure Full Screen Media Display with Slide Animation */}
        <div
          className="flex h-full w-full items-center justify-center overflow-hidden"
          onDoubleClick={toggleImageZoom}
          style={{
            transform: `translateX(${slideOffset}px)`,
            transition:
              isDragging || !animateSlide
                ? "none"
                : `transform ${SLIDE_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        >
          {asset.category === "image" && publicUrl ? (
            <img
              src={publicUrl}
              alt={asset.name}
              className="h-full w-full object-contain pointer-events-none"
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                transition:
                  isPanning || isPinching ? "none" : "transform 180ms ease",
              }}
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

        {/* Top File Metadata Badge */}
        <div
          className={cn(
            "pointer-events-none absolute left-4 top-4 z-50 max-w-[calc(100%-10rem)] rounded-2xl border border-white/15 bg-black/55 px-3.5 py-2 text-white shadow-xl backdrop-blur-md transition-all duration-300",
            showOverlayControls ? "opacity-100" : "opacity-0",
          )}
        >
          <p className="truncate text-xs font-bold">{asset.name}</p>
          <p className="mt-0.5 text-[10px] font-semibold text-zinc-300">
            {[positionLabel, formatAssetBytes(asset.size)]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        {/* Bottom Zoom & Controls Bar */}
        <div
          className={cn(
            "absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-black/60 p-1 text-white shadow-xl backdrop-blur-md transition-all duration-300",
            showOverlayControls
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none",
          )}
        >
          {asset.category === "image" ? (
            <>
              <button
                type="button"
                onClick={zoomOut}
                disabled={zoom <= 1}
                className="rounded-full p-2 hover:bg-white/15 disabled:opacity-35"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={toggleImageZoom}
                className="min-w-12 rounded-full px-2 py-1.5 text-[11px] font-bold hover:bg-white/15"
                aria-label="Reset image zoom"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={zoomIn}
                disabled={zoom >= 4}
                className="rounded-full p-2 hover:bg-white/15 disabled:opacity-35"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </>
          ) : (
            positionLabel && (
              <span className="px-3 py-1.5 text-[11px] font-bold">
                {positionLabel}
              </span>
            )
          )}
        </div>

        {/* Exit Fullscreen Icon-Only Button */}
        <div
          className={cn(
            "absolute top-4 right-4 z-50 transition-all duration-300",
            showOverlayControls
              ? "opacity-100 pointer-events-auto scale-100"
              : "opacity-0 pointer-events-none scale-95",
          )}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="rounded-full border border-white/20 bg-black/60 p-3 text-white backdrop-blur-md hover:bg-black/80 shadow-xl transition-all"
            title="Exit Fullscreen (Esc)"
            aria-label="Exit Fullscreen"
          >
            <Minimize2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  // Normal Lightbox Mode View
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-9990 flex flex-col bg-zinc-950/95 text-white backdrop-blur-xl transition-all select-none"
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
              {positionLabel ? ` · ${positionLabel}` : ""}
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
                <span className="hidden sm:inline">Options</span>
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
                  onSelect={() => onAction?.("copy", asset)}
                  className="gap-2.5 py-2 font-semibold"
                >
                  <Copy className="h-4 w-4 text-blue-500" /> Copy file
                </DropdownMenuItem>
              )}
              {canManage && asset.status === "active" && (
                <DropdownMenuItem
                  onSelect={() => onAction?.("cut", asset)}
                  className="gap-2.5 py-2 font-semibold"
                >
                  <Scissors className="h-4 w-4 text-violet-500" /> Cut file
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
            onClick={(e) => {
              e.stopPropagation();
              navigateTo(prevAsset, "prev");
            }}
            disabled={isTransitioning}
            className={cn(
              "absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-zinc-800 bg-zinc-900/80 p-3 text-zinc-300 backdrop-blur-md hover:bg-zinc-800 hover:text-white shadow-xl transition-all duration-300 disabled:opacity-40",
              showOverlayControls
                ? "opacity-100 pointer-events-auto scale-100"
                : "opacity-0 pointer-events-none scale-95",
            )}
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
            onClick={(e) => {
              e.stopPropagation();
              navigateTo(nextAsset, "next");
            }}
            disabled={isTransitioning}
            className={cn(
              "absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-zinc-800 bg-zinc-900/80 p-3 text-zinc-300 backdrop-blur-md hover:bg-zinc-800 hover:text-white shadow-xl transition-all duration-300 disabled:opacity-40",
              showInfo && "sm:right-84",
              showOverlayControls
                ? "opacity-100 pointer-events-auto scale-100"
                : "opacity-0 pointer-events-none scale-95",
            )}
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
          onTouchCancel={handleTouchEnd}
          onPointerDown={handlePointerStart}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onClick={handleStageClick}
          ref={mediaStageRef}
          className={cn(
            "relative flex flex-1 items-center justify-center p-4 sm:p-8 min-w-0 min-h-0 touch-none overflow-hidden cursor-pointer",
            zoom > MIN_ZOOM
              ? "cursor-grab active:cursor-grabbing"
              : "cursor-ew-resize",
          )}
        >
          <div
            className="flex items-center justify-center max-h-full max-w-full"
            onDoubleClick={toggleImageZoom}
            style={{
              transform: `translateX(${slideOffset}px)`,
              transition:
                isDragging || !animateSlide
                  ? "none"
                  : `transform ${SLIDE_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
          >
            {asset.category === "image" && publicUrl ? (
              <img
                src={publicUrl}
                alt={asset.name}
                className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl transition-all pointer-events-none"
                style={{
                  transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                  transition:
                    isPanning || isPinching ? "none" : "transform 180ms ease",
                }}
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
                  <p className="text-base font-black text-white">
                    {asset.name}
                  </p>
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

          <div
            className={cn(
              "absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-zinc-700/80 bg-zinc-900/85 p-1 shadow-2xl backdrop-blur-md transition-all duration-300 sm:bottom-5",
              showOverlayControls
                ? "opacity-100 pointer-events-auto scale-100"
                : "opacity-0 pointer-events-none scale-95",
            )}
          >
            {asset.category === "image" && (
              <>
                <button
                  type="button"
                  onClick={zoomOut}
                  disabled={zoom <= 1}
                  className="rounded-full p-2 text-zinc-200 hover:bg-zinc-700 disabled:opacity-35"
                  aria-label="Zoom out"
                  title="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={toggleImageZoom}
                  className="min-w-12 rounded-full px-2 py-1.5 text-[11px] font-bold text-white hover:bg-zinc-700"
                  aria-label="Reset image zoom"
                  title="Double-click image to toggle zoom"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={zoomIn}
                  disabled={zoom >= 4}
                  className="rounded-full p-2 text-zinc-200 hover:bg-zinc-700 disabled:opacity-35"
                  aria-label="Zoom in"
                  title="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </>
            )}
            {positionLabel && (
              <span className="border-l border-zinc-700 px-3 py-1.5 text-[11px] font-bold text-zinc-300 first:border-l-0">
                {positionLabel}
              </span>
            )}
          </div>
        </div>

        {/* Sliding Details Drawer */}
        {showInfo && (
          <aside className="absolute inset-y-0 right-0 z-30 w-full max-w-80 shrink-0 overflow-y-auto border-l border-zinc-800/80 bg-zinc-900/95 p-5 shadow-2xl backdrop-blur-md transition-all sm:static sm:shadow-none">
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
