# 🚀 Guide Complet de Déploiement et Débogage Laravel - PenePene

## PARTIE 1️⃣ : CRÉATION DES COMPTES (Seeder)

### ✅ Commandes à exécuter en production:

```bash
# 1. Exécuter le seeder pour créer Super Admin + Admin
php artisan db:seed --class=SuperAdminSeeder

# 2. Exécuter le seeder pour créer vendeurs + clients de démo
php artisan db:seed --class=DemoUsersSeeder

# 3. Ou lancer TOUT d'un coup (recommandé)
php artisan migrate:refresh --seed
# ⚠️  ATTENTION: cela réinitialise la base de données complètement!
# Sur une base existante, utiliser plutôt:
php artisan db:seed
```

### 📝 Identifiants créés:

**Super Admin:**
- Email: `josephtshim6@gmail.com`
- Mot de passe: `Josephes6@`

**Admin:**
- Email: `admin@penepene.com`
- Mot de passe: `password`

**Vendeurs de démo:**
- seller1@penepene.com à seller5@penepene.com
- Mot de passe: `password123`

**Clients de démo:**
- buyer1@penepene.com à buyer5@penepene.com
- Mot de passe: `password123`

---

## PARTIE 2️⃣ : DÉBOGAGE DES ERREURS 500 SUR UBUNTU

### 🔍 Lire les logs de l'application Laravel:

```bash
# Logs en temps réel (tail -f = suivi continu)
tail -f /var/www/penepene/storage/logs/laravel.log

# Voir les dernières 100 lignes
tail -100 /var/www/penepene/storage/logs/laravel.log

# Chercher les erreurs spécifiques
grep -i "error" /var/www/penepene/storage/logs/laravel.log | tail -50

# Afficher un jour précis de logs
grep "2024-08-19" /var/www/penepene/storage/logs/laravel.log

# Voir tous les fichiers de logs disponibles
ls -lah /var/www/penepene/storage/logs/
```

### 🔍 Logs Nginx (si vous utilisez Nginx):

```bash
# Logs d'erreur Nginx en temps réel
sudo tail -f /var/log/nginx/error.log

# Logs d'accès Nginx (pour voir les requêtes)
sudo tail -f /var/log/nginx/access.log

# Chercher les erreurs 500
sudo grep "500" /var/log/nginx/access.log | tail -20

# Voir la configuration Nginx active (chercher les chemins)
sudo nano /etc/nginx/sites-enabled/default
# ou
sudo nano /etc/nginx/sites-enabled/penepene
```

### 🔍 Logs Apache (si vous utilisez Apache):

```bash
# Logs d'erreur Apache en temps réel
sudo tail -f /var/log/apache2/error.log

# Logs d'accès Apache
sudo tail -f /var/log/apache2/access.log

# Chercher les erreurs 500
sudo grep "500" /var/log/apache2/access.log | tail -20
```

### 🔍 Logs système:

```bash
# Voir les erreurs système générales
sudo tail -f /var/log/syslog

# Chercher les erreurs PHP
sudo grep "PHP" /var/log/syslog

# Voir les logs de PHP-FPM (si utilisé)
sudo tail -f /var/log/php-fpm.log
# ou 
sudo tail -f /var/log/php7.4-fpm.log  # ajuster la version
```

### 📊 Vérifier l'état des services:

```bash
# Vérifier si Laravel fonctionne
curl http://localhost/

# Vérifier si le serveur PHP répond
sudo systemctl status php-fpm
# ou
sudo systemctl status php7.4-fpm

# Vérifier Nginx
sudo systemctl status nginx

# Redémarrer les services si nécessaire
sudo systemctl restart php-fpm
sudo systemctl restart nginx

# Voir les processus PHP actifs
ps aux | grep php
```

### ✨ Procédure de débogage complète:

```bash
# 1. D'abord, vérifier les logs Laravel
tail -100 /var/www/penepene/storage/logs/laravel.log

# 2. Vérifier l'accès aux logs
ls -la /var/www/penepene/storage/logs/

# 3. Vérifier les permissions
ls -la /var/www/penepene/storage/
# Les permissions devraient être: drwxrwxr-x (775)

# 4. Vérifier si le dossier storage a les permissions d'écriture
sudo chown -R www-data:www-data /var/www/penepene/storage
sudo chmod -R 775 /var/www/penepene/storage

# 5. Vérifier la base de données
php artisan tinker
>>> DB::connection()->getPdo()  # Si ça répond OK, la DB fonctionne

# 6. Vérifier les variables d'environnement
php artisan config:show | grep -i app
```

---

## PARTIE 3️⃣ : RÉSOLUTION DES IMAGES QUI NE S'AFFICHENT PAS

### 🖼️ Problème: Les images ne s'affichent pas en production

**Cause commune:** Lien symbolique manquant entre `storage/app/public` et `public/storage`

### ✅ Solution complète:

```bash
# 1. Créer le lien symbolique (COMMANDE ESSENTIELLE!)
php artisan storage:link

# Vérifier que le lien a été créé
ls -la /var/www/penepene/public/
# Vous devez voir: storage -> ../storage/app/public

# 2. Vérifier les permissions du dossier storage
sudo chown -R www-data:www-data /var/www/penepene/storage
sudo chmod -R 775 /var/www/penepene/storage

# 3. Vérifier les permissions du dossier public
sudo chown -R www-data:www-data /var/www/penepene/public
sudo chmod -R 755 /var/www/penepene/public

# 4. Tester l'accès aux images
curl http://yoursite.com/storage/images/test.jpg
```

### 📝 Configurer les URL d'images dans le .env:

```bash
# Sur le serveur Ubuntu, éditez .env:
sudo nano /var/www/penepene/.env

# Assurez-vous que ces valeurs sont correctes:
APP_URL=https://yoursite.com  # ⚠️ Doit correspondre à votre domaine!
FILESYSTEM_DISK=public

# Si vous utilisez S3 ou un autre stockage cloud:
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket
AWS_URL=https://s3.amazonaws.com/your-bucket
```

### 🖼️ Vérifier la configuration Nginx pour servir les images:

```nginx
# Vérifier /etc/nginx/sites-enabled/penepene ou default:
sudo nano /etc/nginx/sites-enabled/default

# Vous devez voir une ligne comme:
location / {
    try_files $uri $uri/ /index.php?$query_string;
}

# Le lien symbolique /public/storage doit être accessible
# Après édition, recharger Nginx:
sudo nginx -t
sudo systemctl reload nginx
```

### 🔗 Configuration Blade pour afficher les images:

```blade
<!-- Dans vos fichiers Blade (resources/views/...) -->

<!-- ✅ Correct - utilise asset() -->
<img src="{{ asset('storage/images/product.jpg') }}" />

<!-- ✅ Correct - utilise Storage::url() -->
<img src="{{ Storage::url('public/images/product.jpg') }}" />

<!-- ❌ Incorrect - ne pas hardcoder /storage -->
<img src="/storage/images/product.jpg" />
```

### 📊 Checklist pour les images:

- [ ] Lien symbolique créé: `php artisan storage:link`
- [ ] Permissions correctes: `sudo chown -R www-data:www-data /var/www/penepene/storage`
- [ ] APP_URL correct dans `.env`: `APP_URL=https://votre-domaine.com`
- [ ] FILESYSTEM_DISK correct: `FILESYSTEM_DISK=public`
- [ ] Images sont bien dans: `/var/www/penepene/storage/app/public/`
- [ ] Accès testable: `curl http://yoursite.com/storage/images/test.jpg`

---

## PARTIE 4️⃣ : CHECKLIST COMPLÈTE DE DÉPLOIEMENT UBUNTU

### 🎯 À exécuter APRÈS chaque déploiement:

```bash
# 1. Nettoyer les caches (TRÈS IMPORTANT!)
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear
php artisan optimize:clear

# 2. Reconstruire les caches pour la production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# 3. Mettre à jour les dépendances Composer
cd /var/www/penepene
composer install --optimize-autoloader --no-dev

# 4. Exécuter les migrations de base de données
php artisan migrate --force
# ⚠️  N'ajoutez --force qu'en production!

# 5. Créer/mettre à jour les seeders
php artisan db:seed --class=SuperAdminSeeder
php artisan db:seed --class=DemoUsersSeeder

# 6. Générer la clé d'application (si vous en avez besoin)
php artisan key:generate

# 7. Créer le lien symbolique pour les fichiers publics
php artisan storage:link

# 8. Définir les permissions correctes
sudo chown -R www-data:www-data /var/www/penepene
sudo chmod -R 775 /var/www/penepene/storage
sudo chmod -R 755 /var/www/penepene/public

# 9. Activer le mode production
sed -i 's/APP_DEBUG=true/APP_DEBUG=false/g' /var/www/penepene/.env
sed -i 's/APP_ENV=local/APP_ENV=production/g' /var/www/penepene/.env

# 10. Redémarrer les services
sudo systemctl restart php-fpm
sudo systemctl restart nginx
# ou si vous utilisez Apache:
sudo systemctl restart apache2

# 11. Vérifier que tout fonctionne
curl http://yoursite.com
echo "✅ Déploiement terminé!"
```

### 🔒 Configuration du .env pour la production:

```bash
# Éditer le fichier .env sur le serveur
sudo nano /var/www/penepene/.env

# Voici les valeurs ESSENTIELLES à vérifier:
APP_NAME=PenePene
APP_ENV=production          # ⚠️  Pas "local"
APP_DEBUG=false             # ⚠️  Jamais true en production
APP_KEY=base64:...          # Généré lors de l'installation

# Base de données
DB_CONNECTION=mysql         # Vérifier votre BD (mysql, postgresql, etc)
DB_HOST=localhost           # ou l'IP/hostname de votre serveur BD
DB_PORT=3306
DB_DATABASE=penepene
DB_USERNAME=penepene_user
DB_PASSWORD=your_secure_password

# Cache et sessions
CACHE_STORE=redis           # ou database/file
QUEUE_CONNECTION=database   # ou redis
SESSION_DRIVER=database

# Stockage des fichiers
FILESYSTEM_DISK=public      # ou s3 si vous utilisez AWS
APP_URL=https://yourdomain.com

# Email
MAIL_MAILER=smtp            # ou sendmail, postmark, etc
MAIL_HOST=smtp.gmail.com    # Exemple avec Gmail
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
```

### 📋 Vérification des permissions après déploiement:

```bash
# Vérifier que les permissions sont correctes
sudo ls -la /var/www/penepene/

# Storage doit être writable
sudo ls -la /var/www/penepene/storage/
# Output devrait montrer: drwxrwxr-x (775)

# Public doit être lisible
sudo ls -la /var/www/penepene/public/
# Output devrait montrer: drwxr-xr-x (755)

# Bootstrap doit être writable
sudo ls -la /var/www/penepene/bootstrap/cache/
# Output devrait montrer: drwxrwxr-x (775)
```

### 🛡️ Checklist de sécurité après déploiement:

- [ ] APP_DEBUG = false
- [ ] APP_ENV = production
- [ ] Permissions des fichiers correctes (775 pour storage, 755 pour public)
- [ ] Fichiers sensibles (.env, config/) non accessibles publiquement
- [ ] Base de données sécurisée avec mot de passe fort
- [ ] HTTPS activé et configuré
- [ ] Fichiers de cache générés: `php artisan config:cache`
- [ ] Lien symbolique storage actif: `ls -la /var/www/penepene/public/storage`
- [ ] Logs tourneront en bonne santé: `tail -f /var/www/penepene/storage/logs/laravel.log`

### 🚀 Script automatisé complet de déploiement:

Créez un fichier `/var/www/penepene/deploy.sh`:

```bash
#!/bin/bash
set -e  # Arrêter si une commande échoue

echo "🚀 Début du déploiement PenePene..."

# Aller dans le répertoire du projet
cd /var/www/penepene

# Nettoyer les caches
echo "🧹 Nettoyage des caches..."
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear
php artisan optimize:clear

# Mettre à jour les dépendances
echo "📦 Mise à jour des dépendances Composer..."
composer install --optimize-autoloader --no-dev

# Exécuter les migrations
echo "🗄️  Exécution des migrations..."
php artisan migrate --force

# Créer les seeders
echo "👥 Création des comptes..."
php artisan db:seed --class=SuperAdminSeeder
php artisan db:seed --class=DemoUsersSeeder

# Lien symbolique
echo "🔗 Création du lien symbolique storage..."
php artisan storage:link

# Reconstruire les caches pour la production
echo "⚡ Reconstruction des caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Permissions
echo "🔒 Mise à jour des permissions..."
sudo chown -R www-data:www-data /var/www/penepene
sudo chmod -R 775 /var/www/penepene/storage
sudo chmod -R 755 /var/www/penepene/public

# Redémarrer les services
echo "🔄 Redémarrage des services..."
sudo systemctl restart php-fpm
sudo systemctl restart nginx

echo "✅ Déploiement terminé avec succès!"
echo ""
echo "🔐 Accédez à votre site à: https://yourdomain.com"
echo "📊 Logs disponibles à: /var/www/penepene/storage/logs/laravel.log"
```

Utilisation:

```bash
# Rendre le script exécutable
chmod +x /var/www/penepene/deploy.sh

# Exécuter le script
sudo /var/www/penepene/deploy.sh
```

---

## 🆘 PROBLÈMES COURANTS ET SOLUTIONS RAPIDES

### Erreur: "SQLSTATE[HY000]: General error"
```bash
# Solution:
php artisan cache:clear
php artisan migrate:refresh --seed
php artisan config:cache
```

### Erreur: "Class not found"
```bash
# Solution:
composer dump-autoload
php artisan optimize:clear
```

### Erreur: "Storage link does not exist"
```bash
# Solution:
php artisan storage:link
sudo chown -R www-data:www-data /var/www/penepene/storage/app/public
```

### Images n'apparaissent pas
```bash
# Solution:
php artisan storage:link
sudo chown -R www-data:www-data /var/www/penepene/storage
curl http://yourdomain.com/storage/  # Tester l'accès
```

### Erreur 500 génériques
```bash
# Solution complète:
tail -f /var/www/penepene/storage/logs/laravel.log  # Voir les logs
sudo tail -f /var/log/nginx/error.log                # Voir les erreurs Nginx
php artisan config:clear
php artisan cache:clear
php artisan optimize:clear
```

---

## 📞 Contacts d'aide

- **Email**: support@penepene.co.tz
- **Logs Laravel**: `/var/www/penepene/storage/logs/laravel.log`
- **Logs Nginx**: `/var/log/nginx/error.log`
- **Logs Apache**: `/var/log/apache2/error.log`

**Bonne chance avec votre déploiement! 🎉**
