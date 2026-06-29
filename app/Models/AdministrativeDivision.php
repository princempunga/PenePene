<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdministrativeDivision extends Model
{
    protected $fillable = [
        'parent_id', 'level', 'name', 'code', 'slug', 'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('sort_order')->orderBy('name');
    }

    public function activeChildren(): HasMany
    {
        return $this->children()->where('is_active', true);
    }

    public function proposals(): HasMany
    {
        return $this->hasMany(Proposal::class, 'division_id');
    }

    /** @return array<int, self> */
    public function ancestors(): array
    {
        $ancestors = [];
        $current = $this->parent;

        while ($current) {
            $ancestors[] = $current;
            $current = $current->parent;
        }

        return $ancestors;
    }

    public function divisionAtLevel(string $level): ?self
    {
        if ($this->level === $level) {
            return $this;
        }

        foreach ($this->ancestors() as $ancestor) {
            if ($ancestor->level === $level) {
                return $ancestor;
            }
        }

        return null;
    }

    public function isDescendantOf(int $divisionId): bool
    {
        $current = $this;

        while ($current) {
            if ($current->id === $divisionId) {
                return true;
            }
            $current = $current->parent;
        }

        return false;
    }
}
