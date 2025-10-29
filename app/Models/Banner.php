<?php

namespace App\Models;

use App\Traits\Translatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Banner extends Model
{
    use HasFactory, SoftDeletes, Translatable;

    protected $fillable = [
        'title',
        'description',
        'image',
        'button_text',
        'button_link',
        'position',
        'display_order',
        'is_active',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'display_order' => 'integer',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    /**
     * Fields that should be translatable
     */
    public array $translatable = [
        'title',
        'description',
        'button_text',
    ];
}
