# PenePene — Guide de purge complète des caches (Laravel, Nginx, OPcache, navigateur)

## 1. Commande Artisan intégrée

La commande `app:purge-all-caches` exécute en séquence :

1. `cache:clear` — cache applicatif
2. `config:clear` — cache de configuration
3. `route:clear` — cache des routes
4. `view:clear` — cache des vues Blade compilées
5. `event:clear` — cache des événements
6. `opcache_reset()` — si OPcache est activé pour le process courant
7. Vérification/recréation forcée du lien symbolique `public/storage` → `storage/app/public`
8. Détection puis suppression (avec confirmation, ou `--dry-run` pour la prévisualisation)
   des fichiers physiques de `storage/app/public/` sans enregistrement correspondant en base
   (`product_images.image_path`, `categories.image`, `subcategories.image`, `sellers.logo/banner`,
   `users.avatar`, `chat_messages.attachment_path`, `products.image`).

```bash
php artisan app:purge-all-caches --dry-run   # voir les orphelins sans rien supprimer
php artisan app:purge-all-caches             # purge complète + suppression des orphelins
php artisan app:purge-all-caches --skip-orphans  # purge de caches uniquement
```

> ⚠️ OPcache : `opcache_reset()` depuis la CLI ne touche que le process CLI.
> Le cache de PHP-FPM est un process séparé — recharger le service FPM :
> `sudo systemctl reload php8.3-fpm` (adapter la version : `php*-fpm`).

## 2. Procédure SSH complète (Ubuntu, une seule ligne)

```bash
cd /var/www/penepene && php artisan app:purge-all-caches --force --no-interaction || php artisan app:purge-all-caches; sudo systemctl reload php*-fpm; sudo nginx -t && sudo systemctl reload nginx; sudo rm -rf bootstrap/cache/*.php storage/framework/views/* storage/framework/cache/data/* storage/framework/sessions/* 2>/dev/null; echo "✔ Purge terminée"
```

Variante pas-à-pas :

```bash
cd /var/www/penepene
php artisan down --retry=30               # (optionnel) page de maintenance pendant la purge
php artisan app:purge-all-caches
sudo systemctl reload php8.3-fpm          # purge OPcache côté FPM
sudo nginx -t && sudo systemctl reload nginx
php artisan up
sudo chown -R www-data:www-data storage bootstrap/cache   # remettre les droits
```

## 3. Cache Nginx

La configuration à appliquer se trouve dans [`deploy/nginx-anti-cache.conf`](../deploy/nginx-anti-cache.conf) :
`Cache-Control: no-cache, must-revalidate, max-age=0` sur les médias (`.jpg|.png|.css|.js`…),
sur `/storage/` et `no-store` sur les routes dynamiques, avec désactivation de tout
`fastcgi_cache`/`proxy_cache`.

```bash
sudo nano /etc/nginx/sites-available/penepene    # appliquer les blocs location du fichier conf
sudo nginx -t && sudo systemctl reload nginx
```

## 4. Cache navigateur (côté client / support)

- **Dur :** `Ctrl+Shift+R` (Windows/Linux) ou `Cmd+Shift+R` (macOS) — rechargement sans cache.
- **Complet :** DevTools (F12) → onglet Network → « Disable cache », ou
  DevTools → clic droit sur le bouton Recharger → « Purger le cache et effectuer un rechargement complet ».
- Les Service Workers éventuels : DevTools → Application → Service Workers → Unregister.

## 5. Vérifications post-purge

```bash
# Lien symbolique correct
ls -la /var/www/penepene/public/storage

# Plus aucun fichier orphelin
php artisan app:purge-all-caches --dry-run | grep "orphelin"
# doit afficher : "Aucun fichier orphelin détecté"

# Headers HTTP bien appliqués
curl -sI https://votre-domaine.com/storage/quelconque.jpg | grep -i cache-control
# attendu : Cache-Control: no-cache, must-revalidate, max-age=0

# OPcache rechargé
php -r 'var_dump(function_exists("opcache_reset"));'
```
