import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Check, X, Clock, Mail, Phone, User, GraduationCap, Compass, Eye } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { useGetBookingsQuery, useUpdateBookingMutation, useDeleteBookingMutation } from '../../services/api';
import type { Booking } from '../../types';
import toast from 'react-hot-toast';

export const BookingsManagement: React.FC = () => {
  const { data: bookings = [], isLoading, error } = useGetBookingsQuery({});
  const [updateBooking] = useUpdateBookingMutation();
  const [deleteBooking] = useDeleteBookingMutation();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredBookings = bookings.filter((booking) => {
    const statusMatch = filterStatus === 'all' || booking.status === filterStatus;
    const typeMatch = filterType === 'all' || booking.bookable_type === filterType;
    return statusMatch && typeMatch;
  });

  const columns = [
    {
      header: 'Customer',
      accessor: 'name',
      render: (value: string, row: Booking) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {row.email}
          </div>
        </div>
      ),
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (value: string) => (
        <div className="flex items-center gap-1 text-gray-600">
          <Phone className="w-4 h-4" />
          {value}
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'bookable_type',
      render: (value: string) => (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'course'
            ? 'bg-accent-100 text-accent-700'
            : 'bg-secondary-100 text-secondary-700'
        }`}>
          {value === 'course' ? <GraduationCap className="w-3 h-3" /> : <Compass className="w-3 h-3" />}
          {value === 'course' ? 'Course' : 'Trip'}
        </span>
      ),
    },
    {
      header: 'Item',
      accessor: 'bookable_name',
      render: (value: string) => (
        <div className="font-medium text-gray-900 max-w-[200px] truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (value: string) => (
        <span className="font-semibold text-primary-600">SAR {value}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          value === 'confirmed' ? 'bg-green-100 text-green-700' :
          'bg-red-100 text-red-700'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'created_at',
      render: (value: string) => (
        <div className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      ),
    },
  ];

  const handleStatusChange = async (booking: Booking, newStatus: 'pending' | 'confirmed' | 'cancelled') => {
    if (booking.status === newStatus) return;
    try {
      await updateBooking({
        id: booking.id,
        data: { status: newStatus },
      }).unwrap();
      toast.success(`Booking status updated to ${newStatus}`);
      if (selectedBooking?.id === booking.id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (error) {
      toast.error('Failed to update booking status');
      console.error('Update error:', error);
    }
  };

  const handleDelete = async (booking: Booking) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteBooking(booking.id).unwrap();
        toast.success('Booking deleted successfully');
      } catch (error) {
        toast.error('Failed to delete booking');
        console.error('Delete error:', error);
      }
    }
  };

  const handleView = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Failed to load bookings. Please try again.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Requests</h1>
          <p className="text-gray-600">Manage course and trip registration requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-100 rounded-lg">
              <ClipboardList className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Confirmed</div>
              <div className="text-2xl font-bold text-green-600">{confirmedCount}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Cancelled</div>
              <div className="text-2xl font-bold text-red-600">{cancelledCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
            >
              <option value="all">All Types</option>
              <option value="course">Courses</option>
              <option value="trip">Trips</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredBookings}
        onView={handleView}
        onDelete={handleDelete}
        customActions={(item: Booking) => (
          <div className="flex items-center gap-2">
            <select
              value={item.status}
              onChange={(e) => handleStatusChange(item, e.target.value as 'pending' | 'confirmed' | 'cancelled')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                item.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              }`}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}
      />

      {/* View Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <User className="w-10 h-10 text-gray-400 p-2 bg-white rounded-full" />
                <div>
                  <div className="font-semibold text-gray-900">{selectedBooking.name}</div>
                  <div className="text-sm text-gray-500">{selectedBooking.email}</div>
                  <div className="text-sm text-gray-500">{selectedBooking.phone}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Type</div>
                  <div className="font-semibold flex items-center gap-2">
                    {selectedBooking.bookable_type === 'course' ? (
                      <GraduationCap className="w-4 h-4 text-accent-600" />
                    ) : (
                      <Compass className="w-4 h-4 text-secondary-600" />
                    )}
                    {selectedBooking.bookable_type === 'course' ? 'Course' : 'Trip'}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Status</div>
                  <select
                    value={selectedBooking.status}
                    onChange={(e) => handleStatusChange(selectedBooking, e.target.value as 'pending' | 'confirmed' | 'cancelled')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Item</div>
                <div className="font-semibold text-gray-900">{selectedBooking.bookable_name}</div>
              </div>

              <div className="p-4 bg-primary-50 rounded-lg">
                <div className="text-sm text-primary-600 mb-1">Price</div>
                <div className="text-2xl font-bold text-primary-600">SAR {selectedBooking.price}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Submitted On</div>
                <div className="font-medium text-gray-900">
                  {new Date(selectedBooking.created_at).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Notes</div>
                  <div className="text-gray-900">{selectedBooking.notes}</div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
