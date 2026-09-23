<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\News;

class PublishScheduleNews extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'news:publish-scheduled';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Publica las noticias programadas cuya fecha de publicación ya llegó.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $news = News::where('status', 'scheduled')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->get();

        if ($news->isEmpty()) {
            $this->info('No hay noticias programadas para publicar.');

            return self::SUCCESS;
        }

        foreach ($news as $item) {
            $item->update([
                'status' => 'published',
            ]);
        }

        $this->info("Se publicaron {$news->count()} noticia(s).");

        return self::SUCCESS;
    }
}
