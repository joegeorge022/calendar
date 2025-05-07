"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  Menu,
  Pause,
  Sparkles,
  X,
  Play,
  Music,
} from "lucide-react"
import { useCalendar } from "@/lib/CalendarContext"
import { formatMonthDay, getToday, getPrevWeek, getNextWeek } from "@/lib/dateUtils"
import { getCurrentSong, SongInfo, getRandomSongExcept, getSongById } from "@/lib/musicUtils"

import WeekView from "./components/WeekView"
import DayView from "./components/DayView"
import MonthView from "./components/MonthView"
import MiniCalendar from "./components/MiniCalendar"
import EventDetail from "./components/EventDetail"
import EventForm from "./components/EventForm"

export default function Home() {
  const { 
    currentDate, 
    setCurrentDate, 
    currentView, 
    setCurrentView, 
    selectedEvent,
  } = useCalendar()
  
  const [isLoaded, setIsLoaded] = useState(false)
  const [showAIPopup, setShowAIPopup] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showAddEventForm, setShowAddEventForm] = useState(false)
  const [showFloatingMusicControl, setShowFloatingMusicControl] = useState(false)
  const [isHoveringMusicControl, setIsHoveringMusicControl] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentSong, setCurrentSong] = useState<SongInfo>(getCurrentSong())
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  
  const updateProgress = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);
  
  const createAndSetupAudio = useCallback((src: string) => {
    console.log("[Audio] Creating new audio element with source:", src);
    
    const newAudio = new Audio(src);
    
    if (audioRef.current) {
      console.log("[Audio] Cleaning up previous audio element");
      
      try {
        audioRef.current.onended = null;
        audioRef.current.ontimeupdate = null;
        audioRef.current.onloadedmetadata = null;
        audioRef.current.onerror = null;
        
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
      } catch (err) {
        console.error("[Audio] Error during cleanup:", err);
      }
    }
    
    audioRef.current = newAudio;
    
    audioRef.current.ontimeupdate = updateProgress;
    
    audioRef.current.onloadedmetadata = () => {
      console.log("[Audio] Metadata loaded, duration:", newAudio.duration);
      setDuration(newAudio.duration);
    };
    
    audioRef.current.onerror = (e) => {
      console.error("[Audio] Error with audio element:", e);
    };
    
    return newAudio;
  }, [updateProgress]);
  
  const playSong = useCallback((song: SongInfo) => {
    console.log("[Audio] Playing song:", song.title, "file:", song.file);
    
    setCurrentSong(song);
    
    const audio = createAndSetupAudio(song.file);
    
    setIsPlaying(true);
    
    setCurrentTime(0);
    
    audio.onended = () => {
      console.log("[Audio] Song ended, picking a new song");
      
      const nextSong = getRandomSongExcept(song.id);
      console.log("[Audio] Selected next song:", nextSong.title, "with ID:", nextSong.id);
      
      playSong(nextSong);
    };
    
    setTimeout(() => {
      console.log("[Audio] Starting playback after delay");
      try {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("[Audio] Successfully started playback");
            })
            .catch((error: Error) => {
              console.error("[Audio] Failed to start playback:", error);
              
              const playOnUserInteraction = () => {
                console.log("[Audio] User interaction detected, trying to play again");
                audio.play()
                  .then(() => console.log("[Audio] Playback started after user interaction"))
                  .catch((err: Error) => console.error("[Audio] Still failed to play:", err));
                document.removeEventListener('click', playOnUserInteraction);
              };
              
              document.addEventListener('click', playOnUserInteraction, { once: true });
            });
        }
      } catch (err) {
        console.error("[Audio] Unexpected error starting playback:", err);
      }
    }, 100);
  }, [createAndSetupAudio]);

  const togglePlay = useCallback(() => {
    console.log("[Audio] Toggle play called, current state:", isPlaying);
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    
    if (newPlayingState) {
      console.log("[Audio] Attempting to play audio");
      if (!audioRef.current) {
        console.log("[Audio] No audio element, creating new one");
        const song = getCurrentSong();
        playSong(song);
      } else {
        console.log("[Audio] Playing existing audio");
        audioRef.current.play().catch(err => {
          console.error("[Audio] Error playing audio:", err);
          playSong(currentSong);
        });
      }
    } else {
      console.log("[Audio] Pausing audio");
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong, playSong]);

  const handleYesClick = useCallback(() => {
    console.log("[Audio] Yes button clicked - starting music");
    
    setShowAIPopup(false);
    setShowFloatingMusicControl(true);
    
    const song = getCurrentSong();
    playSong(song);
  }, [playSong]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  useEffect(() => {
    if (showAIPopup) {
      const text =
        "Looks like you don't have that many meetings today. Shall I play some music to help you get into your Flow State?"
      let i = 0
      setTypedText("")
      setIsTypingComplete(false)
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setTypedText((prev) => prev + text.charAt(i))
          i++
        } else {
          clearInterval(typingInterval)
          setIsTypingComplete(true)
        }
      }, 50)

      return () => clearInterval(typingInterval)
    }
  }, [showAIPopup])

  const handlePrevPeriod = () => {
    if (currentView === 'week') {
      setCurrentDate(getPrevWeek(currentDate));
    } else if (currentView === 'month') {
      const prevMonth = new Date(currentDate);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      setCurrentDate(prevMonth);
    } else if (currentView === 'day') {
      const prevDay = new Date(currentDate);
      prevDay.setDate(prevDay.getDate() - 1);
      setCurrentDate(prevDay);
    }
  };

  const handleNextPeriod = () => {
    if (currentView === 'week') {
      setCurrentDate(getNextWeek(currentDate));
    } else if (currentView === 'month') {
      const nextMonth = new Date(currentDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setCurrentDate(nextMonth);
    } else if (currentView === 'day') {
      const nextDay = new Date(currentDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setCurrentDate(nextDay);
    }
  };

  const handleTodayClick = () => {
    setCurrentDate(getToday());
  };

  const handleClosePopup = () => {
    setShowAIPopup(false);
    if (isPlaying) {
      setShowFloatingMusicControl(true);
    }
  }

  const myCalendars = [
    { name: "My Calendar", color: "bg-blue-500" },
    { name: "Work", color: "bg-green-500" },
    { name: "Personal", color: "bg-purple-500" },
    { name: "Family", color: "bg-orange-500" },
  ]

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHoveringMusicControl(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHoveringMusicControl(false);
    }, 500);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percentage = clickPosition / rect.width;
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const handleTimelineDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current) return;
    
    setIsDraggingTimeline(true);
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const dragPosition = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percentage = dragPosition / rect.width;
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const handleTimelineDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingTimeline || !progressBarRef.current || !audioRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const dragPosition = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percentage = dragPosition / rect.width;
    const newTime = percentage * duration;
    
    requestAnimationFrame(() => {
      audioRef.current!.currentTime = newTime;
      setCurrentTime(newTime);
    });
  };
  
  const handleTimelineDragEnd = () => {
    setIsDraggingTimeline(false);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingTimeline && progressBarRef.current && audioRef.current) {
        const rect = progressBarRef.current.getBoundingClientRect();
        const dragPosition = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const percentage = dragPosition / rect.width;
        const newTime = percentage * duration;
        
        requestAnimationFrame(() => {
          audioRef.current!.currentTime = newTime;
          setCurrentTime(newTime);
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsDraggingTimeline(false);
    };
    
    if (isDraggingTimeline) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingTimeline, duration]);

  useEffect(() => {
    setIsLoaded(true)
    
    const popupTimer = setTimeout(() => {
      setShowAIPopup(true)
    }, 3000)
    
    return () => {
      clearTimeout(popupTimer)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
        alt="Beautiful mountain landscape"
        fill
        className="object-cover"
        priority
      />

      {/* Navigation */}
      <header
        className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6 opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-4">
          <Menu className="h-6 w-6 text-white" />
          <span className="text-2xl font-semibold text-white drop-shadow-lg">Calendar</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
            <input
              type="text"
              placeholder="Search"
              className="rounded-full bg-white/10 backdrop-blur-sm pl-10 pr-4 py-2 text-white placeholder:text-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <Settings className="h-6 w-6 text-white drop-shadow-md" />
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-md">
            U
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative h-screen w-full pt-20 flex">
        {/* Sidebar */}
        <div
          className={`w-64 h-full bg-white/10 backdrop-blur-lg p-4 shadow-xl border-r border-white/20 rounded-tr-3xl opacity-0 ${isLoaded ? "animate-fade-in" : ""} flex flex-col justify-between`}
          style={{ animationDelay: "0.4s" }}
        >
          <div>
            <button 
              className="mb-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-3 text-white w-full"
              onClick={() => setShowAddEventForm(true)}
            >
              <Plus className="h-5 w-5" />
              <span>Create</span>
            </button>

            {/* Mini Calendar */}
            <MiniCalendar />

            {/* My Calendars */}
            <div>
              <h3 className="text-white font-medium mb-3">My calendars</h3>
              <div className="space-y-2">
                {myCalendars.map((cal, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-sm ${cal.color}`}></div>
                    <span className="text-white text-sm">{cal.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* New position for the big plus button */}
          <button 
            className="mt-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 p-4 text-white w-14 h-14 self-start"
            onClick={() => setShowAddEventForm(true)}
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {/* Calendar View */}
        <div
          className={`flex-1 flex flex-col opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.6s" }}
        >
          {/* Calendar Controls */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center gap-4">
              <button 
                className="px-4 py-2 text-white bg-blue-500 rounded-md"
                onClick={handleTodayClick}
              >
                Today
              </button>
              <div className="flex">
                <button 
                  className="p-2 text-white hover:bg-white/10 rounded-l-md"
                  onClick={handlePrevPeriod}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  className="p-2 text-white hover:bg-white/10 rounded-r-md"
                  onClick={handleNextPeriod}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <h2 className="text-xl font-semibold text-white">{formatMonthDay(currentDate)}</h2>
            </div>

            <div className="flex items-center gap-2 rounded-md p-1">
              <button
                onClick={() => setCurrentView("day")}
                className={`px-3 py-1 rounded ${currentView === "day" ? "bg-white/20" : ""} text-white text-sm`}
              >
                Day
              </button>
              <button
                onClick={() => setCurrentView("week")}
                className={`px-3 py-1 rounded ${currentView === "week" ? "bg-white/20" : ""} text-white text-sm`}
              >
                Week
              </button>
              <button
                onClick={() => setCurrentView("month")}
                className={`px-3 py-1 rounded ${currentView === "month" ? "bg-white/20" : ""} text-white text-sm`}
              >
                Month
              </button>
            </div>
          </div>

          {/* Selected Calendar View */}
          <div className="flex-1 overflow-auto p-4">
            {currentView === "week" && <WeekView />}
            {currentView === "day" && <DayView />}
            {currentView === "month" && <MonthView />}
          </div>
        </div>

        {/* AI Popup */}
        {showAIPopup && (
          <div className="fixed bottom-8 right-8 z-20">
            <div className="w-[450px] relative bg-gradient-to-br from-blue-400/30 via-blue-500/30 to-blue-600/30 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-blue-300/30 text-white">
              <button
                onClick={handleClosePopup}
                className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-blue-300" />
                </div>
                <div className="min-h-[80px]">
                  <p className="text-base font-light">{typedText}</p>
                </div>
              </div>
              
              {isTypingComplete && (
                <div className="mt-6 flex gap-3 animate-fade-in">
                  <button
                    onClick={handleYesClick}
                    className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors font-medium"
                  >
                    Yes
                  </button>
                  <button
                    onClick={handleClosePopup}
                    className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors font-medium"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Music Control when popup is closed but music is playing */}
        {showFloatingMusicControl && (
          <div className="fixed bottom-8 right-8 z-20 opacity-0 animate-fade-in">
            {/* Hover info card - Apple Music inspired */}
            <div 
              className={`absolute bottom-16 right-0 w-64 bg-gradient-to-br from-blue-400/80 via-blue-500/80 to-blue-600/80 backdrop-blur-lg p-4 rounded-xl shadow-xl border border-blue-300/30 text-white mb-2 transition-all duration-300 ease-in-out ${isHoveringMusicControl ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-md bg-blue-300/20 flex items-center justify-center">
                  <Music className="h-6 w-6 text-blue-100" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm leading-tight">{currentSong.title}</h4>
                  <p className="text-xs text-white/80">{currentSong.artist}</p>
                </div>
              </div>
              
              {/* Progress bar with improved bidirectional responsiveness */}
              <div 
                ref={progressBarRef}
                className="w-full h-1 bg-white/20 rounded-full mb-1.5 mt-3 cursor-pointer group relative"
                onClick={handleTimelineClick}
                onMouseDown={handleTimelineDragStart}
                onMouseMove={handleTimelineDragMove}
                onMouseUp={handleTimelineDragEnd}
                onMouseLeave={() => isDraggingTimeline && handleTimelineDragEnd()}
              >
                <div 
                  className="absolute inset-0 h-full bg-white/80 rounded-full"
                  style={{
                    width: `${(currentTime / duration) * 100}%`,
                    transition: isDraggingTimeline ? 'none' : 'width 300ms linear'
                  }}
                ></div>
                
                {/* Drag handle with improved positioning */}
                <div 
                  className={`absolute w-3 h-3 bg-white rounded-full shadow-lg top-1/2 -translate-y-1/2 ${isDraggingTimeline ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'}`}
                  style={{
                    left: `${(currentTime / duration) * 100}%`,
                    transform: `translateY(-50%) translateX(-50%)`,
                    transition: isDraggingTimeline ? 'none' : 'left 300ms linear, opacity 200ms ease'
                  }}
                ></div>
              </div>
              
              {/* Time */}
              <div className="flex justify-between text-xs text-white/80">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            {/* Circular play/pause button */}
            <button
              onClick={() => {
                togglePlay();
              }}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500/70 backdrop-blur-lg shadow-xl border border-blue-300/30 text-white hover:bg-blue-500/80 transition-colors"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
          </div>
        )}

        {/* Event Detail View */}
        {selectedEvent && <EventDetail />}
        
        {/* Add Event Form */}
        {showAddEventForm && (
          <EventForm onClose={() => setShowAddEventForm(false)} />
        )}
      </main>
    </div>
  )
}