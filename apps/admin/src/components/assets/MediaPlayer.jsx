"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AudioLines,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2];

function formatTime(value) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const total = Math.floor(value);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}`
    : `${minutes}:${seconds}`;
}

export default function MediaPlayer({
  src,
  type = "video",
  title = "Media",
  autoPlay = false,
  fill = false,
  className,
}) {
  const rootRef = useRef(null);
  const mediaRef = useRef(null);
  const hideTimerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState("");
  const isVideo = type === "video";

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
  }, []);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    clearHideTimer();
    if (isVideo && mediaRef.current && !mediaRef.current.paused) {
      hideTimerRef.current = window.setTimeout(
        () => setControlsVisible(false),
        2600,
      );
    }
  }, [clearHideTimer, isVideo]);

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement;
      setIsFullscreen(
        Boolean(
          fullscreenElement &&
            (fullscreenElement === rootRef.current ||
              fullscreenElement.contains(rootRef.current)),
        ),
      );
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const togglePlayback = useCallback(() => {
    const media = mediaRef.current;
    if (!media) return;
    if (media.paused) media.play().catch(() => setError("Playback could not start."));
    else media.pause();
  }, []);

  const seekBy = useCallback((seconds) => {
    const media = mediaRef.current;
    if (!media || !Number.isFinite(media.duration)) return;
    media.currentTime = Math.min(
      media.duration,
      Math.max(0, media.currentTime + seconds),
    );
    setCurrentTime(media.currentTime);
  }, []);

  const toggleMute = useCallback(() => {
    const media = mediaRef.current;
    if (!media) return;
    media.muted = !media.muted;
    setMuted(media.muted);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await rootRef.current?.requestFullscreen?.();
    } catch {
      setError("Full screen is not available in this browser.");
    }
  }, []);

  const handleKeyboard = (event) => {
    if (["INPUT", "SELECT", "BUTTON"].includes(event.target.tagName)) return;
    const key = event.key.toLowerCase();
    if ([" ", "k"].includes(key)) {
      event.preventDefault();
      togglePlayback();
    } else if (key === "arrowleft" || key === "j") {
      event.preventDefault();
      seekBy(-10);
    } else if (key === "arrowright" || key === "l") {
      event.preventDefault();
      seekBy(10);
    } else if (key === "m") {
      event.preventDefault();
      toggleMute();
    } else if (key === "f") {
      event.preventDefault();
      toggleFullscreen();
    }
  };

  const progress = duration ? Math.min(100, (currentTime / duration) * 100) : 0;
  const volumeProgress = muted ? 0 : volume * 100;

  const controls = (
    <div
      className={cn(
        "flex w-full flex-col gap-2.5",
        isVideo &&
          "absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-black/95 via-black/70 to-transparent px-3 pb-3 pt-12 transition-opacity sm:px-5 sm:pb-4",
        isVideo && !controlsVisible && playing && "pointer-events-none opacity-0",
      )}
    >
      <input
        type="range"
        min="0"
        max={duration || 0}
        step="0.01"
        value={Math.min(currentTime, duration || 0)}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (mediaRef.current) mediaRef.current.currentTime = next;
          setCurrentTime(next);
        }}
        aria-label="Seek through media"
        className="h-1.5 w-full cursor-pointer accent-blue-500"
        style={{
          background: `linear-gradient(to right, rgb(59 130 246) ${progress}%, rgb(113 113 122 / 0.65) ${progress}%)`,
        }}
      />

      <div className="flex min-w-0 items-center gap-1 text-white sm:gap-2">
        <button
          type="button"
          onClick={togglePlayback}
          className="rounded-full p-2 transition hover:bg-white/15"
          aria-label={playing ? "Pause" : "Play"}
          title={playing ? "Pause (Space)" : "Play (Space)"}
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
        </button>
        <button
          type="button"
          onClick={() => seekBy(-10)}
          className="hidden rounded-full p-2 transition hover:bg-white/15 xs:block"
          aria-label="Go back 10 seconds"
          title="Back 10 seconds (Left arrow)"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => seekBy(10)}
          className="hidden rounded-full p-2 transition hover:bg-white/15 xs:block"
          aria-label="Go forward 10 seconds"
          title="Forward 10 seconds (Right arrow)"
        >
          <RotateCw className="h-4 w-4" />
        </button>

        <span className="shrink-0 text-[11px] font-semibold tabular-nums text-zinc-200 sm:text-xs">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={toggleMute}
            className="rounded-full p-2 transition hover:bg-white/15"
            aria-label={muted ? "Unmute" : "Mute"}
            title={muted ? "Unmute (M)" : "Mute (M)"}
          >
            {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={muted ? 0 : volume}
            onChange={(event) => {
              const next = Number(event.target.value);
              const media = mediaRef.current;
              if (!media) return;
              media.volume = next;
              media.muted = false;
              setVolume(next);
              setMuted(false);
            }}
            aria-label="Volume"
            className="hidden h-1 w-16 cursor-pointer accent-blue-500 sm:block lg:w-20"
            style={{
              background: `linear-gradient(to right, rgb(59 130 246) ${volumeProgress}%, rgb(113 113 122 / 0.65) ${volumeProgress}%)`,
            }}
          />
          <select
            value={playbackRate}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (mediaRef.current) mediaRef.current.playbackRate = next;
              setPlaybackRate(next);
            }}
            aria-label="Playback speed"
            title="Playback speed"
            className="cursor-pointer rounded-lg border-0 bg-white/10 px-1.5 py-1.5 text-[11px] font-bold text-white outline-none hover:bg-white/15"
          >
            {PLAYBACK_RATES.map((rate) => (
              <option key={rate} value={rate} className="bg-zinc-900 text-white">
                {rate}x
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-full p-2 transition hover:bg-white/15"
            aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
            title={isFullscreen ? "Exit full screen (F)" : "Full screen (F)"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={rootRef}
      data-media-player
      tabIndex={0}
      onKeyDown={handleKeyboard}
      onMouseMove={revealControls}
      onMouseLeave={() => isVideo && playing && setControlsVisible(false)}
      className={cn(
        "relative isolate overflow-hidden bg-zinc-950 shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        isVideo
          ? fill
            ? "h-full w-full"
            : "h-full w-full max-w-6xl rounded-2xl"
          : "flex w-full max-w-2xl flex-col items-center gap-6 rounded-3xl border border-zinc-800/80 p-8 sm:p-12",
        className,
      )}
      aria-label={`${type} player for ${title}`}
    >
      {isVideo ? (
        <>
          <video
            ref={mediaRef}
            src={src}
            autoPlay={autoPlay}
            playsInline
            preload="metadata"
            onClick={togglePlayback}
            onDoubleClick={toggleFullscreen}
            onLoadedMetadata={(event) => {
              setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0);
              setVolume(event.currentTarget.volume);
            }}
            onDurationChange={(event) =>
              setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)
            }
            onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
            onPlay={() => {
              setPlaying(true);
              setError("");
              revealControls();
            }}
            onPause={() => {
              setPlaying(false);
              setControlsVisible(true);
              clearHideTimer();
            }}
            onVolumeChange={(event) => {
              setVolume(event.currentTarget.volume);
              setMuted(event.currentTarget.muted);
            }}
            onRateChange={(event) => setPlaybackRate(event.currentTarget.playbackRate)}
            onError={() => setError("This video cannot be played by your browser.")}
            className="h-full w-full bg-black object-contain"
          />
          {!playing && !error && (
            <button
              type="button"
              onClick={togglePlayback}
              className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-2xl backdrop-blur-md transition hover:scale-105 hover:bg-blue-600 sm:h-20 sm:w-20"
              aria-label="Play video"
            >
              <Play className="ml-1 h-7 w-7 fill-current sm:h-9 sm:w-9" />
            </button>
          )}
          {controls}
        </>
      ) : (
        <>
          <div className="flex h-32 w-32 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 sm:h-44 sm:w-44">
            <AudioLines className={cn("h-16 w-16 text-blue-400 sm:h-20 sm:w-20", playing && "animate-pulse")} />
          </div>
          <div className="w-full text-center text-white">
            <p className="truncate text-sm font-black">{title}</p>
            <p className="mt-1 text-xs font-medium text-zinc-400">Audio player</p>
          </div>
          <audio
            ref={mediaRef}
            src={src}
            autoPlay={autoPlay}
            preload="metadata"
            onLoadedMetadata={(event) => {
              setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0);
              setVolume(event.currentTarget.volume);
            }}
            onDurationChange={(event) =>
              setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)
            }
            onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
            onPlay={() => {
              setPlaying(true);
              setError("");
            }}
            onPause={() => setPlaying(false)}
            onVolumeChange={(event) => {
              setVolume(event.currentTarget.volume);
              setMuted(event.currentTarget.muted);
            }}
            onRateChange={(event) => setPlaybackRate(event.currentTarget.playbackRate)}
            onError={() => setError("This audio file cannot be played by your browser.")}
          />
          {controls}
        </>
      )}

      {error && (
        <p className={cn("z-30 rounded-xl bg-rose-500/15 px-3 py-2 text-center text-xs font-semibold text-rose-200", isVideo && "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2")}>
          {error}
        </p>
      )}
    </div>
  );
}
