import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, ArrowRight, X } from 'lucide-react';
import { Button } from '../ui';
import { useGetEventsQuery } from '../../services/api';
import type { Event } from '../../types';

export const EventsCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [mobilePopup, setMobilePopup] = useState<{ date: Date; events: Event[] } | null>(null);
  const navigate = useNavigate();

  // Fetch events from API
  const { data: eventsData = [], isLoading: eventsLoading, error: eventsError } = useGetEventsQuery({ active: true });

  // Navigate months
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Filter upcoming events (future events only)
  const now = new Date();
  const upcomingEvents = eventsData
    .filter(event => new Date(event.start_date) >= now)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 5); // Show only 5 upcoming events

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

  // Get events for a specific day
  const getEventsForDay = (day: number | null): Event[] => {
    if (!day) return [];
    const date = new Date(year, currentMonth.getMonth(), day);
    return eventsByDate[date.toDateString()] || [];
  };

  // Handle day click
  const handleDayClick = (day: number | null) => {
    if (!day) return;
    const clickedDate = new Date(year, currentMonth.getMonth(), day);
    const dayEvents = getEventsForDay(day);

    // On mobile, show popup if there are events
    if (window.innerWidth < 1024 && dayEvents.length > 0) {
      if (dayEvents.length === 1) {
        // If only one event, navigate directly to it
        navigate(`/events/${dayEvents[0].id}`);
      } else {
        // If multiple events, show popup
        setMobilePopup({ date: clickedDate, events: dayEvents });
      }
    } else {
      setSelectedDate(clickedDate);
    }
  };

  // Get events for selected date
  const selectedDateEvents = selectedDate
    ? eventsByDate[selectedDate.toDateString()] || []
    : [];

  // Check if a date is selected
  const isDateSelected = (day: number | null) => {
    if (!day || !selectedDate) return false;
    const date = new Date(year, currentMonth.getMonth(), day);
    return date.toDateString() === selectedDate.toDateString();
  };

  // Check if a date is today
  const isToday = (day: number | null) => {
    if (!day) return false;
    const date = new Date(year, currentMonth.getMonth(), day);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-2xl shadow-lg p-4 lg:p-6"
      >
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
            {monthName} {year}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <div key={idx} className="text-center text-xs lg:text-sm font-semibold text-gray-600 py-1 lg:py-2">
              <span className="lg:hidden">{day}</span>
              <span className="hidden lg:inline">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][idx]}</span>
            </div>
          ))}
        </div>

        {/* Calendar days - Mobile optimized with events shown */}
        <div className="grid grid-cols-7 gap-1 lg:gap-2">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            return (
              <motion.div
                key={index}
                onClick={() => handleDayClick(day)}
                whileHover={day ? { scale: 1.02 } : {}}
                whileTap={day ? { scale: 0.98 } : {}}
                className={`
                  min-h-[60px] lg:aspect-square flex flex-col items-center justify-start p-1 lg:p-2 rounded-lg text-xs lg:text-sm font-medium
                  transition-all duration-200 relative
                  ${day ? 'cursor-pointer' : 'pointer-events-none'}
                  ${isDateSelected(day)
                    ? 'bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-lg ring-2 ring-primary-300 ring-offset-1'
                    : hasEvents(day)
                      ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                  ${isToday(day) && !isDateSelected(day) ? 'ring-2 ring-primary-400' : ''}
                `}
              >
                <span className={`${isDateSelected(day) ? 'text-white' : ''}`}>{day}</span>
                {/* Show event indicators on mobile */}
                {dayEvents.length > 0 && (
                  <div className="mt-1 w-full space-y-0.5 lg:hidden">
                    {dayEvents.slice(0, 2).map((event, i) => (
                      <div
                        key={i}
                        className={`text-[8px] leading-tight truncate px-0.5 rounded ${
                          isDateSelected(day)
                            ? 'bg-white/30 text-white'
                            : 'bg-primary-200 text-primary-800'
                        }`}
                      >
                        {event.title.length > 8 ? event.title.slice(0, 8) + '..' : event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className={`text-[8px] ${isDateSelected(day) ? 'text-white/80' : 'text-primary-600'}`}>
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                )}
                {/* Desktop dot indicator */}
                {hasEvents(day) && !isDateSelected(day) && (
                  <div className="hidden lg:block absolute bottom-1 w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Legend - Hidden on mobile */}
        <div className="hidden lg:flex mt-6 items-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary-100 rounded"></div>
            <span className="text-gray-600">Has Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-br from-primary-600 to-accent-600 rounded"></div>
            <span className="text-gray-600">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-primary-400 rounded"></div>
            <span className="text-gray-600">Today</span>
          </div>
        </div>

        {/* Mobile: View All Events link */}
        <div className="lg:hidden mt-4 text-center">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
          >
            View All Events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Desktop: Clear selection */}
        {selectedDate && (
          <div className="hidden lg:block mt-4">
            <button
              onClick={() => setSelectedDate(null)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              ← Clear selection
            </button>
          </div>
        )}
      </motion.div>

      {/* Mobile Event Popup */}
      <AnimatePresence>
        {mobilePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden flex items-end justify-center bg-black/50"
            onClick={() => setMobilePopup(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white w-full max-h-[70vh] rounded-t-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-bold text-lg">
                  {mobilePopup.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </h3>
                <button
                  onClick={() => setMobilePopup(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
                {mobilePopup.events.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="block bg-primary-50 rounded-xl p-4 hover:bg-primary-100 transition-colors"
                    onClick={() => setMobilePopup(null)}
                  >
                    <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{event.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>
                        {new Date(event.start_date).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="px-2 py-0.5 bg-primary-200 text-primary-700 rounded-full capitalize">
                        {event.type}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events List - Hidden on mobile */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="hidden lg:block space-y-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {selectedDate
              ? `Events on ${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
              : 'Upcoming Events'
            }
          </h3>
          {selectedDate && (
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
              {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'Event' : 'Events'}
            </span>
          )}
        </div>
        {eventsLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
          </div>
        ) : eventsError ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg p-6">
            <p className="text-red-600">Failed to load events. Please try again later.</p>
          </div>
        ) : selectedDate ? (
          // Show events for selected date
          selectedDateEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg p-6">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">No events on this date.</p>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                View upcoming events
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDateEvents.map((event) => (
                <Link key={event.id} to={`/events/${event.id}`} className="block">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ x: 5 }}
                    className="bg-gradient-to-r from-white to-primary-50 rounded-xl shadow-lg p-6 border-l-4 border-primary-600 cursor-pointer hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-primary-600 p-3 rounded-lg">
                        <CalendarIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1 hover:text-primary-600 transition-colors">{event.title}</h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{event.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                          <span>
                            {new Date(event.start_date).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold capitalize">
                            {event.type}
                          </span>
                          {event.location && (
                            <span className="text-gray-600">{event.location}</span>
                          )}
                        </div>
                        <div className="mt-3 flex items-center gap-1 text-primary-600 text-sm font-medium">
                          View Details <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
              <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors flex items-center gap-2"
                >
                  <CalendarIcon className="w-4 h-4" />
                  View upcoming events
                </button>
                <Link
                  to="/events"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors flex items-center gap-2"
                >
                  All Events <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg p-6">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No upcoming events at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`} className="block">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-primary-600 cursor-pointer hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <CalendarIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1 hover:text-primary-600 transition-colors">{event.title}</h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{event.description}</p>
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
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold capitalize">
                          {event.type}
                        </span>
                        {event.location && (
                          <span className="text-gray-600">{event.location}</span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-primary-600 text-sm font-medium">
                        View Details <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
            <div className="mt-4 text-center">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                View All Events <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
