import { useState, useRef } from "react";
import { PlayIcon, PauseIcon, RotateCcwIcon } from "lucide-react";

export default function MusicPlayButton() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  const rewindToStart = () => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = 0; // go back to start

    // Optional: auto-play after reset
    audioRef.current.play();
    setIsPlaying(true);
  };

  return (
    <div className="flex gap-2 fixed right-3 top-10 z-10">
      {/* Hidden audio element */}
      <audio ref={audioRef} src="/readme/audio/FNAF 2_ The Puppet music box.mp3" loop />

      <button
        onClick={togglePlay}
        title={isPlaying ? "Pause" : "Play"}
        className="p-2 text-white bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition"
      >
        {isPlaying ? <PauseIcon size={15} /> : <PlayIcon size={15} />}
      </button>

      <button
        onClick={rewindToStart}
        title="Rewind"
        className="p-2 text-white bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition"
      >
        <RotateCcwIcon size={15} />
      </button>
    </div>
  );
}
