"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react"
import { useCalendar } from "@/lib/CalendarContext"
import { CalendarEvent } from "@/lib/CalendarContext"
import { formatMonthDay, getToday, getPrevWeek, getNextWeek } from "@/lib/dateUtils"

import WeekView from "./components/WeekView"
import DayView from "./components/DayView"
import MonthView from "./components/MonthView"
import MiniCalendar from "./components/MiniCalendar"
import EventDetail from "./components/EventDetail"
import EventForm from "./components/EventForm"
import Navbar from "./components/Navbar"
import Features from "./components/Features"

export default function Home() {
  const { 
    currentDate, 
    setCurrentDate, 
    currentView, 
    setCurrentView, 
    selectedEvent,
    setSelectedEvent,
    events,
  } = useCalendar()
  
  const [isLoaded, setIsLoaded] = useState(false)
  const [showAddEventForm, setShowAddEventForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<CalendarEvent[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [focusedResultIndex, setFocusedResultIndex] = useState(-1)
  const [isSearching, setIsSearching] = useState(false)
  
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

  const myCalendars = [
    { name: "My Calendar", color: "bg-blue-500" },
    { name: "Work", color: "bg-green-500" },
    { name: "Personal", color: "bg-purple-500" },
    { name: "Family", color: "bg-orange-500" },
  ]

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFocusedResultIndex(-1);
    
    if (value.trim() === "") {
      setShowSearchResults(false);
      return;
    }
    
    setIsSearching(true);
    
    const searchTimer = setTimeout(() => {
      const filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(value.toLowerCase()) ||
        event.description.toLowerCase().includes(value.toLowerCase()) ||
        event.location.toLowerCase().includes(value.toLowerCase()) ||
        event.organizer.toLowerCase().includes(value.toLowerCase())
      );
      
      setSearchResults(filteredEvents);
      setShowSearchResults(true);
      setIsSearching(false);
    }, 300);
    
    return () => clearTimeout(searchTimer);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSearchTerm('');
      setShowSearchResults(false);
      return;
    }
    
    if (!showSearchResults || searchResults.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedResultIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedResultIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && focusedResultIndex >= 0) {
      e.preventDefault();
      const selectedResult = searchResults[focusedResultIndex];
      if (selectedResult) {
        handleSearchResultClick(selectedResult);
      }
    }
  };

  const handleSearchResultClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setCurrentDate(new Date(event.date));
    setShowSearchResults(false);
    setSearchTerm('');
  };

  useEffect(() => {
    setIsLoaded(true);
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
      <Navbar 
        isLoaded={isLoaded}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchResults={searchResults}
        showSearchResults={showSearchResults}
        setShowSearchResults={setShowSearchResults}
        isSearching={isSearching}
        focusedResultIndex={focusedResultIndex}
        handleSearchChange={handleSearchChange}
        handleSearchKeyDown={handleSearchKeyDown}
        handleSearchResultClick={handleSearchResultClick}
        setShowAddEventForm={setShowAddEventForm}
      />

      {/* Main Content */}
      <main className="relative h-screen w-full pt-24 flex">
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

        {/* AI Features component */}
        <Features />

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
