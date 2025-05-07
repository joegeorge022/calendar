"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useCalendar, CalendarEvent, eventColors } from "@/lib/CalendarContext"
import { X, Calendar as CalendarIcon, Clock, MapPin, Users, AlignLeft, User } from "lucide-react"
import { formatMonthDay, formatTime12Hour, getMonthDates, isSameDay } from "@/lib/dateUtils"

interface EventFormProps {
  onClose: () => void
  eventToEdit?: CalendarEvent | null
}

const EventForm = ({ onClose, eventToEdit }: EventFormProps) => {
  const { addEvent, updateEvent, currentDate } = useCalendar()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date>(currentDate)
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [location, setLocation] = useState("")
  const [attendees, setAttendees] = useState("")
  const [organizer, setOrganizer] = useState("You")
  const [color, setColor] = useState(eventColors[0])
  const [isVisible, setIsVisible] = useState(false)
  
  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'details'>('basic')
  
  const formRef = useRef<HTMLDivElement>(null)
  const datePickerRef = useRef<HTMLDivElement>(null)
  const startTimePickerRef = useRef<HTMLDivElement>(null)
  const endTimePickerRef = useRef<HTMLDivElement>(null)

  const handleCloseWithAnimation = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        handleCloseWithAnimation();
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleCloseWithAnimation])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
      if (startTimePickerRef.current && !startTimePickerRef.current.contains(event.target as Node)) {
        setShowStartTimePicker(false)
      }
      if (endTimePickerRef.current && !endTimePickerRef.current.contains(event.target as Node)) {
        setShowEndTimePicker(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title)
      setDescription(eventToEdit.description)
      setDate(eventToEdit.date)
      setStartTime(eventToEdit.startTime)
      setEndTime(eventToEdit.endTime)
      setLocation(eventToEdit.location)
      setAttendees(eventToEdit.attendees.join(", "))
      setOrganizer(eventToEdit.organizer)
      setColor(eventToEdit.color)
    }
  }, [eventToEdit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const eventData = {
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      attendees: attendees.split(",").map(att => att.trim()).filter(Boolean),
      organizer,
      color,
    }
    
    if (eventToEdit) {
      updateEvent({ ...eventData, id: eventToEdit.id })
    } else {
      addEvent(eventData)
    }
    
    handleCloseWithAnimation();
  }
  
  const monthDates = getMonthDates(date)
  
  const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const hours = Math.floor(i / 4)
    const minutes = (i % 4) * 15
    return {
      value: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
      label: `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`
    }
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-0 flex items-center justify-center z-50 transition-all duration-300 ease-in-out"
         style={{ backgroundColor: isVisible ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)' }}>
      <div 
        ref={formRef}
        className={`bg-white/10 backdrop-blur-lg p-5 rounded-lg shadow-xl w-full max-w-md mx-4 border border-white/20 text-white transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {eventToEdit ? "Edit Event" : "New Event"}
          </h3>
          <button
            className="text-white/70 hover:text-white transition-colors"
            onClick={handleCloseWithAnimation}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Event Title */}
          <div className="mb-4">
            <label className="block text-sm text-white/80 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Add title"
              className="w-full bg-white/10 rounded-md border border-white/20 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>
          
          {/* Tabs for basic/details */}
          <div className="flex border-b border-white/20 mb-4">
            <button 
              type="button"
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${activeTab === 'basic' ? 'border-b-2 border-blue-500' : 'text-white/70 hover:text-white'}`}
              onClick={() => setActiveTab('basic')}
            >
              Basic
            </button>
            <button 
              type="button"
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${activeTab === 'details' ? 'border-b-2 border-blue-500' : 'text-white/70 hover:text-white'}`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
          </div>
          
          {activeTab === 'basic' ? (
            <>
              {/* Date Selection */}
              <div className="mb-4 relative">
                <label className="block text-sm text-white/80 mb-1">Date</label>
                <div 
                  className="flex items-center gap-2 bg-white/10 rounded-md border border-white/20 p-2 cursor-pointer hover:bg-white/15 transition-colors duration-200"
                  onClick={() => {
                    setShowDatePicker(!showDatePicker)
                    setShowStartTimePicker(false)
                    setShowEndTimePicker(false)
                  }}
                >
                  <CalendarIcon className="h-4 w-4 text-white/70" />
                  <span>{formatMonthDay(date)}</span>
                </div>
                
                {/* Date Picker Popup */}
                {showDatePicker && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowDatePicker(false)}></div>
                    <div 
                      ref={datePickerRef}
                      className="absolute left-0 top-full mt-1 bg-slate-700/90 backdrop-blur-xl rounded-md border border-white/40 p-3 z-40 shadow-[0_0_20px_rgba(0,0,0,0.3)] w-64 transform transition-all duration-200 ease-in-out"
                    >
                      <div className="grid grid-cols-7 gap-1">
                        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                          <div key={i} className="text-xs text-white font-medium text-center py-1">
                            {day}
                          </div>
                        ))}
                        
                        {monthDates.map((dateObj, i) => (
                          <div
                            key={i}
                            className={`text-xs rounded-full w-7 h-7 flex items-center justify-center cursor-pointer transition-all duration-150 ${
                              dateObj.date && isSameDay(dateObj.date, date)
                                ? "bg-blue-500 text-white"
                                : dateObj.isCurrentMonth
                                ? "text-white hover:bg-white/30"
                                : "text-white/40 hover:bg-white/10"
                            } ${!dateObj.date ? "invisible" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (dateObj.date) {
                                setDate(dateObj.date)
                                setShowDatePicker(false)
                              }
                            }}
                          >
                            {dateObj.date?.getDate()}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="relative">
                  <label className="block text-sm text-white/80 mb-1">Start Time</label>
                  <div 
                    className="flex items-center gap-2 bg-white/10 rounded-md border border-white/20 p-2 cursor-pointer hover:bg-white/15 transition-colors duration-200"
                    onClick={() => {
                      setShowStartTimePicker(!showStartTimePicker)
                      setShowEndTimePicker(false)
                      setShowDatePicker(false)
                    }}
                  >
                    <Clock className="h-4 w-4 text-white/70" />
                    <span>{formatTime12Hour(startTime)}</span>
                  </div>
                  
                  {/* Start Time Picker */}
                  {showStartTimePicker && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowStartTimePicker(false)}></div>
                      <div 
                        ref={startTimePickerRef}
                        className="absolute left-0 top-full mt-1 bg-slate-700/90 backdrop-blur-xl rounded-md border border-white/40 max-h-48 overflow-y-auto z-40 shadow-[0_0_20px_rgba(0,0,0,0.3)] w-40 transform transition-all duration-200 ease-in-out"
                      >
                        {timeOptions.map((time, i) => (
                          <div
                            key={i}
                            className={`px-3 py-1 cursor-pointer text-sm transition-colors duration-150 ${
                              time.value === startTime ? "bg-blue-500 text-white" : "hover:bg-white/30 text-white"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setStartTime(time.value)
                              setShowStartTimePicker(false)
                            }}
                          >
                            {time.label}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                <div className="relative">
                  <label className="block text-sm text-white/80 mb-1">End Time</label>
                  <div 
                    className="flex items-center gap-2 bg-white/10 rounded-md border border-white/20 p-2 cursor-pointer hover:bg-white/15 transition-colors duration-200"
                    onClick={() => {
                      setShowEndTimePicker(!showEndTimePicker)
                      setShowStartTimePicker(false)
                      setShowDatePicker(false)
                    }}
                  >
                    <Clock className="h-4 w-4 text-white/70" />
                    <span>{formatTime12Hour(endTime)}</span>
                  </div>
                  
                  {/* End Time Picker */}
                  {showEndTimePicker && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowEndTimePicker(false)}></div>
                      <div 
                        ref={endTimePickerRef}
                        className="absolute left-0 top-full mt-1 bg-slate-700/90 backdrop-blur-xl rounded-md border border-white/40 max-h-48 overflow-y-auto z-40 shadow-[0_0_20px_rgba(0,0,0,0.3)] w-40 transform transition-all duration-200 ease-in-out"
                      >
                        {timeOptions.map((time, i) => (
                          <div
                            key={i}
                            className={`px-3 py-1 cursor-pointer text-sm transition-colors duration-150 ${
                              time.value === endTime ? "bg-blue-500 text-white" : "hover:bg-white/30 text-white"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setEndTime(time.value)
                              setShowEndTimePicker(false)
                            }}
                          >
                            {time.label}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Location */}
              <div className="mb-4">
                <label className="block text-sm text-white/80 mb-1">Location</label>
                <div className="flex items-center gap-2 bg-white/10 rounded-md border border-white/20 p-2 transition-colors duration-200 focus-within:ring-2 focus-within:ring-blue-500">
                  <MapPin className="h-4 w-4 text-white/70" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Add location"
                    className="bg-transparent border-none w-full focus:outline-none text-sm"
                  />
                </div>
              </div>
              
              {/* Colors */}
              <div className="mb-4">
                <label className="block text-sm text-white/80 mb-1">Event Color</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {eventColors.map((eventColor) => (
                    <button
                      key={eventColor}
                      type="button"
                      className={`w-7 h-7 rounded-full ${eventColor} ${color === eventColor ? 'ring-2 ring-white shadow-lg' : ''} transition transform duration-150 hover:scale-110`}
                      onClick={() => setColor(eventColor)}
                    ></button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Organizer */}
              <div className="mb-4">
                <label className="block text-sm text-white/80 mb-1">Organizer</label>
                <div className="flex items-center gap-2 bg-white/10 rounded-md border border-white/20 p-2 transition-colors duration-200 focus-within:ring-2 focus-within:ring-blue-500">
                  <User className="h-4 w-4 text-white/70" />
                  <input
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="Organizer name"
                    className="bg-transparent border-none w-full focus:outline-none text-sm"
                  />
                </div>
              </div>
              
              {/* Attendees */}
              <div className="mb-4">
                <label className="block text-sm text-white/80 mb-1">Attendees</label>
                <div className="flex items-center gap-2 bg-white/10 rounded-md border border-white/20 p-2 transition-colors duration-200 focus-within:ring-2 focus-within:ring-blue-500">
                  <Users className="h-4 w-4 text-white/70" />
                  <input
                    type="text"
                    value={attendees}
                    onChange={(e) => setAttendees(e.target.value)}
                    placeholder="Add attendees (comma separated)"
                    className="bg-transparent border-none w-full focus:outline-none text-sm"
                  />
                </div>
              </div>
              
              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm text-white/80 mb-1">Description</label>
                <div className="flex gap-2 bg-white/10 rounded-md border border-white/20 p-2 transition-colors duration-200 focus-within:ring-2 focus-within:ring-blue-500">
                  <AlignLeft className="h-4 w-4 text-white/70 mt-1" />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add description"
                    rows={3}
                    className="bg-transparent border-none w-full focus:outline-none text-sm resize-none"
                  ></textarea>
                </div>
              </div>
            </>
          )}
          
          <div className="flex justify-end gap-3 mt-5">
            <button 
              type="button"
              onClick={handleCloseWithAnimation}
              className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors duration-200 text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-md transition-colors duration-200 text-sm"
            >
              {eventToEdit ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventForm 