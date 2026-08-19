#!/bin/bash

###############################################################################
# 🚀 Script de Déploiement Automatisé - PenePene
# 
# Usage: 
#   sudo bash deploy.sh
#
# Ce script automatise tous les étapes de déploiement en production
###############################################################################

set -e  # Arrêter si une commande échoue

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_PATH="/var/www/penepene"
WEB_USER="www-data"
WEB_GROUP="www-data"

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier que le script est exécuté en root
if [[ $EUID -ne 0 ]]; then
    log_error "Ce script doit être exécuté avec sudo"
    exit 1
fi

# Vérifier que le répertoire du projet existe
if [ ! -d "$PROJECT_PATH" ]; then
    log_error "Répertoire du projet non trouvé: $PROJECT_PATH"
    exit 1
fi

echo ""
log_info "═══════════════════════════════════════════════════════════════════"
log_info "  🚀 Déploiement de PenePene"
log_info "═══════════════════════════════════════════════════════════════════"
echo ""

# ════════════════════════════════════════════════════════════════════════════
# ÉTAPE 1: Aller dans le répertoire du projet
# ════════════════════════════════════════════════════════════════════════════
log_info "📂 Accès au répertoire du projet..."
cd "$PROJECT_PATH"
log_success "Répertoire: $(pwd)"
echo ""

# ════════════════════════════════════════════════════════════════════════════
# ÉTAPE 2: Vérifier la base de données
# ════════════════════════════════════════════════════════════════════════════
log_info "🗄️  Vérification de la base de données..."
if php artisan tinker <<< "exit;" 2>/dev/null; then
    log_success "Base de données accessible"
else
    log_error "Impossible de se connecter à la base de données!"
    exit 1
fi
echo ""

# ════════════════════════════════════════════════════════════════════════════
# ÉTAPE 3: Nettoyer tous les caches
# ════════════════════════════════════════════════════════════════════════════
log_info "🧹 Nettoyage des caches..."
php artisan cache:clear && log_success "Cache nettoyé"
php artisan config:clear && log_success "Config nettoyée"
php artisan view:clear && log_success "Vues nettoyées"
php artisan route:clear && log_success "Routes nettoyées"
php artisan optimize:clear && log_success "Optimisations nettoyées"
echo ""

# ════════════════════════════════════════════════════════════════════════════
# ÉTAPE 4: Mettre à jour les dépendances Composer
# ════════════════════════════════════════════════════════════════════════════
log_info "📦 Mise à jour des dépendances Composer..."
if composer install --optimize-autoloader --no-dev 2>/dev/null; then
    log_success "Dépendances mises à jour"
else
    log_warning "Impossible de mettre à jour les dépendances (Composer peut ne pas être installé)"
fi
echo ""

# ════════════════════════════════════════════════════════════════════════════
# ÉTAPE 5: Exécuter les migrations
# ════════════════════════════════════════════════════════════════════════════
log_info "🗄️  Exécution des migrations de base de données..."
php artisan migrate --force && log_success "Migrations exécutées"
echo ""

# ════════════════════════════════════════════════════════════════════════════
# ÉTAPE 6: Créer les comptes de base
# ════════════════════════════════════════════════════════════════════════════
log_info "👥 Création des comptes administrateur..."
php artisan db:seed --class=SuperAdminSeeder && log_success "Super Admin créé (josephtshim6@gmail.com)"
php artisan db:seed --class=DemoUsersSeeder && log_success "Comptes de démo créés"
echo ""

# ════════════════════════════════════════════════════════════════════════════
# ÉTAPE 7: Créer le lien symbolique pour les fichiers publics
# ════════════════════════════════════════════════════════════════════════════
log_info "🔗 Création du lien symbolique pour le stockage..."
if [ -d "$PROJECT_PATH/public/storage" ]; then
    log_warning "Le lien symbolique existe déjà"
else
    php artisan storage:link && log_success "Lien symbolique créé"
fi
echo ""

# ════════════════════════════════════════════════════════════════════════════
# ÉTAPE 8: Reconstruire les caches pour la production
# ════════════════════════════════════════════════════════════════════════════
log_info "⚡ Reconstruction des caches pour la production..."
php artisan config:cache && log_success "Config mise en cache"
php artisan route:cache && log_success "Routes mises en cache"
php artisan view:cache && log_success "Vues mises en cache"
php artisan optimize && log_success "Application optimisée"
echo ""

# ════════════════════════════════════════════════════════════════════════════
# ÉTAPE 9: Mettre à jour les permissions des fichiers
# ════════════════════════════════════════════════════════════════════════════
log_info "🔒 Mise à jour des permissions des fichiers..."

# Propriétaire
chown -R $WEB_USER:$WEB_GROUP "$PROJECT_PATH" && log_success "Propriétaire défini: $WEB_USER:$WEB_GROUP"

# Permissions pour storage (doit être writable par www-data)
chmod -R 775 "$PROJECT_PATH/storage" && log_success "Storage: 775 (writable)"
chmod -R 775 "$PROJECT_PATH/bootstrap/cache" && log_success "Bootstrap cache: 775 (writable)"

# Permissions pour public (public readable)
chmod -R 755 "$PROJECT_PATH/public" && log_success "Public: 755 (readable)"

echo ""

# ════════════════════════════════════════════════════════════════════════════
# ÉTAPE 10: Vérifier et configurer l'environnement production
# ════════════════════════════════════════════════════════════════════════════
log_info "🛡️  Vérification de la configuration production..."

ENV_FILE="$PROJECT_PATH/.env"
if grep -q "^APP_ENV=production" "$ENV_FILE"; then
    log_success "APP_ENV = production"
else
    log_warning "APP_ENV n'est pas défini à production"
fi

if grep -q "^APP_DEBUG=false" "$ENV_FILE"; then
    log_success "APP_DEBUG = false"
else
    log_warning "APP_DEBUG n'est pas défini à false"
fi

echo ""

# ════════════════════════════════════════════════════════════════════════════
# ÉTAPE 11: Redémarrer les services web
# ════════════════════════════════════════════════════════════════════════════
log_info "🔄 Redémarrage des services web..."

# Vérifier et redémarrer PHP-FPM
if systemctl is-active --quiet php-fpm || systemctl is-active --quiet php7.4-fpm || systemctl is-active --quiet php8.1-fpm; then
    if systemctl is-active --quiet php-fpm; then
        systemctl restart php-fpm && log_success "PHP-FPM redémarré"
    elif systemctl is-active --quiet php7.4-fpm; then
        systemctl restart php7.4-fpm && log_success "PHP 7.4-FPM redémarré"
    elif systemctl is-active --quiet php8.1-fpm; then
        systemctl restart php8.1-fpm && log_success "PHP 8.1-FPM redémarré"
    fi
else
    log_warning "PHP-FPM non trouvé ou pas actif"
fi

# Redémarrer Nginx ou Apache
if systemctl is-active --quiet nginx; then
    systemctl reload nginx && log_success "Nginx reloadé"
elif systemctl is-active --quiet apache2; then
    systemctl restart apache2 && log_success "Apache2 redémarré"
else
    log_warning "Nginx et Apache2 ne sont pas actifs"
fi

echo ""

# ════════════════════════════════════════════════════════════════════════════
# ÉTAPE 12: Tests finaux
# ════════════════════════════════════════════════════════════════════════════
log_info "✔️  Tests finaux..."

# Vérifier que les logs sont accessibles
if tail -1 "$PROJECT_PATH/storage/logs/laravel.log" &>/dev/null; then
    log_success "Logs Laravel accessibles"
else
    log_warning "Impossible de lire les logs Laravel"
fi

# Vérifier le lien symbolique
if [ -L "$PROJECT_PATH/public/storage" ]; then
    log_success "Lien symbolique storage vérifié"
else
    log_error "Lien symbolique storage introuvable!"
fi

# Vérifier l'accès à l'application
echo ""
log_info "Tentative d'accès à l'application..."
if curl -sf http://localhost/api/health &>/dev/null || curl -sf http://localhost/ &>/dev/null; then
    log_success "✨ Application accessible!"
else
    log_warning "Impossible de vérifier l'accès (le serveur peut être configuré pour HTTPS)"
fi

echo ""
log_info "═══════════════════════════════════════════════════════════════════"
log_success "  ✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS!"
log_info "═══════════════════════════════════════════════════════════════════"
echo ""

echo -e "${GREEN}📝 Informations importantes:${NC}"
echo ""
echo -e "${GREEN}🔐 Comptes de connexion créés:${NC}"
echo "  • Super Admin: josephtshim6@gmail.com / Josephes6@"
echo "  • Admin:       admin@penepene.com / password"
echo "  • Vendeurs:    seller1@penepene.com à seller5@penepene.com / password123"
echo "  • Clients:     buyer1@penepene.com à buyer5@penepene.com / password123"
echo ""

echo -e "${GREEN}📊 Emplacements importants:${NC}"
echo "  • Logs:        $PROJECT_PATH/storage/logs/laravel.log"
echo "  • Env file:    $PROJECT_PATH/.env"
echo "  • Storage:     $PROJECT_PATH/storage/app/public"
echo "  • Public:      $PROJECT_PATH/public"
echo ""

echo -e "${GREEN}🔗 Commandes utiles pour la maintenance:${NC}"
echo "  • Voir les logs:          tail -f $PROJECT_PATH/storage/logs/laravel.log"
echo "  • Nettoyer les caches:    cd $PROJECT_PATH && php artisan cache:clear"
echo "  • Afficher la config:     cd $PROJECT_PATH && php artisan config:show"
echo ""

log_info "═══════════════════════════════════════════════════════════════════"
echo ""
