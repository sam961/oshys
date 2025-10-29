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

    // Polymorphic relationship
    public function imageable()
    {
        return $this->morphTo();
    }
}
