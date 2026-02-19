<?php

namespace App\Models;

use App\Traits\Translatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TeamMember extends Model
{
    use SoftDeletes, Translatable;

    protected $fillable = [
        'name',
        'role',
        'bio',
        'image',
        'email',
        'phone',
        'experience',
        'certifications',
        'social_links',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'certifications' => 'array',
        'social_links' => 'array',
        'is_active' => 'boolean',
    ];

    protected $appends = ['image_url'];

    /**
     * Fields that should be translatable
     */
    public array $translatable = [
        'name',
        'role',
        'bio',
        'experience',
    ];

    /**
     * Get the image URL accessor
     */
    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return asset('storage/' . $this->image);
        }
        return null;
    }

    // Relationships
    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }
}
