<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'message' => 'required|string|max:5000',
        ]);

        // Send email notification
        try {
            Mail::to('oshysoceans@gmail.com')->send(new ContactNotification($validated));
        } catch (\Exception $e) {
            \Log::error('Failed to send contact notification email: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to send message. Please try again later.'], 500);
        }

        return response()->json(['message' => 'Message sent successfully'], 200);
    }
}
