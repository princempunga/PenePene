# 📚 PenePene - Guide Complet de Production sur Ubuntu

Vous trouverez ici tous les outils, scripts et documentations pour déployer, déboguer et maintenir PenePene en production sur un serveur Ubuntu.

---

## 📁 Fichiers fournis

| Fichier | Description | Usage |
|---------|-------------|-------|
| **`deploy.sh`** | Script de déploiement automatisé | `sudo bash deploy.sh` |
| **`diagnostic.sh`** | Script de diagnostic du système | `bash diagnostic.sh` |
| **`DEPLOYMENT_GUIDE_FR.md`** | Guide complet en français (4 parties) | Documentation détaillée |
| **`QUICK_REFERENCE.md`** | Référence rapide des commandes | Consulter au besoin |
| **`database/seeders/SuperAdminSeeder.php`** | Seeder pour Super Admin | Crée le compte josephtshim6@gmail.com |
| **`database/seeders/DemoUsersSeeder.php`** | Seeder pour vendeurs/clients | Crée 5 vendeurs + 5 clients |

---

## 🚀 DÉPLOIEMENT RAPIDE (5 MINUTES)

### Sur votre serveur Ubuntu, exécutez:

```bash
# 1. Aller dans le répertoire du projet
cd /var/www/penepene

# 2. Rendre les scripts exécutables
chmod +x deploy.sh diagnostic.sh

# 3. Lancer le déploiement (RECOMMANDÉ)
sudo bash deploy.sh

# 4. Ou lancer le diagnostic d'abord
bash diagnostic.sh
```

### Résultat attendu:
- ✅ Application prête en production
- ✅ Comptes créés (Super Admin: `josephtshim6@gmail.com` / `Josephes6@`)
- ✅ Images fonctionnelles
- ✅ Tous les caches générés

---

## 🔍 DÉBOGAGE - LES 3 COMMANDES ESSENTIELLES

### 1️⃣ Lire les logs (le plus important!)
```bash
tail -f /var/www/penepene/storage/logs/laravel.log
```

### 2️⃣ Nettoyer en cas de bug
```bash
cd /var/www/penepene
php artisan cache:clear
php artisan config:clear
php artisan optimize:clear
php artisan config:cache
sudo systemctl restart php-fpm nginx
```

### 3️⃣ Vérifier l'état du système
```bash
bash /var/www/penepene/diagnostic.sh
```

---

## 📊 RÉSOLUTION RAPIDE DES PROBLÈMES

### ❌ Erreur 500 générique
➜ Consultez les logs: `tail -f storage/logs/laravel.log`

### ❌ Les images n'apparaissent pas
```bash
php artisan storage:link
sudo chown -R www-data:www-data /var/www/penepene/storage
```

### ❌ "Permission denied" ou "File not found"
```bash
sudo chown -R www-data:www-data /var/www/penepene
sudo chmod -R 775 /var/www/penepene/storage
sudo chmod -R 755 /var/www/penepene/public
```

### ❌ Certaines fonctionnalités ne marchent pas
```bash
# Tout nettoyer et reconstruire
php artisan migrate --force
php artisan cache:clear && php artisan config:cache
sudo systemctl restart php-fpm
```

---

## 👥 COMPTES DE CONNEXION CRÉÉS

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Super Admin** | `josephtshim6@gmail.com` | `Josephes6@` |
| Admin | `admin@penepene.com` | `password` |
| Vendeur 1-5 | `seller1@penepene.com` à `seller5@penepene.com` | `password123` |
| Client 1-5 | `buyer1@penepene.com` à `buyer5@penepene.com` | `password123` |
| Client démo | `buyer@penepene.co.tz` | `password` |
| Vendeur démo | `seller@penepene.co.tz` | `password` |

---

## 📋 CHECKLIST POST-DÉPLOIEMENT

Après l'exécution du script `deploy.sh`, vérifiez:

- [ ] Application accessible: `http://yoursite.com`
- [ ] Connexion avec Super Admin fonctionne
- [ ] Images s'affichent correctement
- [ ] Pas d'erreurs dans les logs: `tail storage/logs/laravel.log`
- [ ] Lien symbolique créé: `ls -la public/storage`
- [ ] APP_DEBUG = false dans `.env`
- [ ] APP_ENV = production dans `.env`

---

## 🛠️ MAINTENANCE RÉGULIÈRE

### Quotidien
```bash
# Vérifier les logs
tail -100 /var/www/penepene/storage/logs/laravel.log
```

### Hebdomadaire
```bash
# Nettoyer les caches
cd /var/www/penepene
php artisan cache:clear
php artisan config:clear

# Vérifier l'espace disque
df -h
du -sh /var/www/penepene

# Archiver les anciens logs
find storage/logs -mtime +7 -exec gzip {} \;
```

### Mensuel
```bash
# Sauvegarder la base de données
mysqldump -u user -p database > backup-$(date +%Y%m%d).sql

# Sauvegarder les fichiers
tar -czf penepene-backup-$(date +%Y%m%d).tar.gz /var/www/penepene

# Mettre à jour les dépendances
composer update
```

---

## 🔐 CONFIGURATION SÉCURITÉ

Assurez-vous que dans `/var/www/penepene/.env`:

```bash
APP_ENV=production              # PAS "local"
APP_DEBUG=false                 # PAS "true"
APP_URL=https://yourdomain.com  # URL correcte
DB_PASSWORD=strong_password     # Mot de passe fort
MAIL_MAILER=smtp                # Configuration mail
```

Et les permissions:

```bash
sudo chown -R www-data:www-data /var/www/penepene
sudo chmod -R 775 /var/www/penepene/storage
sudo chmod -R 755 /var/www/penepene/public
```

---

## 📖 DOCUMENTATION DÉTAILLÉE

Consultez les fichiers de documentation pour plus de détails:

1. **`DEPLOYMENT_GUIDE_FR.md`** - Guide complet en 4 parties
   - 1️⃣ Création des rôles et comptes (Seeder)
   - 2️⃣ Débogage des erreurs 500
   - 3️⃣ Résolution des images
   - 4️⃣ Checklist de déploiement

2. **`QUICK_REFERENCE.md`** - Référence rapide des commandes
   - Commandes essentielles
   - Lecture des logs
   - Problèmes courants

---

## 🆘 SUPPORT & RESSOURCES

### Logs à vérifier en cas de problème
```bash
# Application Laravel
tail -f /var/www/penepene/storage/logs/laravel.log

# Web Server
sudo tail -f /var/log/nginx/error.log      # Nginx
sudo tail -f /var/log/apache2/error.log    # Apache

# PHP-FPM
sudo tail -f /var/log/php-fpm.log
```

### Commandes utiles
```bash
# Voir tous les comptes
cd /var/www/penepene
php artisan tinker
>>> User::all()

# Vérifier la BD
>>> DB::connection()->getPdo()

# Nettoyer complètement
php artisan optimize:clear

# Recacher
php artisan config:cache && php artisan route:cache
```

---

## 🎯 RÉSUMÉ DES 4 PROBLÈMES RÉSOLUS

### ✅ 1. Création des rôles et comptes
- **Solution**: Fichiers Seeder `SuperAdminSeeder.php` et `DemoUsersSeeder.php`
- **Exécution**: `php artisan db:seed --class=SuperAdminSeeder`
- **Identifiants**: `josephtshim6@gmail.com` / `Josephes6@`

### ✅ 2. Débogage des erreurs 500
- **Solution**: Commandes de logs dans `DEPLOYMENT_GUIDE_FR.md`
- **Logs Laravel**: `tail -f /var/www/penepene/storage/logs/laravel.log`
- **Logs Web**: `sudo tail -f /var/log/nginx/error.log`

### ✅ 3. Chargement des images
- **Solution**: Lien symbolique + permissions
- **Commande**: `php artisan storage:link`
- **Permissions**: `sudo chown -R www-data:www-data /var/www/penepene/storage`

### ✅ 4. Fonctionnalités inactives
- **Solution**: Checklist complète dans `DEPLOYMENT_GUIDE_FR.md`
- **Script**: `sudo bash deploy.sh`
- **Vérification**: `bash diagnostic.sh`

---

## ✨ COMMANDE UNIQUE POUR TOUT FAIRE

```bash
# Sur votre serveur Ubuntu, une seule ligne:
cd /var/www/penepene && chmod +x deploy.sh diagnostic.sh && sudo bash deploy.sh
```

Après quelques minutes, votre application sera prête en production! 🚀

---

## 📞 BESOIN D'AIDE?

1. **D'abord**: Exécutez `bash diagnostic.sh` pour identifier les problèmes
2. **Ensuite**: Consultez `QUICK_REFERENCE.md` pour les commandes rapides
3. **Détails**: Consultez `DEPLOYMENT_GUIDE_FR.md` pour la documentation complète
4. **Logs**: Lisez toujours les logs: `tail -f storage/logs/laravel.log`

---

**Bonne chance avec votre déploiement! 🎉**

*Pour toute question, consultez les fichiers de documentation ou contactez votre administrateur système.*
