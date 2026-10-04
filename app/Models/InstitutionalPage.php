<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InstitutionalPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'subtitle',
        'content',
        'status',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    /**
     * Usuario que creó la página.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Archivos multimedia asociados a la página.
     *
     * Se utiliza la misma tabla news_media
     * que utilizan las noticias.
     */
    public function media(): HasMany
    {
        return $this->hasMany(NewsMedia::class, 'page_id')
            ->orderBy('order');
    }

    /**
     * Elementos de botonera que apuntan a esta página.
     */
    public function menuItems(): HasMany
    {
        return $this->hasMany(MenuItem::class, 'page_id');
    }
}