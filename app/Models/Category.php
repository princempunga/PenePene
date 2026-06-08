<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'icon', 'image', 'description',
        'meta_title', 'meta_description', 'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    protected static function booted(): void
    {
        static::creating(function (self $cat) {
            if (empty($cat->slug)) {
                $cat->slug = Str::slug($cat->name);
            }
        });
    }

    public function scopeActive($q) { return $q->where('is_active', true); }

    public function subcategories() { return $this->hasMany(Subcategory::class); }
    public function products()      { return $this->hasMany(Product::class); }

    public function getProductCountAttribute(): int
    {
        return $this->products()->where('status', 'active')->count();
    }

    public function getRouteKeyName(): string { return 'slug'; }
}
