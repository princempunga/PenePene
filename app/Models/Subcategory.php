<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Subcategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'name', 'slug', 'icon', 'image', 'description',
        'meta_title', 'meta_description', 'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    protected static function booted(): void
    {
        static::creating(function (self $sub) {
            if (empty($sub->slug)) {
                $sub->slug = Str::slug($sub->name);
            }
        });
    }

    public function scopeActive($q) { return $q->where('is_active', true); }

    public function category() { return $this->belongsTo(Category::class); }
    public function products() { return $this->hasMany(Product::class); }

    public function getRouteKeyName(): string { return 'slug'; }
}
