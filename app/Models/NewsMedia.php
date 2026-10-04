<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NewsMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'news_id',
        'page_id',
        'type',
        'path',
        'title',
        'is_featured',
        'order',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * Noticia a la que pertenece el archivo.
     */
    public function news(): BelongsTo
    {
        return $this->belongsTo(News::class);
    }

    /**
     * Página institucional a la que pertenece el archivo.
     */
    public function page(): BelongsTo
    {
        return $this->belongsTo(InstitutionalPage::class, 'page_id');
    }
}