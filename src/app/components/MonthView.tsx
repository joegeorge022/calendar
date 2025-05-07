"use client"

import { useCalendar } from "@/lib/CalendarContext"
import { getMonthDates, isSameDay } from "@/lib/dateUtils"
import { useState, useEffect } from "react"

const MonthView = () => {
  const { currentDate, events, setSelectedEvent, setCurrentDate } = useCalendar()
  const [monthDates, setMonthDates] = useState<{ date: Date | null; isCurrentMonth: boolean }[]>([])
  
  useEffect(() => {
    setMonthDates(getMonthDates(currentDate))
  }, [currentDate])
  
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      date && event.date && isSameDay(new Date(event.date), date)
    )
  }
  
  const handleDateClick = (date: Date) => {
    setCurrentDate(date)
  }
  
  return (
    <div className="h-full bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl overflow-hidden">
      {/* Week Header */}
      <div className="grid grid-cols-7 border-b border-white/20">
        {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, i) => (
          <div key={i} className="p-2 text-center border-r border-white/20 last:border-r-0">
            <div className="text-xs text-white/70 font-medium">{day}</div>
          </div>
        ))}
      </div>
      
      {/* Month Grid */}
      <div className="grid grid-cols-7 grid-rows-[repeat(auto-fill,minmax(100px,1fr))] h-[calc(100%-40px)]">
        {monthDates.map((dateObj, i) => (
          <div 
            key={i}
            className={`border-r border-b border-white/20 p-2 last:border-r-0 min-h-[100px] ${
              dateObj.isCurrentMonth ? 'bg-transparent' : 'bg-white/5'
            } ${
              dateObj.date && isSameDay(dateObj.date, new Date()) ? 'bg-blue-500/20' : ''
            }`}
            onClick={() => dateObj.date && handleDateClick(dateObj.date)}
          >
            {dateObj.date && (
              <>
                <div className={`text-sm font-medium rounded-full w-7 h-7 flex items-center justify-center mb-1
                  ${isSameDay(dateObj.date, new Date()) 
                    ? 'bg-blue-500 text-white' 
                    : 'text-white hover:bg-white/20'}`}
                >
                  {dateObj.date.getDate()}
                </div>
                
                {/* Events */}
                <div className="space-y-1 overflow-y-auto max-h-[80px]">
                  {getEventsForDate(dateObj.date).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`${event.color} text-white text-xs p-1 rounded truncate cursor-pointer`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedEvent(event)
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MonthView 