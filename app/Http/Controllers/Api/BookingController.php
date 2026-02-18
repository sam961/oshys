<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\BookingNotification;
use App\Models\Booking;
use App\Models\Course;
use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
    /**
     * Display a listing of bookings (admin).
     */
    public function index(Request $request)
    {
        $query = Booking::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('bookable_type', $request->type);
        }

        $bookings = $query->orderBy('created_at', 'desc')->get();

        return response()->json($bookings);
    }

    /**
     * Store a new booking (public endpoint).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:50',
            'bookable_type' => ['required', Rule::in(['course', 'trip'])],
            'bookable_id' => 'required|integer',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Get the bookable item (course or trip)
        $bookable = null;
        if ($validated['bookable_type'] === 'course') {
            $bookable = Course::findOrFail($validated['bookable_id']);
        } else {
            $bookable = Trip::findOrFail($validated['bookable_id']);
        }

        // Create the booking
        $booking = Booking::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'bookable_type' => $validated['bookable_type'],
            'bookable_id' => $validated['bookable_id'],
            'bookable_name' => $bookable->name,
            'price' => $bookable->price,
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        // Send email notification
        try {
            Mail::to('oshysoceans@gmail.com')->send(new BookingNotification($booking));
        } catch (\Exception $e) {
            \Log::error('Failed to send booking notification email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Booking submitted successfully',
            'booking' => $booking,
        ], 201);
    }

    /**
     * Display the specified booking.
     */
    public function show($id)
    {
        $booking = Booking::findOrFail($id);
        return response()->json($booking);
    }

    /**
     * Update the booking status (admin).
     */
    public function update(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        $validated = $request->validate([
            'status' => ['sometimes', Rule::in(['pending', 'confirmed', 'cancelled'])],
            'notes' => 'nullable|string|max:1000',
        ]);

        $booking->update($validated);

        return response()->json([
            'message' => 'Booking updated successfully',
            'booking' => $booking,
        ]);
    }

    /**
     * Remove the specified booking (admin).
     */
    public function destroy($id)
    {
        $booking = Booking::findOrFail($id);
        $booking->delete();

        return response()->json(['message' => 'Booking deleted successfully']);
    }
}
