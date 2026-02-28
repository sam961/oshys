<?php

namespace App\Models;

use App\Traits\Translatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes, Translatable;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'price',

        'in_stock',
        'is_active',
        'is_featured',
        'stock_quantity',
        'sku',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'in_stock' => 'boolean',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    protected $appends = ['image_url'];

    /**
     * Fields that should be translatable
     */
    public array $translatable = [
        'name',
        'description',
    ];

    // Relationships
    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
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
