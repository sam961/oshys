<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    protected $fillable = [
        'filename',
        'path',
        'url',
        'mime_type',
        'size',
        'imageable_id',
        'imageable_type',
        'collection',
        'order',
    ];

    protected $appends = ['full_url'];

    public function getFullUrlAttribute()
    {
        return asset('storage/' . $this->path);
    }

    // Polymorphic relationship
    public function imageable()
    {
        return $this->morphTo();
    }
}
