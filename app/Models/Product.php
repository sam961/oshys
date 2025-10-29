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
        'details',
        'image',
        'price',
        'category_id',
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

    /**
     * Fields that should be translatable
     */
    public array $translatable = [
        'name',
        'description',
        'details',
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
