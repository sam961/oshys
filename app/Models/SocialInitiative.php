<?php

namespace App\Models;

use App\Traits\Translatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SocialInitiative extends Model
{
    use SoftDeletes, Translatable;

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'image',
        'category_id',
        'is_published',
        'is_featured',
        'published_at',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'is_featured' => 'boolean',
        'published_at' => 'datetime',
    ];

    public array $translatable = [
        'title',
        'excerpt',
        'content',
    ];

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return asset('storage/' . $this->image);
        }
        return null;
    }

    public function toArray()
    {
        $array = parent::toArray();
        $array['image_url'] = $this->image_url;
        return $array;
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
