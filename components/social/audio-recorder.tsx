"use client"
// components/social/audio-recorder.tsx
import { useState, useRef, useEffect } from "react"
import { Mic, Square, Trash2, Check, Loader2, Play, Pause } from "lucide-react"

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void
  onCancel: () => void
}

export function AudioRecorder({ onRecordingComplete, onCancel }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (err) {
      console.error("Error accessing microphone:", err)
      alert("Não foi possível acessar o microfone.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleConfirm = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, recordingTime)
    }
  }

  const togglePlay = () => {
    if (!audioRef.current || !audioBlob) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      const url = URL.createObjectURL(audioBlob)
      audioRef.current.src = url
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="flex items-center gap-3 bg-bg-overlay border border-bg-border rounded-full px-4 py-2 animate-scale-in">
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
      
      {!audioBlob ? (
        <>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full bg-red-500 ${isRecording ? "animate-pulse" : ""}`} />
            <span className="text-sm font-mono tabular-nums text-text-primary">{formatTime(recordingTime)}</span>
          </div>
          
          <div className="h-4 w-[1px] bg-bg-border mx-1" />
          
          {isRecording ? (
            <button onClick={stopRecording} className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors">
              <Square size={16} fill="currentColor" />
            </button>
          ) : (
            <button onClick={startRecording} className="p-2 bg-brand/10 text-brand rounded-full hover:bg-brand/20 transition-colors">
              <Mic size={16} />
            </button>
          )}
          
          <button onClick={onCancel} className="p-2 text-text-muted hover:text-text-primary transition-colors">
            <Trash2 size={16} />
          </button>
        </>
      ) : (
        <>
          <button onClick={togglePlay} className="p-2 bg-brand text-white rounded-full hover:bg-brand-dim transition-colors">
            {isPlaying ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
          </button>
          
          <span className="text-sm font-medium text-text-primary">Voz ({formatTime(recordingTime)})</span>
          
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={() => setAudioBlob(null)} className="p-2 text-text-muted hover:text-red-500 transition-colors">
              <Trash2 size={16} />
            </button>
            <button onClick={handleConfirm} className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors">
              <Check size={16} strokeWidth={3} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
