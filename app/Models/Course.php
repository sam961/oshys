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
        'subtitle',
        'slug',
        'description',
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

    protected $appends = ['image_url'];

    /**
     * Fields that should be translatable
     */
    public array $translatable = [
        'name',
        'subtitle',
        'description',
        'requirements',
    ];

    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->morphMany(Image::class, 'imageable')->orderBy('order');
    }

    public function mainImage()
    {
        return $this->morphOne(Image::class, 'imageable')->where('collection', 'main');
    }

    // Accessors
    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return asset('storage/' . $this->image);
        }
        return null;
    }

}
