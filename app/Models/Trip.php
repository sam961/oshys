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
        'image',
        'price',
        'category_id',
        'is_active',
        'is_featured',
        'included_items',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'included_items' => 'array',
    ];

    /**
     * Fields that should be translatable
     */
    public array $translatable = [
        'name',
        'description',
        'included_items',
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

    // Override toArray to include image_url
    public function toArray()
    {
        $array = parent::toArray();
        $array['image_url'] = $this->image_url;
        return $array;
    }
}
