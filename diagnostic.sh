#!/bin/bash

###############################################################################
# 🔍 Script de Diagnostic Complet - PenePene sur Ubuntu
#
# Vérifie tous les aspects de votre installation
# Usage: bash diagnostic.sh
###############################################################################

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_PATH="/var/www/penepene"
ERRORS=0
WARNINGS=0
CHECKS=0

check_status() {
    local status=$?
    CHECKS=$((CHECKS + 1))
    
    if [ $status -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

warn_status() {
    CHECKS=$((CHECKS + 1))
    echo -e "${YELLOW}⚠️  ATTENTION${NC}"
    WARNINGS=$((WARNINGS + 1))
}

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🔍 Diagnostic Complet - PenePene${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# ════════════════════════════════════════════════════════════════════════════
# 1. Vérifications du système
# ════════════════════════════════════════════════════════════════════════════
echo -e "${BLUE}1️⃣  SYSTÈME UBUNTU${NC}"
echo "────────────────────────────────────────────────────────────────────"

echo -n "  OS Version: "
lsb_release -d | cut -f2
echo ""

# ════════════════════════════════════════════════════════════════════════════
# 2. Vérifications du projet
# ════════════════════════════════════════════════════════════════════════════
echo -e "${BLUE}2️⃣  RÉPERTOIRE DU PROJET${NC}"
echo "────────────────────────────────────────────────────────────────────"

echo -n "  Répertoire existe ($PROJECT_PATH): "
test -d "$PROJECT_PATH"
check_status

echo -n "  Fichier .env existe: "
test -f "$PROJECT_PATH/.env"
check_status

echo -n "  Fichier composer.json existe: "
test -f "$PROJECT_PATH/composer.json"
check_status

echo -n "  Fichier artisan existe: "
test -f "$PROJECT_PATH/artisan"
check_status

echo ""

# ════════════════════════════════════════════════════════════════════════════
# 3. Vérifications PHP
# ════════════════════════════════════════════════════════════════════════════
echo -e "${BLUE}3️⃣  PHP & COMPOSER${NC}"
echo "────────────────────────────────────────────────────────────────────"

echo -n "  PHP installé: "
which php > /dev/null
check_status

if command -v php &> /dev/null; then
    echo -n "  Version PHP: "
    php -v | head -1
fi

echo -n "  Composer installé: "
which composer > /dev/null
check_status

echo -n "  Dépendances Composer (vendor/autoload.php): "
test -f "$PROJECT_PATH/vendor/autoload.php"
check_status

echo ""

# ════════════════════════════════════════════════════════════════════════════
# 4. Vérifications du Web Server
# ════════════════════════════════════════════════════════════════════════════
echo -e "${BLUE}4️⃣  WEB SERVER${NC}"
echo "────────────────────────────────────────────────────────────────────"

echo -n "  Nginx installé: "
which nginx > /dev/null && check_status || {
    echo -n "  Apache installé: "
    which apache2 > /dev/null && check_status || warn_status
}

echo -n "  PHP-FPM actif: "
systemctl is-active --quiet php-fpm || systemctl is-active --quiet php7.4-fpm || systemctl is-active --quiet php8.1-fpm
check_status

if systemctl is-active --quiet nginx; then
    echo -n "  Nginx actif et lancé: "
    systemctl is-active --quiet nginx
    check_status
elif systemctl is-active --quiet apache2; then
    echo -n "  Apache2 actif et lancé: "
    systemctl is-active --quiet apache2
    check_status
fi

echo ""

# ════════════════════════════════════════════════════════════════════════════
# 5. Vérifications de la base de données
# ════════════════════════════════════════════════════════════════════════════
echo -e "${BLUE}5️⃣  BASE DE DONNÉES${NC}"
echo "────────────────────────────────────────────────────────────────────"

echo -n "  Connexion à la BD: "
cd "$PROJECT_PATH" 2>/dev/null && php artisan tinker <<< "exit;" 2>/dev/null
check_status

echo -n "  Table 'users' existe: "
cd "$PROJECT_PATH" 2>/dev/null && php artisan tinker <<< "DB::table('users')->count(); exit;" 2>/dev/null | grep -q "^[0-9]" && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}"

echo ""

# ════════════════════════════════════════════════════════════════════════════
# 6. Vérifications des permissions
# ════════════════════════════════════════════════════════════════════════════
echo -e "${BLUE}6️⃣  PERMISSIONS DES FICHIERS${NC}"
echo "────────────────────────────────────────────────────────────────────"

echo -n "  Propriétaire storage (www-data): "
OWNER=$(ls -ld "$PROJECT_PATH/storage" | awk '{print $3}')
if [ "$OWNER" = "www-data" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${YELLOW}⚠️  Actuellement: $OWNER${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
CHECKS=$((CHECKS + 1))

echo -n "  Permissions storage (775): "
PERMS=$(stat -c "%a" "$PROJECT_PATH/storage")
if [ "$PERMS" = "775" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${YELLOW}⚠️  Actuellement: $PERMS${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
CHECKS=$((CHECKS + 1))

echo -n "  Permissions public (755): "
PERMS=$(stat -c "%a" "$PROJECT_PATH/public")
if [ "$PERMS" = "755" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${YELLOW}⚠️  Actuellement: $PERMS${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
CHECKS=$((CHECKS + 1))

echo -n "  Bootstrap cache writable: "
test -w "$PROJECT_PATH/bootstrap/cache"
check_status

echo ""

# ════════════════════════════════════════════════════════════════════════════
# 7. Vérifications des fichiers critiques
# ════════════════════════════════════════════════════════════════════════════
echo -e "${BLUE}7️⃣  FICHIERS CRITIQUES${NC}"
echo "────────────────────────────────────────────────────────────────────"

echo -n "  Lien symbolique storage (/public/storage): "
test -L "$PROJECT_PATH/public/storage"
check_status

echo -n "  Dossier storage/app/public existe: "
test -d "$PROJECT_PATH/storage/app/public"
check_status

echo -n "  Fichier logs/laravel.log existe: "
test -f "$PROJECT_PATH/storage/logs/laravel.log"
check_status

echo -n "  Cache directory writable: "
test -w "$PROJECT_PATH/storage/framework/cache"
check_status

echo ""

# ════════════════════════════════════════════════════════════════════════════
# 8. Vérifications de configuration
# ════════════════════════════════════════════════════════════════════════════
echo -e "${BLUE}8️⃣  CONFIGURATION${NC}"
echo "────────────────────────────────────────────────────────────────────"

echo -n "  APP_ENV (devrait être 'production'): "
grep "^APP_ENV=" "$PROJECT_PATH/.env" | head -1
echo ""

echo -n "  APP_DEBUG (devrait être 'false'): "
grep "^APP_DEBUG=" "$PROJECT_PATH/.env" | head -1
echo ""

echo -n "  APP_URL défini: "
grep "^APP_URL=" "$PROJECT_PATH/.env" | head -1
echo ""

echo -n "  Database connecté: "
grep "^DB_CONNECTION=" "$PROJECT_PATH/.env" | head -1
echo ""

echo -n "  FILESYSTEM_DISK (devrait être 'public'): "
grep "^FILESYSTEM_DISK=" "$PROJECT_PATH/.env" | head -1
echo ""

# ════════════════════════════════════════════════════════════════════════════
# 9. Vérifications des caches
# ════════════════════════════════════════════════════════════════════════════
echo -e "${BLUE}9️⃣  CACHES${NC}"
echo "────────────────────────────────────────────────────────────────────"

echo -n "  Config cache (bootstrap/cache/config.php): "
if test -f "$PROJECT_PATH/bootstrap/cache/config.php"; then
    echo -e "${GREEN}✅ Existe${NC}"
else
    echo -e "${YELLOW}⚠️  N'existe pas (à générer)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
CHECKS=$((CHECKS + 1))

echo -n "  Routes cache (bootstrap/cache/routes-v7.php): "
if test -f "$PROJECT_PATH/bootstrap/cache/routes-v7.php" || test -f "$PROJECT_PATH/bootstrap/cache/routes-v8.php"; then
    echo -e "${GREEN}✅ Existe${NC}"
else
    echo -e "${YELLOW}⚠️  N'existe pas (à générer)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
CHECKS=$((CHECKS + 1))

echo ""

# ════════════════════════════════════════════════════════════════════════════
# 10. Vérifications de l'application
# ════════════════════════════════════════════════════════════════════════════
echo -e "${BLUE}🔟 APPLICATION${NC}"
echo "────────────────────────────────────────────────────────────────────"

echo -n "  App accessible (localhost): "
curl -sf http://localhost/ > /dev/null 2>&1 && check_status || warn_status

echo -n "  Compte Super Admin existe: "
cd "$PROJECT_PATH" && php artisan tinker <<< "echo User::where('email', 'josephtshim6@gmail.com')->exists() ? 'true' : 'false'; exit;" 2>/dev/null | grep -q "true"
check_status

echo ""

# ════════════════════════════════════════════════════════════════════════════
# Résumé
# ════════════════════════════════════════════════════════════════════════════
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  📊 RÉSUMÉ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

echo "  Vérifications effectuées: $CHECKS"
echo -e "  ${GREEN}Réussites: $((CHECKS - ERRORS - WARNINGS))${NC}"

if [ $ERRORS -gt 0 ]; then
    echo -e "  ${RED}Erreurs: $ERRORS${NC}"
fi

if [ $WARNINGS -gt 0 ]; then
    echo -e "  ${YELLOW}Avertissements: $WARNINGS${NC}"
fi

echo ""

# ════════════════════════════════════════════════════════════════════════════
# Recommandations
# ════════════════════════════════════════════════════════════════════════════
if [ $ERRORS -gt 0 ] || [ $WARNINGS -gt 0 ]; then
    echo -e "${BLUE}💡 RECOMMANDATIONS${NC}"
    echo "────────────────────────────────────────────────────────────────────"
    
    if ! test -L "$PROJECT_PATH/public/storage"; then
        echo "  • Créer le lien symbolique storage:"
        echo "    php artisan storage:link"
    fi
    
    if ! test -f "$PROJECT_PATH/bootstrap/cache/config.php"; then
        echo "  • Générer le cache de config:"
        echo "    php artisan config:cache"
    fi
    
    if [ "$(grep "^APP_DEBUG=" "$PROJECT_PATH/.env" | cut -d= -f2)" != "false" ]; then
        echo "  • Désactiver le debug mode (production):"
        echo "    sed -i 's/APP_DEBUG=true/APP_DEBUG=false/g' .env"
    fi
    
    if [ "$(grep "^APP_ENV=" "$PROJECT_PATH/.env" | cut -d= -f2)" != "production" ]; then
        echo "  • Définir l'environnement à production:"
        echo "    sed -i 's/APP_ENV=local/APP_ENV=production/g' .env"
    fi
    
    if [ "$(ls -ld "$PROJECT_PATH/storage" | awk '{print $3}')" != "www-data" ]; then
        echo "  • Corriger les permissions:"
        echo "    sudo chown -R www-data:www-data /var/www/penepene"
        echo "    sudo chmod -R 775 /var/www/penepene/storage"
    fi
    
    echo ""
fi

# Status final
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ TOUS LES TESTS PASSÉS - SYSTÈME PRÊT POUR LA PRODUCTION!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  DES AVERTISSEMENTS - À VÉRIFIER${NC}"
    exit 0
else
    echo -e "${RED}❌ ERREURS DÉTECTÉES - ACTION REQUISE${NC}"
    exit 1
fi
