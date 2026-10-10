const fs = require('fs');
const path = require('path');

const langDir = 'c:\\Users\\Michel\\PenePene\\lang';

const additions = {
    fr: {
        "home": "Accueil",
        "categories": "Catégories",
        "cart": "Panier",
        "orders": "Commandes",
        "favorites": "Favoris",
        "account": "Profil",
        "dashboard": "Dashboard",
        "products": "Produits",
        "messages": "Messages",
        "store": "Boutique",
        "users": "Utilisateurs",
        "sellers": "Vendeurs",
        "reports": "Rapports",
        "settings": "Paramètres",
        "menu": "Menu"
    },
    en: {
        "home": "Home",
        "categories": "Categories",
        "cart": "Cart",
        "orders": "Orders",
        "favorites": "Favorites",
        "account": "Profile",
        "dashboard": "Dashboard",
        "products": "Products",
        "messages": "Messages",
        "store": "Store",
        "users": "Users",
        "sellers": "Sellers",
        "reports": "Reports",
        "settings": "Settings",
        "menu": "Menu"
    },
    sw: {
        "home": "Nyumbani",
        "categories": "Kategoria",
        "cart": "Kikapu",
        "orders": "Maagizo",
        "favorites": "Vipendwa",
        "account": "Wasifu",
        "dashboard": "Dashibodi",
        "products": "Bidhaa",
        "messages": "Ujumbe",
        "store": "Duka",
        "users": "Watumiaji",
        "sellers": "Wauzaji",
        "reports": "Ripoti",
        "settings": "Mipangilio",
        "menu": "Menyu"
    },
    ln: {
        "home": "Ndako",
        "categories": "Bakategori",
        "cart": "Ekolo",
        "orders": "Mitindo",
        "favorites": "Nalingi",
        "account": "Profili",
        "dashboard": "Epayi ya liboso",
        "products": "Biloko",
        "messages": "Basango",
        "store": "Mangomba",
        "users": "Basaleli",
        "sellers": "Bateki",
        "reports": "Bato ya rapore",
        "settings": "Mibongisi",
        "menu": "Menu"
    }
};

['fr', 'en', 'sw', 'ln'].forEach(lang => {
    const file = path.join(langDir, `${lang}.json`);
    if (fs.existsSync(file)) {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (!data.nav) data.nav = {};
        
        // Merge new keys into nav
        Object.assign(data.nav, additions[lang]);
        
        fs.writeFileSync(file, JSON.stringify(data, null, 4));
        console.log(`Updated ${lang}.json`);
    }
});
