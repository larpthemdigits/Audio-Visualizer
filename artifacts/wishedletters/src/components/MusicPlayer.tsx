import { useEffect, useRef, useState } from "react";
import { useScript } from "@/hooks/use-script";
import { formatTime } from "@/lib/utils";
import { Play, Pause, SkipBack, SkipForward, Music } from "lucide-react";
import { useGetRandomSong } from "@workspace/api-client-react";

// Add TypeScript declaration for SoundCloud Widget API
declare global {
  interface Window {
    SC: any;
  }
}

export function MusicPlayer() {
  const { data: song, isLoading, error } = useGetRandomSong();
  const scriptStatus = useScript("https://w.soundcloud.com/player/api.js");
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<any>(null);
  
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);

  useEffect(() => {
    if (scriptStatus !== "ready" || !song || !iframeRef.current) return;

    try {
      const widget = window.SC.Widget(iframeRef.current);
      widgetRef.current = widget;

      widget.bind(window.SC.Widget.Events.READY, () => {
        setIsReady(true);
        widget.setVolume(80);
        widget.play();

        widget.getCurrentSound((soundInfo: any) => {
          if (soundInfo && soundInfo.artwork_url) {
            setArtworkUrl(soundInfo.artwork_url.replace('-large', '-t200x200'));
          }
        });
      });

      widget.bind(window.SC.Widget.Events.PLAY, () => setIsPlaying(true));
      widget.bind(window.SC.Widget.Events.PAUSE, () => setIsPlaying(false));
      widget.bind(window.SC.Widget.Events.FINISH, () => {
        setIsPlaying(false);
        setPosition(0);
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

    return () => {
      if (widgetRef.current) {
        widgetRef.current.unbind(window.SC.Widget.Events.READY);
        widgetRef.current.unbind(window.SC.Widget.Events.PLAY);
        widgetRef.current.unbind(window.SC.Widget.Events.PAUSE);
        widgetRef.current.unbind(window.SC.Widget.Events.FINISH);
        widgetRef.current.unbind(window.SC.Widget.Events.PLAY_PROGRESS);
      }
    };
  }, [scriptStatus, song]);

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

  const skipBack = () => {
    if (!widgetRef.current || !isReady) return;
    widgetRef.current.getPosition((pos: number) => {
      widgetRef.current.seekTo(Math.max(0, pos - 10000));
    });
  };

  const skipForward = () => {
    if (!widgetRef.current || !isReady) return;
    widgetRef.current.getPosition((pos: number) => {
      widgetRef.current.seekTo(Math.min(duration, pos + 10000));
    });
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white/5 border border-primary/25 rounded-2xl p-4 md:p-5 backdrop-blur-md mt-2 flex flex-col gap-3.5 items-center justify-center min-h-[160px]">
        <p className="text-xs text-[#d8b4fe]/50 italic animate-blink">loading music...</p>
      </div>
    );
  }

  if (error || !song) {
    return null; // Fail gracefully if no music is configured
  }

  const progressPct = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <div className="w-full bg-white/5 border border-primary/25 rounded-2xl p-4 md:p-5 backdrop-blur-md mt-2 flex flex-col gap-3.5 relative overflow-hidden">
      
      {/* Hidden iframe */}
      <iframe
        ref={iframeRef}
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(song.soundcloudUrl)}&color=%23000000&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
        allow="autoplay"
        title="SoundCloud player"
      />

      {/* Top row: artwork + track info */}
      <div className="flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#1a1a2e] to-[#2d1b69] flex-shrink-0 overflow-hidden flex items-center justify-center">
          {artworkUrl ? (
            <img 
              src={artworkUrl} 
              alt="Album art" 
              className="w-full h-full object-cover"
              onError={() => setArtworkUrl(null)}
            />
          ) : (
            <Music className="w-6 h-6 text-primary/40" />
          )}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-sm font-semibold text-slate-200 whitespace-nowrap overflow-hidden text-ellipsis">
            {song.title}
          </span>
          <span className="text-xs text-[#d8b4fe]/55 whitespace-nowrap overflow-hidden text-ellipsis">
            {song.artist}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <span className="text-[0.65rem] text-[#d8b4fe]/50 flex-shrink-0 min-w-[28px] tabular-nums">
          {formatTime(position)}
        </span>
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={position}
          onChange={handleSeek}
          disabled={!isReady}
          className="player-seek"
          style={{ '--seek-pct': `${progressPct}%` } as React.CSSProperties}
          aria-label="Seek"
        />
        <span className="text-[0.65rem] text-[#d8b4fe]/50 flex-shrink-0 min-w-[28px] tabular-nums text-right">
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <button 
          onClick={skipBack}
          disabled={!isReady}
          className="text-[#d8b4fe]/70 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none p-1"
          aria-label="Skip back"
        >
          <SkipBack className="w-5 h-5 fill-current" />
        </button>

        <button 
          onClick={togglePlay}
          disabled={!isReady}
          className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#9333ea] to-[#a855f7] flex items-center justify-center text-white flex-shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(147,51,234,0.6),0_0_40px_rgba(168,85,247,0.25)] hover:shadow-[0_0_30px_rgba(147,51,234,0.9),0_0_60px_rgba(168,85,247,0.4)]"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-1" />
          )}
        </button>

        <button 
          onClick={skipForward}
          disabled={!isReady}
          className="text-[#d8b4fe]/70 hover:text-white transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none p-1"
          aria-label="Skip forward"
        >
          <SkipForward className="w-5 h-5 fill-current" />
        </button>
      </div>
      
      {!isReady && (
        <p className="text-[0.7rem] text-[#d8b4fe]/50 text-center italic animate-blink mt-1">
          connecting player...
        </p>
      )}
    </div>
  );
}
