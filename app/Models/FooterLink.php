<?php

namespace App\Models;

use App\Traits\Translatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class FooterLink extends Model
{
    use HasFactory, SoftDeletes, Translatable;

    protected $fillable = [
        'title',
        'slug',
        'url',
        'content',
        'display_order',
        'is_active',
        'open_in_new_tab',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'open_in_new_tab' => 'boolean',
        'display_order' => 'integer',
    ];

    /**
     * Fields that should be translatable
     */
    public array $translatable = [
        'title',
        'content',
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($footerLink) {
            if (empty($footerLink->slug)) {
                $footerLink->slug = Str::slug($footerLink->title);
            }
            // Auto-set URL to the page route if not provided
            if (empty($footerLink->url)) {
                $footerLink->url = '/pages/' . $footerLink->slug;
            }
        });

        static::updating(function ($footerLink) {
            // Update slug if title changed and slug wasn't manually set
            if ($footerLink->isDirty('title') && !$footerLink->isDirty('slug')) {
                $footerLink->slug = Str::slug($footerLink->title);
                // Update URL to match new slug
                $footerLink->url = '/pages/' . $footerLink->slug;
            }
        });
    }
}
