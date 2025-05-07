"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCalendar } from "@/lib/CalendarContext"
import { formatMonthYear, getMonthDates, isSameDay, getNextMonth, getPrevMonth } from "@/lib/dateUtils"

const MiniCalendar = () => {
  const { currentDate, setCurrentDate } = useCalendar()
  const [viewDate, setViewDate] = useState(new Date(currentDate))
  const [monthDates, setMonthDates] = useState<{ date: Date | null; isCurrentMonth: boolean }[]>([])
  
  useEffect(() => {
    setMonthDates(getMonthDates(viewDate))
  }, [viewDate])
  
  const handlePrevMonth = () => {
    setViewDate(getPrevMonth(viewDate))
  }
  
  const handleNextMonth = () => {
    setViewDate(getNextMonth(viewDate))
  }
  
  const handleDateClick = (date: Date | null) => {
    if (date) {
      setCurrentDate(date)
    }
  }
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">{formatMonthYear(viewDate)}</h3>
        <div className="flex gap-1">
          <button 
            className="p-1 rounded-full hover:bg-white/20"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-4 w-4 text-white" />
          </button>
          <button 
            className="p-1 rounded-full hover:bg-white/20"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <div key={i} className="text-xs text-white/70 font-medium py-1">
            {day}
          </div>
        ))}

        {monthDates.map((dateObj, i) => (
          <div
            key={i}
            className={`text-xs rounded-full w-7 h-7 flex items-center justify-center cursor-pointer ${
              dateObj.date && isSameDay(dateObj.date, currentDate)
                ? "bg-blue-500 text-white"
                : dateObj.isCurrentMonth
                ? "text-white hover:bg-white/20"
                : "text-white/30 hover:bg-white/10"
            } ${!dateObj.date ? "invisible" : ""}`}
            onClick={() => handleDateClick(dateObj.date)}
          >
            {dateObj.date?.getDate()}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MiniCalendar 