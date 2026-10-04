<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;

class News extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'subtitle',
        'content',
        'views',
        'published_at',
        'status',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'views' => 'integer',
    ];

    /**
     * Noticias visibles para el público: publicadas y con fecha ya vencida.
     */
    public function scopePublished($query)
    {
        return $query
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'news_tag');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'category_news');
    }

    public function media(): HasMany
    {
        return $this->hasMany(NewsMedia::class)
            ->orderBy('order');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}