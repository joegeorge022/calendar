"use client"

import { useCalendar } from "@/lib/CalendarContext"
import { isSameDay, formatTime12Hour } from "@/lib/dateUtils"

const DayView = () => {
  const { currentDate, events, setSelectedEvent } = useCalendar()
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8)
  
  const dayEvents = events.filter(event => 
    isSameDay(new Date(event.date), currentDate)
  )
  
  const calculateEventStyle = (startTime: string, endTime: string) => {
    const start = Number.parseInt(startTime.split(":")[0]) + Number.parseInt(startTime.split(":")[1]) / 60
    const end = Number.parseInt(endTime.split(":")[0]) + Number.parseInt(endTime.split(":")[1]) / 60
    const top = (start - 8) * 80
    const height = (end - start) * 80
    return { top: `${top}px`, height: `${height}px` }
  }

  return (
    <div className="h-full bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl overflow-hidden">
      <div className="grid grid-cols-[100px_1fr] h-full overflow-auto">
        {/* Time Labels */}
        <div className="text-white/70">
          {timeSlots.map((time, i) => (
            <div key={i} className="h-20 border-b border-white/10 pr-2 text-right text-xs pt-1">
              {time > 12 ? `${time - 12} PM` : `${time} AM`}
            </div>
          ))}
        </div>

        {/* Day Column */}
        <div className="relative">
          {timeSlots.map((_, timeIndex) => (
            <div key={timeIndex} className="h-20 border-b border-white/10"></div>
          ))}

          {/* Current time indicator */}
          <div 
            className="absolute left-0 right-0 border-t-2 border-red-500 z-10"
            style={{ 
              top: `${((new Date().getHours() - 8) * 60 + new Date().getMinutes()) * (80/60)}px`
            }}
          >
            <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-red-500"></div>
          </div>

          {/* Events */}
          {dayEvents.map((event, i) => {
            const eventStyle = calculateEventStyle(event.startTime, event.endTime)
            return (
              <div
                key={i}
                className={`absolute ${event.color} rounded-md p-3 text-white text-sm shadow-md cursor-pointer transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-lg left-1 right-1`}
                style={eventStyle}
                onClick={() => setSelectedEvent(event)}
              >
                <div className="font-medium">{event.title}</div>
                <div className="opacity-80 text-xs mt-1">
                  {`${formatTime12Hour(event.startTime)} - ${formatTime12Hour(event.endTime)}`}
                </div>
                {parseInt(eventStyle.height.replace('px', '')) > 60 && (
                  <>
                    <div className="opacity-80 text-xs mt-1">{event.location}</div>
                    {parseInt(eventStyle.height.replace('px', '')) > 80 && (
                      <div className="opacity-80 text-xs mt-1 line-clamp-2">{event.description}</div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default DayView 