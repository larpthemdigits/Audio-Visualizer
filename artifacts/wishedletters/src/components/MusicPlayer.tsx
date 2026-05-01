import { useEffect, useRef, useState } from "react";
import { useScript } from "@/hooks/use-script";
import { SkipBack, SkipForward, Music } from "lucide-react";
import { useListSongs } from "@workspace/api-client-react";

declare global {
  interface Window {
    SC: any;
  }
}

type Song = {
  id: number;
  title: string;
  artist: string;
  soundcloudUrl: string;
  sortOrder: number;
};

function buildSrc(url: string) {
  // Handle both raw track URLs and embed URLs
  let trackUrl = url;
  if (url.includes("w.soundcloud.com/player")) {
    try {
      const params = new URLSearchParams(url.split("?")[1]);
      trackUrl = decodeURIComponent(params.get("url") ?? url);
    } catch {}
  }
  return (
    "https://w.soundcloud.com/player/" +
    `?url=${encodeURIComponent(trackUrl)}` +
    `&color=%239333ea` +
    `&auto_play=true` +
    `&hide_related=true` +
    `&show_comments=false` +
    `&show_user=false` +
    `&show_reposts=false` +
    `&show_teaser=false` +
    `&visual=false`
  );
}

export function MusicPlayer() {
  const { data: songs, isLoading, error } = useListSongs();
  const scriptStatus = useScript("https://w.soundcloud.com/player/api.js");

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<any>(null);
  const indexRef = useRef(0);
  const shuffledRef = useRef<Song[]>([]);

  const [shuffled, setShuffled] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [iframeSrc, setIframeSrc] = useState("");
  const [iframeKey, setIframeKey] = useState(0);
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);
  const [widgetReady, setWidgetReady] = useState(false);

  // Shuffle once on load
  useEffect(() => {
    if (!songs || songs.length === 0 || shuffled.length > 0) return;
    const copy = [...songs].sort(() => Math.random() - 0.5) as Song[];
    shuffledRef.current = copy;
    setShuffled(copy);
    setIframeSrc(buildSrc(copy[0].soundcloudUrl));
  }, [songs, shuffled.length]);

  // Re-bind SC widget after each iframe remount
  useEffect(() => {
    if (scriptStatus !== "ready" || !iframeSrc || !iframeRef.current) return;

    const widget = window.SC.Widget(iframeRef.current);
    widgetRef.current = widget;

    const onReady = () => {
      setWidgetReady(true);
      widget.setVolume(80);
      widget.getCurrentSound((s: any) => {
        if (s?.artwork_url) {
          setArtworkUrl(s.artwork_url.replace("-large", "-t200x200"));
        }
      });
    };

    const onPlay = () => {
      setWidgetReady(true);
      widget.getCurrentSound((s: any) => {
        if (s?.artwork_url) {
          setArtworkUrl(s.artwork_url.replace("-large", "-t200x200"));
        }
      });
    };

    const onFinish = () => {
      const next = (indexRef.current + 1) % shuffledRef.current.length;
      switchToIndex(next);
    };

    widget.bind(window.SC.Widget.Events.READY, onReady);
    widget.bind(window.SC.Widget.Events.PLAY, onPlay);
    widget.bind(window.SC.Widget.Events.FINISH, onFinish);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptStatus, iframeKey]);

  const switchToIndex = (idx: number) => {
    const song = shuffledRef.current[idx];
    if (!song) return;
    indexRef.current = idx;
    setCurrentIndex(idx);
    setArtworkUrl(null);
    setWidgetReady(false);
    setIframeSrc(buildSrc(song.soundcloudUrl));
    setIframeKey((k) => k + 1);
  };

  const goToNext = () =>
    switchToIndex((indexRef.current + 1) % shuffledRef.current.length);
  const goToPrev = () =>
    switchToIndex(
      (indexRef.current - 1 + shuffledRef.current.length) %
        shuffledRef.current.length
    );

  if (isLoading) {
    return (
      <div className="w-full bg-white/5 border border-primary/25 rounded-2xl p-4 md:p-5 backdrop-blur-md mt-2 flex items-center justify-center min-h-[100px]">
        <p className="text-xs text-[#d8b4fe]/50 italic animate-blink">
          loading music...
        </p>
      </div>
    );
  }

  if (error || shuffled.length === 0) return null;

  const currentSong = shuffled[currentIndex];

  return (
    <div className="w-full bg-white/5 border border-primary/25 rounded-2xl backdrop-blur-md mt-2 overflow-hidden">
      {/* Top section: artwork + title + controls */}
      <div className="flex items-center gap-3.5 p-4 pb-3">
        {/* Artwork */}
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1a1a2e] to-[#2d1b69] flex-shrink-0 overflow-hidden flex items-center justify-center">
          {artworkUrl ? (
            <img
              src={artworkUrl}
              alt="Album art"
              className="w-full h-full object-cover"
              onError={() => setArtworkUrl(null)}
            />
          ) : (
            <Music className="w-5 h-5 text-primary/40" />
          )}
        </div>

        {/* Title / artist */}
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <span className="text-sm font-semibold text-slate-200 whitespace-nowrap overflow-hidden text-ellipsis">
            {currentSong.title}
          </span>
          <span className="text-xs text-[#d8b4fe]/55 whitespace-nowrap overflow-hidden text-ellipsis">
            {currentSong.artist}
          </span>
        </div>

        {/* Prev / Next */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={goToPrev}
            disabled={shuffled.length < 2}
            className="text-[#d8b4fe]/70 hover:text-white transition-all duration-200 active:scale-90 disabled:opacity-30 disabled:pointer-events-none p-1"
            aria-label="Previous song"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button
            onClick={goToNext}
            disabled={shuffled.length < 2}
            className="text-[#d8b4fe]/70 hover:text-white transition-all duration-200 active:scale-90 disabled:opacity-30 disabled:pointer-events-none p-1"
            aria-label="Next song"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>

      {/*
        The SoundCloud iframe is VISIBLE here — this is intentional.
        Hidden/off-screen iframes are throttled or blocked by iOS Safari,
        which prevents the READY event from firing and audio from playing.
        The iframe renders as a thin native SC player strip at the bottom
        of the card. It handles its own play/pause/progress controls.
      */}
      {iframeSrc && (
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={iframeSrc}
          width="100%"
          height="80"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          title="SoundCloud player"
          style={{ display: "block" }}
        />
      )}
    </div>
  );
}
