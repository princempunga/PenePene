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
        'meta_title', 'meta_description', 'is_active', 'sort_order', 'parent_id',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'parent_id' => 'integer',
        ];
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

    public function parent() { return $this->belongsTo(Category::class, 'parent_id'); }
    public function children() { return $this->hasMany(Category::class, 'parent_id')->orderBy('sort_order')->orderBy('name'); }

    // Backward-compatibility alias with older code that still expects subcategories().
    public function subcategories() { return $this->children(); }

    public function products() { return $this->hasMany(Product::class); }

    public function getProductCountAttribute(): int
    {
        return $this->products()->where('status', 'active')->count();
    }

    public function getRouteKeyName(): string { return 'slug'; }
}
