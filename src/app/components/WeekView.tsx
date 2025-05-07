"use client"

import { useCalendar } from "@/lib/CalendarContext"
import { isSameDay, formatWeekDay } from "@/lib/dateUtils"

const WeekView = () => {
  const { weekDates, events, setSelectedEvent } = useCalendar()
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8)
  
  const calculateEventStyle = (startTime: string, endTime: string) => {
    const start = Number.parseInt(startTime.split(":")[0]) + Number.parseInt(startTime.split(":")[1]) / 60
    const end = Number.parseInt(endTime.split(":")[0]) + Number.parseInt(endTime.split(":")[1]) / 60
    const top = (start - 8) * 80 
    const height = (end - start) * 80
    return { top: `${top}px`, height: `${height}px` }
  }

  return (
    <div className="h-full bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl overflow-hidden">
      {/* Week Header */}
      <div className="grid grid-cols-8 border-b border-white/20">
        <div className="p-2 text-center text-white/50 text-xs"></div>
        {weekDates.map((date, i) => (
          <div key={i} className="p-2 text-center border-l border-white/20">
            <div className="text-xs text-white/70 font-medium">{formatWeekDay(date)}</div>
            <div
              className={`text-lg font-medium mt-1 text-white ${
                isSameDay(date, new Date()) 
                  ? "bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center mx-auto" 
                  : ""
              }`}
            >
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="grid grid-cols-8 overflow-auto h-[calc(100%-53px)]">
        {/* Time Labels */}
        <div className="text-white/70">
          {timeSlots.map((time, i) => (
            <div key={i} className="h-20 border-b border-white/10 pr-2 text-right text-xs pt-1">
              {time > 12 ? `${time - 12} PM` : `${time} AM`}
            </div>
          ))}
        </div>

        {/* Days Columns */}
        {weekDates.map((date, dayIndex) => (
          <div key={dayIndex} className="border-l border-white/20 relative">
            {timeSlots.map((_, timeIndex) => (
              <div key={timeIndex} className="h-20 border-b border-white/10"></div>
            ))}

            {/* Current time indicator for today */}
            {isSameDay(date, new Date()) && (
              <div 
                className="absolute left-0 right-0 border-t-2 border-red-500 z-10"
                style={{ 
                  top: `${((new Date().getHours() - 8) * 60 + new Date().getMinutes()) * (80/60)}px` 
                }}
              >
                <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-red-500"></div>
              </div>
            )}

            {/* Events */}
            {events
              .filter(event => isSameDay(new Date(event.date), date))
              .map((event, i) => {
                const eventStyle = calculateEventStyle(event.startTime, event.endTime)
                return (
                  <div
                    key={i}
                    className={`absolute ${event.color} rounded-md p-2 text-white text-xs shadow-md cursor-pointer transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-lg`}
                    style={{
                      ...eventStyle,
                      left: "4px",
                      right: "4px",
                    }}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="opacity-80 text-[10px] mt-1">{`${event.startTime} - ${event.endTime}`}</div>
                  </div>
                )
              })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default WeekView 