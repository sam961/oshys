<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 24px; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 22px; }
        .content { background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
        .field { margin-bottom: 16px; }
        .label { font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600; letter-spacing: 0.5px; }
        .value { font-size: 16px; color: #111827; margin-top: 4px; }
        .message-box { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 4px; white-space: pre-wrap; }
        .footer { text-align: center; margin-top: 20px; font-size: 13px; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="header">
        <h1>💬 New Contact Message</h1>
    </div>
    <div class="content">
        <div class="field">
            <div class="label">Name</div>
            <div class="value">{{ $data['name'] }}</div>
        </div>
        <div class="field">
            <div class="label">Email</div>
            <div class="value"><a href="mailto:{{ $data['email'] }}">{{ $data['email'] }}</a></div>
        </div>
        @if(!empty($data['phone']))
        <div class="field">
            <div class="label">Phone</div>
            <div class="value"><a href="tel:{{ $data['phone'] }}">{{ $data['phone'] }}</a></div>
        </div>
        @endif
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <div class="field">
            <div class="label">Message</div>
            <div class="message-box">{{ $data['message'] }}</div>
        </div>
    </div>
    <div class="footer">
        Coral & Shells — Contact Form Submission
    </div>
</body>
</html>
