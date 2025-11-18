<?php

namespace App\Http\Controllers\Api;

trait TranslatableController
{
    /**
     * Transform collection with translations
     */
    protected function transformWithTranslations($items)
    {
        if ($items instanceof \Illuminate\Pagination\LengthAwarePaginator) {
            $items->getCollection()->transform(function ($item) {
                return $this->addTranslationsToItem($item);
            });
            return $items;
        }

        return $items->map(function ($item) {
            return $this->addTranslationsToItem($item);
        });
    }

    /**
     * Add translations to a single item
     */
    protected function addTranslationsToItem($item)
    {
        if (!method_exists($item, 'toArrayWithTranslations')) {
            return $item;
        }

        return $item->toArrayWithTranslations();
    }

    /**
     * Save translations from request
     * Expects request data like:
     * {
     *   "name": "English Name",
     *   "name_translations": {
     *     "ar": "Arabic Name"
     *   },
     *   "description": "English Description",
     *   "description_translations": {
     *     "ar": "Arabic Description"
     *   }
     * }
     */
    protected function saveTranslationsFromRequest($model, $request)
    {
        if (!method_exists($model, 'saveTranslations')) {
            return;
        }

        $translations = [];

        // Get translatable fields from model
        if (!property_exists($model, 'translatable')) {
            return;
        }

        foreach ($model->translatable as $field) {
            $translationKey = $field . '_translations';

            if ($request->has($translationKey)) {
                $value = $request->input($translationKey);

                // Handle JSON string (from FormData)
                if (is_string($value)) {
                    $decoded = json_decode($value, true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        $translations[$field] = $decoded;
                    }
                }
                // Handle array (from regular JSON request)
                elseif (is_array($value)) {
                    $translations[$field] = $value;
                }
            }
        }

        if (!empty($translations)) {
            $model->saveTranslations($translations);
        }
    }
}
