"use client"

import { useRef, useEffect } from "react"
import { 
  Search, 
  Settings, 
  Menu, 
  X 
} from "lucide-react"
import { CalendarEvent } from "@/lib/CalendarContext"
import Image from "next/image"

interface NavbarProps {
  isLoaded: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: CalendarEvent[];
  showSearchResults: boolean;
  setShowSearchResults: (show: boolean) => void;
  isSearching: boolean;
  focusedResultIndex: number;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSearchResultClick: (event: CalendarEvent) => void;
  setShowAddEventForm: (show: boolean) => void;
}

export default function Navbar({
  isLoaded,
  searchTerm,
  setSearchTerm,
  searchResults,
  showSearchResults,
  setShowSearchResults,
  isSearching,
  focusedResultIndex,
  handleSearchChange,
  handleSearchKeyDown,
  handleSearchResultClick,
  setShowAddEventForm
}: NavbarProps) {
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node) && showSearchResults) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchResults, setShowSearchResults]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
      style={{ animationDelay: "0.2s" }}
    >
      <div className="flex items-center gap-3">
        <Menu className="h-5 w-5 text-white" />
        <div className="flex items-center">
          <Image 
            src="/logo.png" 
            alt="Calendar Logo" 
            width={32} 
            height={32} 
            className="mr-2"
          />
          <span className="text-xl font-medium text-[#333] dark:text-white">Calendar</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            className="rounded-full bg-white/10 backdrop-blur-lg pl-10 pr-4 py-2 text-white placeholder:text-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 w-48 transition-all duration-300 focus:w-64"
          />
          
          {/* Clear search button */}
          {searchTerm && (
            <button 
              onClick={() => {
                setSearchTerm('');
                setShowSearchResults(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute left-0 w-72 mt-2 bg-gradient-to-br from-blue-400/30 via-cyan-500/30 to-teal-400/30 backdrop-blur-xl border border-white/10 shadow-xl z-[100] max-h-[300px] overflow-y-auto animate-fade-in-fast rounded-3xl">
              <div className="rounded-3xl overflow-hidden">
                {isSearching ? (
                  <div className="p-5 text-white text-center flex items-center justify-center">
                    <span className="mr-2">Searching</span>
                    <span className="animate-pulse">.</span>
                    <span className="animate-pulse delay-100">.</span>
                    <span className="animate-pulse delay-200">.</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map((event, index) => (
                      <div 
                        key={event.id}
                        onClick={() => handleSearchResultClick(event)}
                        className={`p-4 cursor-pointer border-b border-white/10 last:border-b-0 transition-colors duration-150 ${index === focusedResultIndex ? 'bg-white/15' : 'hover:bg-white/15'}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-sm ${event.color}`}></div>
                          <span className="text-white font-medium">{event.title}</span>
                        </div>
                        <div className="text-white/80 text-sm mt-1">
                          {new Date(event.date).toLocaleDateString()} • {event.startTime} - {event.endTime}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="p-6 flex flex-col items-center">
                    <Search className="h-5 w-5 text-cyan-200 mb-3" />
                    <div className="text-white text-center font-light">
                      No matching events found
                    </div>
                    <div className="text-white/70 text-center text-sm mt-2">
                      Try a different search term or create a new event
                    </div>
                    <button 
                      onClick={() => {
                        setShowAddEventForm(true);
                        setShowSearchResults(false);
                      }}
                      className="mt-4 px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors font-medium text-white"
                    >
                      Create Event
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <Settings className="h-6 w-6 text-white drop-shadow-md" />
        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-md">
          U
        </div>
      </div>
    </header>
  );
} 