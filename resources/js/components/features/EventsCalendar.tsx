import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '../ui';
import { useGetEventsQuery } from '../../services/api';
import type { Event } from '../../types';

export const EventsCalendar: React.FC = () => {
  const [currentMonth] = useState(new Date());

  // Fetch events from API
  const { data: eventsData = [], isLoading: eventsLoading, error: eventsError } = useGetEventsQuery({ active: true });

  // Format events by date for easy lookup
  const eventsByDate = eventsData.reduce((acc, event) => {
    const dateKey = new Date(event.start_date).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, typeof eventsData>);

  // Get month name
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const monthName = monthNames[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  // Get days in month
  const daysInMonth = new Date(year, currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, currentMonth.getMonth(), 1).getDay();

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Check if a day has events
  const hasEvents = (day: number | null) => {
    if (!day) return false;
    const date = new Date(year, currentMonth.getMonth(), day);
    return eventsByDate[date.toDateString()]?.length > 0;
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {monthName} {year}
          </h3>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-sm
                ${day ? 'hover:bg-primary-50 cursor-pointer transition-colors' : ''}
                ${hasEvents(day) ? 'bg-primary-100 text-primary-700 font-bold' : 'text-gray-700'}
                ${!day ? 'pointer-events-none' : ''}
              `}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary-100 rounded"></div>
            <span className="text-gray-600">Has Events</span>
          </div>
        </div>
      </motion.div>

      {/* Events List */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h3>
        {eventsLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
          </div>
        ) : eventsError ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg p-6">
            <p className="text-red-600">Failed to load events. Please try again later.</p>
          </div>
        ) : eventsData.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600">No upcoming events at the moment.</p>
          </div>
        ) : (
          eventsData.map((event) => (
            <motion.div
              key={event.id}
              whileHover={{ x: 5 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-primary-600"
            >
              <div className="flex items-start gap-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <CalendarIcon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1">{event.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                    <span>
                      {new Date(event.start_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span>
                      {new Date(event.start_date).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                      {event.type}
                    </span>
                    {event.location && (
                      <span className="text-gray-600">{event.location}</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};
