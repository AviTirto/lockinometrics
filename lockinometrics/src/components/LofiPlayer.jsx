import { useState, useRef } from "react";

export default function LofiPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 rounded-2xl shadow-lg border border-teal-500/30 p-4 z-50">
      <audio
        ref={audioRef}
        loop
        src="https://www.bensound.com/bensound-music/bensound-memories.mp3"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 flex items-center justify-center text-white transition-all transform hover:scale-105 shadow-md"
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-300 mb-1">🎹 Classical Piano</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 h-2 bg-gradient-to-r from-teal-900 to-cyan-900 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #14b8a6 ${volume * 100}%, #1e293b ${volume * 100}%)`,
            }}
          />
        </div>

        {/* Animated music note */}
        {isPlaying && (
          <div className="animate-bounce text-lg">🎶</div>
        )}
      </div>
    </div>
  );
}
