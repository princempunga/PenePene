<?php

namespace App\Support;

class Translations
{
    public static function get(string $key, ?string $locale = null): string
    {
        $translations = self::forLocale($locale ?? app()->getLocale());
        $parts = explode('.', $key);
        $value = $translations;

        foreach ($parts as $part) {
            if (! is_array($value) || ! array_key_exists($part, $value)) {
                return $key;
            }
            $value = $value[$part];
        }

        return is_string($value) ? $value : $key;
    }

    public static function forLocale(string $locale): array
    {
        $fallback = config('app.fallback_locale', 'fr');
        $base = self::loadJson($fallback);

        if ($locale === $fallback) {
            return $base;
        }

        return array_replace_recursive($base, self::loadJson($locale));
    }

    private static function loadJson(string $locale): array
    {
        $path = lang_path("{$locale}.json");

        if (! is_file($path)) {
            return [];
        }

        $decoded = json_decode(file_get_contents($path), true);

        return is_array($decoded) ? $decoded : [];
    }
}
