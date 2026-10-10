const fs = require('fs');
const path = require('path');

const langDir = 'c:\\Users\\Michel\\PenePene\\lang';

const additions = {
    fr: {
        "mobile.menu": "Menu",
        "mobile.home": "Accueil",
        "mobile.categories": "Catégories",
        "nav.home": "Accueil",
        "nav.cart": "Panier",
        "nav.my_orders": "Commandes",
        "nav.account": "Profil",
        "nav.favorites": "Favoris",
        "nav.products": "Produits",
        "nav.dashboard": "Dashboard",
        "nav.notifications": "Notifications",
        "layouts.admin.dashboard": "Dashboard",
        "layouts.admin.sellers": "Vendeurs",
        "layouts.admin.products": "Produits",
        "layouts.admin.orders": "Commandes",
        "layouts.admin.users": "Utilisateurs",
        "layouts.admin.reports": "Rapports",
        "layouts.admin.settings": "Paramètres"
    },
    en: {
        "mobile.menu": "Menu",
        "mobile.home": "Home",
        "mobile.categories": "Categories",
        "nav.home": "Home",
        "nav.cart": "Cart",
        "nav.my_orders": "Orders",
        "nav.account": "Profile",
        "nav.favorites": "Favorites",
        "nav.products": "Products",
        "nav.dashboard": "Dashboard",
        "nav.notifications": "Notifications",
        "layouts.admin.dashboard": "Dashboard",
        "layouts.admin.sellers": "Sellers",
        "layouts.admin.products": "Products",
        "layouts.admin.orders": "Orders",
        "layouts.admin.users": "Users",
        "layouts.admin.reports": "Reports",
        "layouts.admin.settings": "Settings"
    },
    sw: {
        "mobile.menu": "Menyu",
        "mobile.home": "Nyumbani",
        "mobile.categories": "Kategoria",
        "nav.home": "Nyumbani",
        "nav.cart": "Kikapu",
        "nav.my_orders": "Maagizo",
        "nav.account": "Profaili",
        "nav.favorites": "Vipendwa",
        "nav.products": "Bidhaa",
        "nav.dashboard": "Dashibodi",
        "nav.notifications": "Arifa",
        "layouts.admin.dashboard": "Dashibodi",
        "layouts.admin.sellers": "Wauzaji",
        "layouts.admin.products": "Bidhaa",
        "layouts.admin.orders": "Maagizo",
        "layouts.admin.users": "Watumiaji",
        "layouts.admin.reports": "Ripoti",
        "layouts.admin.settings": "Mipangilio"
    },
    ln: {
        "mobile.menu": "Menu",
        "mobile.home": "Ndako",
        "mobile.categories": "Bakategori",
        "nav.home": "Ndako",
        "nav.cart": "Ekolo",
        "nav.my_orders": "Mitindo",
        "nav.account": "Profili",
        "nav.favorites": "Nalingi",
        "nav.products": "Biloko",
        "nav.dashboard": "Epayi ya liboso",
        "nav.notifications": "Basango",
        "layouts.admin.dashboard": "Epayi ya liboso",
        "layouts.admin.sellers": "Bateki",
        "layouts.admin.products": "Biloko",
        "layouts.admin.orders": "Mitindo",
        "layouts.admin.users": "Basaleli",
        "layouts.admin.reports": "Bato ya rapore",
        "layouts.admin.settings": "Mibongisi"
    }
};

['fr', 'en', 'sw', 'ln'].forEach(lang => {
    const file = path.join(langDir, `${lang}.json`);
    if (fs.existsSync(file)) {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        const newTranslations = additions[lang];
        Object.assign(data, newTranslations);
        const sorted = Object.keys(data).sort().reduce((acc, key) => {
            acc[key] = data[key];
            return acc;
        }, {});
        fs.writeFileSync(file, JSON.stringify(sorted, null, 4));
        console.log(`Updated ${lang}.json`);
    }
});
