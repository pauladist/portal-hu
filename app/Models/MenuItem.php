<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'title',
        'destination_type',
        'page_id',
        'url',
        'file_path',
        'order',
        'is_active',
        'is_quick_link',
        'quick_link_order',
    ];

    protected $casts = [
        'order' => 'integer',
        'is_active' => 'boolean',
        'is_quick_link' => 'boolean',
        'quick_link_order' => 'integer',
    ];

    /**
     * Elemento padre.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class, 'parent_id');
    }

    /**
     * Elementos hijos.
     */
    public function children(): HasMany
    {
        return $this->hasMany(MenuItem::class, 'parent_id')
            ->orderBy('order')
            ->with(['children', 'page']);
    }

    /**
     * Página institucional a la que apunta el botón.
     */
    public function page(): BelongsTo
    {
        return $this->belongsTo(InstitutionalPage::class, 'page_id');
    }

    /**
     * Botonera pública (navbar): solo botones activos,
     * con la página institucional asociada para poder armar el link.
     */
    public static function publicTree()
    {
        return static::query()
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->with([
                'page:id,slug',
                'children' => fn ($query) => $query
                    ->where('is_active', true)
                    ->with('page:id,slug')
                    ->orderBy('order'),
            ])
            ->orderBy('order')
            ->get();
    }

    /**
     * Accesos rápidos públicos (cards debajo del hero).
     */
    public static function publicQuickLinks()
    {
        return static::query()
            ->where('is_active', true)
            ->where('is_quick_link', true)
            ->with('page:id,slug')
            ->orderBy('quick_link_order')
            ->get();
    }
}