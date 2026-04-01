import { useEffect, useRef, useState } from "react";
import { useScript } from "@/hooks/use-script";
import { formatTime } from "@/lib/utils";
import { Play, Pause, SkipBack, SkipForward, Music } from "lucide-react";
import { useListSongs } from "@workspace/api-client-react";

declare global {
  interface Window {
    SC: any;
  }
}

export function MusicPlayer() {
  const { data: songs, isLoading, error } = useListSongs();
  const scriptStatus = useScript("https://w.soundcloud.com/player/api.js");

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<any>(null);
  const initializedRef = useRef(false);

  const [shuffled, setShuffled] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);

  useEffect(() => {
    if (songs && songs.length > 0 && shuffled.length === 0) {
      const copy = [...songs].sort(() => Math.random() - 0.5);
      setShuffled(copy);
      setCurrentIndex(0);
    }
  }, [songs]);

  const currentSong = shuffled[currentIndex];

  const loadSong = (index: number, songList: any[]) => {
    const song = songList[index];
    if (!song || !widgetRef.current) return;
    setIsReady(false);
    setPosition(0);
    setDuration(0);
    setArtworkUrl(null);
    widgetRef.current.load(song.soundcloudUrl, { auto_play: true });
  };

  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % shuffled.length;
    setCurrentIndex(nextIndex);
    loadSong(nextIndex, shuffled);
  };

  const goToPrev = () => {
    const prevIndex = (currentIndex - 1 + shuffled.length) % shuffled.length;
    setCurrentIndex(prevIndex);
    loadSong(prevIndex, shuffled);
  };

  useEffect(() => {
    if (scriptStatus !== "ready" || !currentSong || !iframeRef.current || initializedRef.current) return;

    try {
      const widget = window.SC.Widget(iframeRef.current);
      widgetRef.current = widget;
      initializedRef.current = true;

      widget.bind(window.SC.Widget.Events.READY, () => {
        setIsReady(true);
        widget.setVolume(80);
        widget.play();
        widget.getCurrentSound((soundInfo: any) => {
          if (soundInfo?.artwork_url) {
            setArtworkUrl(soundInfo.artwork_url.replace("-large", "-t200x200"));
          }
        });
      });

      widget.bind(window.SC.Widget.Events.PLAY, () => {
        setIsReady(true);
        setIsPlaying(true);
        widget.getCurrentSound((soundInfo: any) => {
          if (soundInfo?.artwork_url) {
            setArtworkUrl(soundInfo.artwork_url.replace("-large", "-t200x200"));
          }
        });
      });

      widget.bind(window.SC.Widget.Events.PAUSE, () => setIsPlaying(false));

      widget.bind(window.SC.Widget.Events.FINISH, () => {
        setIsPlaying(false);
        setPosition(0);
        setShuffled((prev) => {
          const nextIndex = (currentIndex + 1) % prev.length;
          setCurrentIndex(nextIndex);
          loadSong(nextIndex, prev);
          return prev;
        });
      });

      widget.bind(window.SC.Widget.Events.PLAY_PROGRESS, (e: any) => {
        setPosition(e.currentPosition);
        if (e.relativePosition > 0) {
          setDuration(e.currentPosition / e.relativePosition);
        }
      });
    } catch (err) {
      console.error("Error initializing SoundCloud widget:", err);
    }
  }, [scriptStatus, currentSong]);

  const togglePlay = () => {
    if (!widgetRef.current || !isReady) return;
    isPlaying ? widgetRef.current.pause() : widgetRef.current.play();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!widgetRef.current || !isReady) return;
    const newPos = Number(e.target.value);
    widgetRef.current.seekTo(newPos);
    setPosition(newPos);
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white/5 border border-primary/25 rounded-2xl p-4 md:p-5 backdrop-blur-md mt-2 flex flex-col gap-3.5 items-center justify-center min-h-[160px]">
        <p className="text-xs text-[#d8b4fe]/50 italic animate-blink">loading music...</p>
      </div>
    );
  }

  if (error || (shuffled.length === 0 && !isLoading)) return null;

  const progressPct = duration > 0 ? (position / duration) * 100 : 0;
  const displaySong = currentSong ?? shuffled[0];

  return (
    <div className="w-full bg-white/5 border border-primary/25 rounded-2xl p-4 md:p-5 backdrop-blur-md mt-2 flex flex-col gap-3.5 relative overflow-hidden">

      <iframe
        ref={iframeRef}
        src={shuffled[0] ? `https://w.soundcloud.com/player/?url=${encodeURIComponent(shuffled[0].soundcloudUrl)}&color=%23000000&auto_play=true&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true` : undefined}
        style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px" }}
        allow="autoplay"
        title="SoundCloud player"
      />

      {displaySong && (
        <>
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#1a1a2e] to-[#2d1b69] flex-shrink-0 overflow-hidden flex items-center justify-center">
              {artworkUrl ? (
                <img src={artworkUrl} alt="Album art" className="w-full h-full object-cover" onError={() => setArtworkUrl(null)} />
              ) : (
                <Music className="w-6 h-6 text-primary/40" />
              )}
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-sm font-semibold text-slate-200 whitespace-nowrap overflow-hidden text-ellipsis">
                {displaySong.title}
              </span>
              <span className="text-xs text-[#d8b4fe]/55 whitespace-nowrap overflow-hidden text-ellipsis">
                {displaySong.artist}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[0.65rem] text-[#d8b4fe]/50 flex-shrink-0 min-w-[28px] tabular-nums">{formatTime(position)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={position}
              onChange={handleSeek}
              disabled={!isReady}
              className="player-seek"
              style={{ "--seek-pct": `${progressPct}%` } as React.CSSProperties}
              aria-label="Seek"
            />
            <span className="text-[0.65rem] text-[#d8b4fe]/50 flex-shrink-0 min-w-[28px] tabular-nums text-right">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={goToPrev}
              disabled={shuffled.length < 2}
              className="text-[#d8b4fe]/70 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none p-1"
              aria-label="Previous song"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              disabled={!isReady}
              className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#9333ea] to-[#a855f7] flex items-center justify-center text-white flex-shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(147,51,234,0.6),0_0_40px_rgba(168,85,247,0.25)] hover:shadow-[0_0_30px_rgba(147,51,234,0.9),0_0_60px_rgba(168,85,247,0.4)]"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
            </button>

            <button
              onClick={goToNext}
              disabled={shuffled.length < 2}
              className="text-[#d8b4fe]/70 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none p-1"
              aria-label="Next song"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>

          {!isReady && (
            <p className="text-[0.7rem] text-[#d8b4fe]/50 text-center italic animate-blink mt-1">connecting player...</p>
          )}
        </>
      )}
    </div>
  );
}
