<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Booking $booking)
    {
    }

    public function envelope(): Envelope
    {
        $type = ucfirst($this->booking->bookable_type);

        return new Envelope(
            subject: "New {$type} Booking: {$this->booking->bookable_name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.booking-notification',
        );
    }
}
