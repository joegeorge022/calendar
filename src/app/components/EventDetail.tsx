"use client"

import { useCalendar } from "@/lib/CalendarContext"
import { Clock, MapPin, Calendar, Users, Trash2, Edit, X } from "lucide-react"
import { formatMonthDay, formatTime12Hour } from "@/lib/dateUtils"
import { useState, useEffect, useRef, useCallback } from "react"
import EventForm from "./EventForm"

const EventDetail = () => {
  const { selectedEvent, setSelectedEvent, deleteEvent } = useCalendar()
  const [showEditForm, setShowEditForm] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const detailRef = useRef<HTMLDivElement>(null)
  
  const handleCloseWithAnimation = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setSelectedEvent(null);
    }, 300);
  }, [setSelectedEvent]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 10);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (detailRef.current && !detailRef.current.contains(event.target as Node)) {
        handleCloseWithAnimation();
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleCloseWithAnimation]);
  
  if (!selectedEvent) return null
  
  const handleDelete = () => {
    deleteEvent(selectedEvent.id)
    handleCloseWithAnimation();
  }
  
  const handleEdit = () => {
    setShowEditForm(true)
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-0 flex items-center justify-center z-50 transition-all duration-300 ease-in-out"
         style={{ backgroundColor: isVisible ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)' }}>
      {showEditForm ? (
        <EventForm 
          onClose={() => setShowEditForm(false)} 
          eventToEdit={selectedEvent} 
        />
      ) : (
        <div 
          ref={detailRef}
          className={`${selectedEvent.color} p-6 rounded-lg shadow-xl max-w-md w-full mx-4 transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold mb-4 text-white">{selectedEvent.title}</h3>
            <button
              className="text-white/70 hover:text-white transition-colors"
              onClick={handleCloseWithAnimation}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-3 text-white">
            <p className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              {`${formatTime12Hour(selectedEvent.startTime)} - ${formatTime12Hour(selectedEvent.endTime)}`}
            </p>
            <p className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              {selectedEvent.location || "No location"}
            </p>
            <p className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              {formatMonthDay(selectedEvent.date)}
            </p>
            <p className="flex items-start">
              <Users className="mr-2 h-5 w-5 mt-1" />
              <span>
                <strong>Attendees:</strong>
                <br />
                {selectedEvent.attendees.length ? 
                  selectedEvent.attendees.join(", ") : 
                  "No attendees"}
              </span>
            </p>
            <p>
              <strong>Organizer:</strong> {selectedEvent.organizer}
            </p>
            {selectedEvent.description && (
              <p className="mt-4">
                <strong>Description:</strong> 
                <br />
                {selectedEvent.description}
              </p>
            )}
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              className="bg-white/10 text-white px-4 py-2 rounded hover:bg-white/20 transition-colors duration-200 flex items-center gap-2"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            <div className="flex gap-2">
              <button
                className="bg-white/10 text-white px-4 py-2 rounded hover:bg-white/20 transition-colors duration-200 flex items-center gap-2"
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button
                className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors duration-200"
                onClick={handleCloseWithAnimation}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventDetail 