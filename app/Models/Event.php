<?php

namespace App\Models;

use App\Traits\Translatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    use SoftDeletes, Translatable;

    protected $fillable = [
        'title',
        'description',
        'type',
        'start_date',
        'end_date',
        'location',
        'is_active',
        'max_participants',
        'price',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
    ];

    /**
     * Fields that should be translatable
     */
    public array $translatable = [
        'title',
        'description',
        'location',
    ];

    // Relationships
    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }
}
