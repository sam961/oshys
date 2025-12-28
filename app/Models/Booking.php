<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Booking extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'bookable_type',
        'bookable_id',
        'bookable_name',
        'price',
        'status',
        'notes',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    /**
     * Get the bookable model (Course or Trip).
     */
    public function bookable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope for pending bookings.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for confirmed bookings.
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }
}
