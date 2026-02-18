<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0891b2, #06b6d4); color: white; padding: 24px; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 22px; }
        .content { background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
        .field { margin-bottom: 16px; }
        .label { font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600; letter-spacing: 0.5px; }
        .value { font-size: 16px; color: #111827; margin-top: 4px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
        .badge-course { background: #dbeafe; color: #1d4ed8; }
        .badge-trip { background: #d1fae5; color: #059669; }
        .footer { text-align: center; margin-top: 20px; font-size: 13px; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 New {{ ucfirst($booking->bookable_type) }} Booking</h1>
    </div>
    <div class="content">
        <div class="field">
            <div class="label">Type</div>
            <div class="value">
                <span class="badge badge-{{ $booking->bookable_type }}">{{ ucfirst($booking->bookable_type) }}</span>
            </div>
        </div>
        <div class="field">
            <div class="label">{{ ucfirst($booking->bookable_type) }} Name</div>
            <div class="value">{{ $booking->bookable_name }}</div>
        </div>
        <div class="field">
            <div class="label">Price</div>
            <div class="value">{{ $booking->price }} SAR</div>
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <div class="field">
            <div class="label">Customer Name</div>
            <div class="value">{{ $booking->name }}</div>
        </div>
        <div class="field">
            <div class="label">Email</div>
            <div class="value"><a href="mailto:{{ $booking->email }}">{{ $booking->email }}</a></div>
        </div>
        <div class="field">
            <div class="label">Phone</div>
            <div class="value"><a href="tel:{{ $booking->phone }}">{{ $booking->phone }}</a></div>
        </div>
        @if($booking->notes)
        <div class="field">
            <div class="label">Notes</div>
            <div class="value">{{ $booking->notes }}</div>
        </div>
        @endif
        <div class="field">
            <div class="label">Submitted At</div>
            <div class="value">{{ $booking->created_at->format('M d, Y h:i A') }}</div>
        </div>
    </div>
    <div class="footer">
        Coral & Shells — Admin Notification
    </div>
</body>
</html>
