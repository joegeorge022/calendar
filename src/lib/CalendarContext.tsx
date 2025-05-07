"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getToday, getWeekDates } from "./dateUtils";

export type CalendarEvent = {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
  date: Date;
  description: string;
  location: string;
  attendees: string[];
  organizer: string;
};

type CalendarContextType = {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, "id">) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: number) => void;
  currentView: "day" | "week" | "month";
  setCurrentView: (view: "day" | "week" | "month") => void;
  selectedEvent: CalendarEvent | null;
  setSelectedEvent: (event: CalendarEvent | null) => void;
  weekDates: Date[];
};

export const eventColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-yellow-500",
  "bg-indigo-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-red-500",
  "bg-orange-500",
];

const createSampleEvents = (): CalendarEvent[] => {
  const today = getToday();
  const weekDates = getWeekDates(today);
  
  return [
    {
      id: 1,
      title: "Team Meeting",
      startTime: "09:00",
      endTime: "10:00",
      color: "bg-blue-500",
      date: weekDates[1],
      description: "Weekly team sync-up",
      location: "Conference Room A",
      attendees: ["John Doe", "Jane Smith", "Bob Johnson"],
      organizer: "Alice Brown",
    },
    {
      id: 2,
      title: "Lunch with Sarah",
      startTime: "12:30",
      endTime: "13:30",
      color: "bg-green-500",
      date: weekDates[1],
      description: "Discuss project timeline",
      location: "Cafe Nero",
      attendees: ["Sarah Lee"],
      organizer: "You",
    },
    {
      id: 3,
      title: "Project Review",
      startTime: "14:00",
      endTime: "15:30",
      color: "bg-purple-500",
      date: weekDates[3],
      description: "Q2 project progress review",
      location: "Meeting Room 3",
      attendees: ["Team Alpha", "Stakeholders"],
      organizer: "Project Manager",
    },
    {
      id: 4,
      title: "Client Call",
      startTime: "10:00",
      endTime: "11:00",
      color: "bg-yellow-500",
      date: weekDates[2],
      description: "Quarterly review with major client",
      location: "Zoom Meeting",
      attendees: ["Client Team", "Sales Team"],
      organizer: "Account Manager",
    },
    {
      id: 5,
      title: "Team Brainstorm",
      startTime: "13:00",
      endTime: "14:30",
      color: "bg-indigo-500",
      date: weekDates[4],
      description: "Ideation session for new product features",
      location: "Creative Space",
      attendees: ["Product Team", "Design Team"],
      organizer: "Product Owner",
    },
  ];
};

const CalendarContext = createContext<CalendarContextType>({
  currentDate: getToday(),
  setCurrentDate: () => {},
  events: [],
  addEvent: () => {},
  updateEvent: () => {},
  deleteEvent: () => {},
  currentView: "week",
  setCurrentView: () => {},
  selectedEvent: null,
  setSelectedEvent: () => {},
  weekDates: [],
});

export const useCalendar = () => useContext(CalendarContext);

export const CalendarProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentDate, setCurrentDate] = useState<Date>(getToday());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentView, setCurrentView] = useState<"day" | "week" | "month">("week");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [weekDates, setWeekDates] = useState<Date[]>(getWeekDates(currentDate));

  useEffect(() => {
    setEvents(createSampleEvents());
  }, []);

  useEffect(() => {
    setWeekDates(getWeekDates(currentDate));
  }, [currentDate]);

  const addEvent = (event: Omit<CalendarEvent, "id">) => {
    const newEvent = {
      ...event,
      id: Math.max(0, ...events.map((e) => e.id)) + 1,
    };
    setEvents([...events, newEvent]);
  };

  const updateEvent = (updatedEvent: CalendarEvent) => {
    setEvents(
      events.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  };

  const deleteEvent = (id: number) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  const value = {
    currentDate,
    setCurrentDate,
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    currentView,
    setCurrentView,
    selectedEvent,
    setSelectedEvent,
    weekDates,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}; 