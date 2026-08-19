# 🎯 Référence Rapide - Commandes Essentielles pour PenePene sur Ubuntu

## 🚀 DÉPLOIEMENT INITIAL

### Option 1: Script automatisé (RECOMMANDÉ)
```bash
# Copier le script sur le serveur et l'exécuter
sudo bash /var/www/penepene/deploy.sh
```

### Option 2: Commandes manuelles
```bash
cd /var/www/penepene

# Nettoyer et mettre à jour
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan db:seed --class=SuperAdminSeeder
php artisan db:seed --class=DemoUsersSeeder

# Lien symbolique et caches
php artisan storage:link
php artisan config:cache
php artisan route:cache

# Permissions
sudo chown -R www-data:www-data /var/www/penepene
sudo chmod -R 775 /var/www/penepene/storage
sudo systemctl restart php-fpm nginx
```

---

## 🔍 DÉBOGAGE - LIRE LES LOGS

### Logs Laravel (les PLUS importants)
```bash
# Voir les dernières erreurs en temps réel
tail -f /var/www/penepene/storage/logs/laravel.log

# Voir les 100 dernières lignes
tail -100 /var/www/penepene/storage/logs/laravel.log

# Chercher les erreurs spécifiques
grep "ERROR" /var/www/penepene/storage/logs/laravel.log | tail -20
grep "Exception" /var/www/penepene/storage/logs/laravel.log | tail -20

# Effacer les logs (archiver les anciens)
> /var/www/penepene/storage/logs/laravel.log
```

### Logs Web Server
```bash
# Logs Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Logs Apache (si utilisé)
sudo tail -f /var/log/apache2/error.log
```

### Logs PHP-FPM
```bash
# PHP-FPM errors
sudo tail -f /var/log/php-fpm.log
# ou pour PHP 7.4
sudo tail -f /var/log/php7.4-fpm.log
```

---

## 🖼️ IMAGES QUI NE S'AFFICHENT PAS

### Commandes de diagnostic
```bash
# 1. Vérifier le lien symbolique
ls -la /var/www/penepene/public/
# Vous devez voir: storage -> ../storage/app/public

# 2. Recréer le lien s'il manque
php artisan storage:link

# 3. Vérifier l'accès aux fichiers
ls -la /var/www/penepene/storage/app/public/

# 4. Corriger les permissions
sudo chown -R www-data:www-data /var/www/penepene/storage
sudo chmod -R 775 /var/www/penepene/storage

# 5. Tester l'accès HTTP
curl http://yoursite.com/storage/

# 6. Vérifier la configuration du .env
grep "APP_URL\|FILESYSTEM_DISK" /var/www/penepene/.env
```

---

## 🧹 NETTOYAGE RAPIDE (Quand l'app buggue)

```bash
# The "Nuclear Option" - nettoie TOUT
cd /var/www/penepene
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear
php artisan optimize:clear

# Puis reconstruire les caches
php artisan config:cache
php artisan route:cache
php artisan optimize

# Redémarrer les services
sudo systemctl restart php-fpm nginx
```

---

## 📋 CHECKLIST RAPIDE APRÈS DÉPLOIEMENT

```bash
# Copier-coller cette section dans le terminal:

PROJECT="/var/www/penepene"
echo "✅ Vérification du déploiement..."

# 1. Vérifier les logs
echo -n "📜 Logs: "
test -f "$PROJECT/storage/logs/laravel.log" && echo "✅" || echo "❌"

# 2. Vérifier le lien symbolique
echo -n "🔗 Storage link: "
test -L "$PROJECT/public/storage" && echo "✅" || echo "❌"

# 3. Vérifier les permissions storage
echo -n "🔒 Storage permissions: "
test -w "$PROJECT/storage" && echo "✅" || echo "❌"

# 4. Vérifier la base de données
echo -n "🗄️  Database: "
cd "$PROJECT" && php artisan tinker <<< "exit;" 2>/dev/null && echo "✅" || echo "❌"

# 5. Vérifier l'application
echo -n "🌐 Application: "
curl -sf http://localhost/ > /dev/null 2>&1 && echo "✅" || echo "⚠️  (peut être en HTTPS)"

echo ""
echo "✅ Vérification terminée!"
```

---

## 👥 COMPTES DE CONNEXION

| Type | Email | Mot de passe |
|------|-------|--------------|
| Super Admin | `josephtshim6@gmail.com` | `Josephes6@` |
| Admin | `admin@penepene.com` | `password` |
| Vendeur 1 | `seller1@penepene.com` | `password123` |
| Client 1 | `buyer1@penepene.com` | `password123` |

---

## 🆘 PROBLÈMES COURANTS

### ❌ Erreur 500 générique
```bash
# Lire les logs
tail -100 /var/www/penepene/storage/logs/laravel.log

# Nettoyer tous les caches
cd /var/www/penepene
php artisan cache:clear && php artisan config:clear && php artisan optimize:clear

# Redémarrer
sudo systemctl restart php-fpm nginx
```

### ❌ "Class not found" ou autoload error
```bash
cd /var/www/penepene
composer dump-autoload
php artisan optimize:clear
```

### ❌ Images noires ou manquantes
```bash
php artisan storage:link
sudo chown -R www-data:www-data /var/www/penepene/storage
```

### ❌ Permission denied dans les logs
```bash
sudo chown -R www-data:www-data /var/www/penepene
sudo chmod -R 775 /var/www/penepene/storage
sudo chmod -R 775 /var/www/penepene/bootstrap/cache
```

### ❌ Timeout lors du chargement des pages
```bash
# Augmenter le timeout PHP
# Éditer /etc/php/8.1/fpm/php.ini ou /etc/php/7.4/fpm/php.ini
sudo nano /etc/php/8.1/fpm/php.ini
# Chercher: max_execution_time = 30
# Changer à: max_execution_time = 300

# Redémarrer PHP
sudo systemctl restart php-fpm
```

---

## 🔄 REDÉMARRAGE DES SERVICES

```bash
# PHP-FPM
sudo systemctl restart php-fpm
# ou si une version spécifique
sudo systemctl restart php7.4-fpm
sudo systemctl restart php8.1-fpm

# Nginx
sudo systemctl restart nginx
# ou juste reloader la config
sudo systemctl reload nginx

# Apache (si utilisé)
sudo systemctl restart apache2

# Tous les services à la fois
sudo systemctl restart php-fpm nginx
```

---

## 📊 MONITORING - VÉRIFIER L'ÉTAT DE L'APPLICATION

```bash
# Vérifier l'utilisation mémoire/CPU
top -p $(pgrep -d',' php)

# Voir les processus PHP actifs
ps aux | grep php

# Vérifier l'espace disque
df -h

# Espace disque utilisé par le projet
du -sh /var/www/penepene

# Vérifier la base de données
mysql -u penepene_user -p penepene_db -e "SELECT COUNT(*) FROM users;"
```

---

## 🗑️ ARCHIVAGE DES ANCIENS LOGS

```bash
# Archiver les logs de plus de 7 jours
find /var/www/penepene/storage/logs/ -mtime +7 -exec gzip {} \;

# Ou nettoyer complètement (ATTENTION!)
> /var/www/penepene/storage/logs/laravel.log

# Setup log rotation automatique dans crontab
sudo crontab -e

# Ajouter cette ligne:
0 0 * * * > /var/www/penepene/storage/logs/laravel.log
```

---

## 📝 ÉDITER LES FICHIERS IMPORTANTS

```bash
# Configuration de l'application
sudo nano /var/www/penepene/.env

# Configuration Nginx
sudo nano /etc/nginx/sites-enabled/penepene

# Configuration PHP
sudo nano /etc/php/8.1/fpm/php.ini

# Après édition, redémarrer les services:
sudo systemctl reload nginx && sudo systemctl restart php-fpm
```

---

## 🚨 URGENCE - RESTAURER DEPUIS SAUVEGARDE

```bash
# Sauvegarder l'état actuel avant restauration
cp -r /var/www/penepene /var/www/penepene.backup-$(date +%Y%m%d)

# Restaurer depuis sauvegarde
cp -r /chemin/vers/sauvegarde/* /var/www/penepene/

# Mettre à jour les permissions
sudo chown -R www-data:www-data /var/www/penepene
sudo chmod -R 775 /var/www/penepene/storage

# Redémarrer
sudo systemctl restart php-fpm nginx
```

---

## 💡 TIPS PRODUCTION

1. **Toujours mettre APP_DEBUG=false** en production
2. **Mettre en cache la config**: `php artisan config:cache`
3. **Monitorer les logs** régulièrement: `tail -f storage/logs/laravel.log`
4. **Sauvegarder la base de données** quotidiennement
5. **Vérifier l'espace disque** (les logs peuvent grossir vite)
6. **Garder les permissions correctes**: storage=775, public=755
7. **Utiliser un CDN** pour les images statiques
8. **Activer HTTPS** avec Let's Encrypt

---

## 🤝 Support

- **Documentation officielle**: https://laravel.com/docs
- **Logs du projet**: `/var/www/penepene/storage/logs/laravel.log`
- **Configuration**: `/var/www/penepene/.env`

**Bonne chance! 🚀**
