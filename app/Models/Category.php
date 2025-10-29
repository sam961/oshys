<?php

namespace App\Models;

use App\Traits\Translatable;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use Translatable;
    protected $fillable = [
        'name',
        'slug',
        'description',
        'type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Fields that should be translatable
     */
    public array $translatable = [
        'name',
        'description',
    ];

    // Relationships
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    public function trips()
    {
        return $this->hasMany(Trip::class);
    }

    public function blogPosts()
    {
        return $this->hasMany(BlogPost::class);
    }
}
