<?php

namespace App\Models;

use App\Traits\Translatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Trip extends Model
{
    use SoftDeletes, Translatable;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'details',
        'image',
        'price',
        'location',
        'duration',
        'difficulty',
        'category_id',
        'is_active',
        'is_featured',
        'certification_required',
        'max_participants',
        'included_items',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'certification_required' => 'boolean',
        'included_items' => 'array',
    ];

    /**
     * Fields that should be translatable
     */
    public array $translatable = [
        'name',
        'description',
        'details',
        'location',
        'included_items',
    ];

    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }
}
