<?php

namespace App\Traits;

use App\Models\Translation;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait Translatable
{
    /**
     * Get all translations for this model
     */
    public function translations(): MorphMany
    {
        return $this->morphMany(Translation::class, 'translatable');
    }

    /**
     * Get translation for a specific field and locale
     */
    public function getTranslation(string $field, ?string $locale = null): ?string
    {
        $locale = $locale ?? app()->getLocale();

        // Try to get translation from database
        $translation = $this->translations()
            ->where('field', $field)
            ->where('locale', $locale)
            ->value('value');

        // If translation exists, return it
        if ($translation !== null) {
            return $translation;
        }

        // Fallback to original field value (default language)
        return $this->attributes[$field] ?? null;
    }

    /**
     * Set translation for a specific field and locale
     */
    public function setTranslation(string $field, string $locale, ?string $value): void
    {
        $this->translations()->updateOrCreate(
            [
                'field' => $field,
                'locale' => $locale,
            ],
            [
                'value' => $value,
            ]
        );
    }

    /**
     * Get all translations for a specific field across all locales
     */
    public function getTranslations(string $field): array
    {
        $translations = $this->translations()
            ->where('field', $field)
            ->get()
            ->pluck('value', 'locale')
            ->toArray();

        // Include the original value as the default locale
        $defaultLocale = config('app.locale', 'en');
        if (isset($this->attributes[$field])) {
            $translations[$defaultLocale] = $this->attributes[$field];
        }

        return $translations;
    }

    /**
     * Save multiple translations at once
     *
     * @param array $translations ['field' => ['locale' => 'value']]
     */
    public function saveTranslations(array $translations): void
    {
        foreach ($translations as $field => $locales) {
            if (!is_array($locales)) {
                continue;
            }

            foreach ($locales as $locale => $value) {
                $this->setTranslation($field, $locale, $value);
            }
        }
    }

    /**
     * Delete all translations for this model
     */
    public function deleteTranslations(): void
    {
        $this->translations()->delete();
    }

    /**
     * Get attribute with automatic translation
     * Override Laravel's getAttribute to provide automatic translations
     */
    public function getAttributeValue($key)
    {
        $value = parent::getAttributeValue($key);

        // Check if this field should be translated
        if ($this->isTranslatableAttribute($key)) {
            $locale = app()->getLocale();
            $defaultLocale = config('app.locale', 'en');

            // If current locale is not the default, try to get translation
            if ($locale !== $defaultLocale) {
                $translation = $this->getTranslation($key, $locale);
                return $translation ?? $value;
            }
        }

        return $value;
    }

    /**
     * Check if an attribute should be translated
     */
    protected function isTranslatableAttribute(string $key): bool
    {
        return property_exists($this, 'translatable') && in_array($key, $this->translatable);
    }

    /**
     * Get model data with all translations included
     */
    public function toArrayWithTranslations(): array
    {
        $data = $this->toArray();

        if (property_exists($this, 'translatable')) {
            foreach ($this->translatable as $field) {
                $data[$field . '_translations'] = $this->getTranslations($field);
            }
        }

        return $data;
    }

    /**
     * Scope to eager load translations
     */
    public function scopeWithTranslations($query)
    {
        return $query->with('translations');
    }

    /**
     * Override toArray to automatically use translated values
     */
    public function toArray()
    {
        $data = parent::toArray();

        // Get current locale
        $locale = app()->getLocale();
        // Use hardcoded default locale 'en' since config might return current locale after middleware changes it
        $defaultLocale = 'en';

        // Only translate if not in default locale
        if ($locale !== $defaultLocale && property_exists($this, 'translatable')) {
            foreach ($this->translatable as $field) {
                if (isset($data[$field])) {
                    $translation = $this->getTranslation($field, $locale);
                    if ($translation !== null) {
                        $data[$field] = $translation;
                    }
                }
            }
        }

        return $data;
    }
}
