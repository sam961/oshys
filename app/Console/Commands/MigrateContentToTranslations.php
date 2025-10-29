<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\Course;
use App\Models\Trip;
use App\Models\BlogPost;
use App\Models\Category;
use Illuminate\Console\Command;

class MigrateContentToTranslations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'translations:migrate
                           {--model= : Specific model to migrate (Product, Course, Trip, BlogPost, Category)}
                           {--dry-run : Run without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate existing content to use the polymorphic translation table';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $isDryRun = $this->option('dry-run');
        $specificModel = $this->option('model');

        $this->info('Starting content migration to translations table...');

        if ($isDryRun) {
            $this->warn('DRY RUN MODE - No changes will be made');
        }

        $models = $specificModel
            ? [$specificModel]
            : ['Product', 'Course', 'Trip', 'BlogPost', 'Category'];

        foreach ($models as $modelName) {
            $this->migrateModel($modelName, $isDryRun);
        }

        $this->info('Migration completed!');
    }

    /**
     * Migrate a specific model
     */
    protected function migrateModel(string $modelName, bool $isDryRun)
    {
        $modelClass = "App\\Models\\{$modelName}";

        if (!class_exists($modelClass)) {
            $this->error("Model {$modelName} does not exist");
            return;
        }

        $this->info("\nMigrating {$modelName}...");

        $model = new $modelClass;

        // Check if model has translatable trait
        if (!property_exists($model, 'translatable')) {
            $this->warn("{$modelName} does not have translatable fields");
            return;
        }

        $items = $modelClass::all();
        $bar = $this->output->createProgressBar($items->count());

        $migratedCount = 0;

        foreach ($items as $item) {
            // Check if item already has translations
            $existingTranslations = $item->translations()->count();

            if ($existingTranslations > 0) {
                $this->newLine();
                $this->comment("  {$modelName} #{$item->id} already has translations, skipping...");
                $bar->advance();
                continue;
            }

            // For new translation system, we don't need to migrate data
            // because the original content remains in the model's fields
            // and serves as the default (English) version.
            // Translations will be added through the admin panel.

            if (!$isDryRun) {
                // Optionally, you can create placeholder Arabic translations here
                // Uncomment the following if you want empty Arabic placeholders:
                /*
                foreach ($model->translatable as $field) {
                    if (!empty($item->{$field})) {
                        $item->setTranslation($field, 'ar', '');
                    }
                }
                */
            }

            $migratedCount++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();

        if ($isDryRun) {
            $this->info("  Would migrate {$migratedCount} {$modelName}(s)");
        } else {
            $this->info("  Successfully processed {$migratedCount} {$modelName}(s)");
        }

        $this->line("  Note: Existing content serves as English (default) translation.");
        $this->line("  Add Arabic translations through the admin panel.");
    }
}
