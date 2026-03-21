"use client"
// components/social/audio-player.tsx
import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react"

interface AudioPlayerProps {
  src: string
  className?: string
}

export function AudioPlayer({ src, className = "" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onLoadedMetadata = () => {
      setDuration(audio.duration)
      setLoading(false)
    }
    const onTimeUpdate = () => setProgress(audio.currentTime)
    const onEnded = () => setIsPlaying(false)

    audio.addEventListener("loadedmetadata", onLoadedMetadata)
    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("ended", onEnded)

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("ended", onEnded)
    }
  }, [src])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setProgress(time)
    }
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className={`flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm ${className}`}>
      <audio ref={audioRef} src={src} muted={isMuted} className="hidden" />
      
      <button 
        onClick={togglePlay}
        disabled={loading}
        className="w-10 h-10 flex items-center justify-center bg-brand text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : 
         isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
      </button>
      
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center justify-between text-[10px] font-bold text-text-muted px-1 uppercase tracking-wider">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="relative group h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-brand transition-all duration-100" 
            style={{ width: `${(progress / duration) * 100 || 0}%` }}
          />
          <input 
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={progress}
            onChange={handleSeek}
            className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
          />
        </div>
      </div>
      
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="p-2 text-white/50 hover:text-white transition-colors"
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
    </div>
  )
}
