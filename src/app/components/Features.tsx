"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Sparkles,
  X,
  Pause,
  Play,
  Music,
} from "lucide-react"
import { SongInfo, getCurrentSong, getRandomSongExcept } from "@/lib/musicUtils"

export default function Features() {
  // State variables
  const [showAIPopup, setShowAIPopup] = useState(false)
  const [showFeaturesMenu, setShowFeaturesMenu] = useState(false)
  const [isClosingFeaturesMenu, setIsClosingFeaturesMenu] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showFloatingMusicControl, setShowFloatingMusicControl] = useState(false)
  const [isHoveringMusicControl, setIsHoveringMusicControl] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentSong, setCurrentSong] = useState<SongInfo>(getCurrentSong())
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false)
  const [shouldShowMusicButton, setShouldShowMusicButton] = useState(true)
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const musicButtonHideTimerRef = useRef<NodeJS.Timeout | null>(null)
  const featuresMenuRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const toggleFeaturesMenu = () => {
    if (showFeaturesMenu) {
      setIsClosingFeaturesMenu(true);
      closeTimeoutRef.current = setTimeout(() => {
        setShowFeaturesMenu(false);
        setIsClosingFeaturesMenu(false);
      }, 200);
    } else {
      setShowFeaturesMenu(true);
    }
  };

  const closeFeaturesMenu = () => {
    setIsClosingFeaturesMenu(true);
    closeTimeoutRef.current = setTimeout(() => {
      setShowFeaturesMenu(false);
      setIsClosingFeaturesMenu(false);
    }, 200); 
  };
  
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
    setShouldShowMusicButton(true);
    
    if (musicButtonHideTimerRef.current) {
      clearTimeout(musicButtonHideTimerRef.current);
      musicButtonHideTimerRef.current = null;
    }
    
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
    setShouldShowMusicButton(true);
    
    if (musicButtonHideTimerRef.current) {
      clearTimeout(musicButtonHideTimerRef.current);
      musicButtonHideTimerRef.current = null;
    }
    
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
      
      musicButtonHideTimerRef.current = setTimeout(() => {
        setShouldShowMusicButton(false);
      }, 7000);
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

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHoveringMusicControl(true);
    setShouldShowMusicButton(true);
    
    if (musicButtonHideTimerRef.current) {
      clearTimeout(musicButtonHideTimerRef.current);
      musicButtonHideTimerRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHoveringMusicControl(false);
    }, 500);
    
    if (!isPlaying && showFloatingMusicControl) {
      musicButtonHideTimerRef.current = setTimeout(() => {
        setShouldShowMusicButton(false);
      }, 5000);
    }
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

  const handleClosePopup = () => {
    setShowAIPopup(false);
    if (isPlaying) {
      setShowFloatingMusicControl(true);
    }
  }

  useEffect(() => {
    if (showAIPopup) {
      const text =
        "LLooks like you don't have that many meetings today. Shall I play some music to help you get into your Flow State?"
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

  useEffect(() => {
    const popupTimer = setTimeout(() => {
      setShowAIPopup(true)
      setShowFeaturesMenu(false)
    }, 3000)
    
    return () => {
      clearTimeout(popupTimer)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

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
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showFeaturesMenu && 
        featuresMenuRef.current && 
        !featuresMenuRef.current.contains(e.target as Node)
      ) {
        console.log("[Debug] Closing features menu from click outside");
        closeFeaturesMenu();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFeaturesMenu]);

  useEffect(() => {
    console.log("[Debug] Features menu state changed:", { showFeaturesMenu });
  }, [showFeaturesMenu]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showFeaturesMenu) {
        console.log("[Debug] Closing features menu with Escape key");
        closeFeaturesMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showFeaturesMenu]);

  return (
    <>
      {/* Fixed container for sparkles button and popups */}
      <div className="fixed bottom-8 right-8 z-30">
        {/* The AI Popup */}
        {showAIPopup && (
          <div className="absolute bottom-0 right-0 animate-scale-up origin-bottom-right">
            <div className="w-[450px] relative bg-gradient-to-br from-blue-400/30 via-cyan-500/30 to-teal-400/30 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl text-white">
              <button
                onClick={handleClosePopup}
                className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-cyan-200" />
                </div>
                <div className="min-h-[80px]">
                  <p className="text-base font-light">{typedText}</p>
                </div>
              </div>
              
              {isTypingComplete && (
                <div className="mt-6 flex gap-3 animate-fade-in">
                  <button
                    onClick={handleYesClick}
                    className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors font-medium"
                  >
                    Yes
                  </button>
                  <button
                    onClick={handleClosePopup}
                    className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors font-medium"
                  >
                    No
                  </button>
                </div>
              )}

              {isPlaying && (
                <div className="mt-4 flex items-center justify-between animate-fade-in">
                  <button
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-white text-sm hover:bg-white/20 transition-colors"
                    onClick={togglePlay}
                  >
                    <Pause className="h-4 w-4" />
                    <span>Pause {currentSong.artist}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features menu popup with close button in sparkles position */}
        {(showFeaturesMenu || isClosingFeaturesMenu) && !showAIPopup && (
          <div className={`absolute bottom-[48px] right-0 transition-all duration-200 origin-bottom-right ${isClosingFeaturesMenu ? 'scale-95 opacity-0' : 'animate-scale-up opacity-100'}`}>
            <div 
              ref={featuresMenuRef}
              className="w-[300px] relative bg-gradient-to-br from-blue-400/30 via-cyan-500/30 to-teal-400/30 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-xl text-white mb-4"
            >
              <h3 className="text-lg font-medium mb-3">Features</h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    closeFeaturesMenu();
                    togglePlay();
                    setShowFloatingMusicControl(true);
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
                >
                  <Music className="h-5 w-5 text-cyan-200" />
                  <span>Play Music</span>
                </button>
                
                <button 
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
                >
                  <Sparkles className="h-5 w-5 text-cyan-200" />
                  <span>AI Assistant</span>
                </button>
                
                {/* Placeholder for future features */}
                <div className="p-2.5 rounded-xl bg-white/5 text-white/50">
                  <p className="text-xs">More features coming soon</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Button slot - always in the same fixed position regardless of state */}
        <div className="relative w-12 h-12">
          {/* Close button when features menu is open */}
          {showFeaturesMenu && !showAIPopup && (
            <button
              onClick={closeFeaturesMenu}
              aria-label="Close features menu"
              className="absolute inset-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400/30 via-cyan-500/30 to-teal-400/30 backdrop-blur-xl border border-white/10 shadow-xl text-white hover:bg-white/10 transition-all duration-300"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          
          {/* Sparkles button when nothing is open */}
          {!showAIPopup && !showFeaturesMenu && (
            <button
              onClick={toggleFeaturesMenu}
              id="sparklesButton"
              aria-label="Toggle features menu"
              className="absolute inset-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400/30 via-cyan-500/30 to-teal-400/30 backdrop-blur-xl border border-white/10 shadow-xl text-white hover:bg-white/10 transition-all duration-300"
            >
              <Sparkles className="h-5 w-5 text-cyan-200" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Music Control when popup is closed but music is playing */}
      {showFloatingMusicControl && (
        <div className={`fixed bottom-8 right-28 z-20 ${shouldShowMusicButton ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
          {/* Hover info card - Apple Music inspired */}
          <div 
            className={`absolute bottom-16 right-0 w-64 bg-gradient-to-br from-blue-400/30 via-cyan-500/30 to-teal-400/30 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-xl text-white mb-2 transition-all duration-300 ease-in-out ${isHoveringMusicControl ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center">
                <Music className="h-6 w-6 text-cyan-200" />
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
                className="absolute inset-0 h-full bg-cyan-300/80 rounded-full"
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
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400/30 via-cyan-500/30 to-teal-400/30 backdrop-blur-xl border border-white/10 shadow-xl text-white hover:bg-white/10 transition-colors"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
        </div>
      )}
    </>
  );
} 
