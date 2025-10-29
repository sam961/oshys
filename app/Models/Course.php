<?php

namespace App\Models;

use App\Traits\Translatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use SoftDeletes, Translatable;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'details',
        'image',
        'price',
        'duration',
        'level',
        'category_id',
        'is_active',
        'is_featured',
        'max_students',
        'requirements',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'requirements' => 'array',
    ];

    /**
     * Fields that should be translatable
     */
    public array $translatable = [
        'name',
        'description',
        'details',
        'requirements',
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
