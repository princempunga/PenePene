import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const langDir = join(__dirname, '..', 'lang');

const catalog = {
    fr: {
        categories: {
            electronics: {
                name: 'Électronique',
                description: 'Découvrez les dernières technologies auprès de vendeurs locaux vérifiés. Comparez les prix, lisez les avis et achetez smartphones, ordinateurs, téléviseurs et accessoires en toute confiance.',
            },
            fashion: { name: 'Mode', description: 'Découvrez les tendances mode, chaussures, sacs et accessoires auprès de vendeurs locaux de confiance.' },
            'home-living': { name: 'Maison & vie', description: 'Transformez votre espace avec meubles, décoration, cuisine et essentiels pour la maison.' },
            'health-beauty': { name: 'Santé & beauté', description: 'Soins de la peau, cheveux, maquillage et bien-être auprès des meilleurs vendeurs locaux.' },
            vehicles: { name: 'Véhicules', description: 'Voitures, motos, pièces détachées et accessoires auprès de concessionnaires vérifiés.' },
        },
        subcategories: {
            'phones-tablets': { name: 'Téléphones & tablettes', description: 'Smartphones et tablettes pour communiquer, travailler et se divertir.' },
            computers: { name: 'Ordinateurs', description: 'Ordinateurs de bureau, tout-en-un et configurations sur mesure pour la maison et le bureau.' },
            'audio-video': { name: 'Audio & vidéo', description: 'Home cinéma, casques et équipement multimédia des marques de confiance.' },
            accessories: { name: 'Accessoires', description: 'Accessoires essentiels pour téléphones et ordinateurs.' },
            'mobile-phones': { name: 'Téléphones mobiles', description: 'Découvrez les derniers smartphones des grandes marques à des prix locaux compétitifs.' },
            'laptops-computers': { name: 'Ordinateurs portables', description: 'Ordinateurs portables puissants pour le travail, les études et le quotidien.' },
            'audio-sound': { name: 'Audio & son', description: 'Enceintes, casques et équipement audio premium pour tous les styles de vie.' },
            tvs: { name: 'Télévisions', description: 'Téléviseurs intelligents et écrans home cinéma pour chaque pièce.' },
        },
        demo_products: {
            'premium-item': {
                name: 'Article marketplace premium',
                description: 'Produit de démonstration — annonce test pour la marketplace. Cet article est affiché pendant l\'ajout de l\'inventaire réel des vendeurs. Vous pouvez l\'ajouter au panier pour tester l\'expérience d\'achat.',
            },
            'best-seller': { name: 'Produit best-seller', description: 'Annonce de démonstration d\'un produit populaire sur PenePene.' },
            'new-arrival': { name: 'Nouveauté', description: 'Annonce de démonstration d\'une nouvelle arrivée sur la marketplace.' },
            'sponsored-pick': { name: 'Sélection sponsorisée', description: 'Annonce de démonstration d\'un produit sponsorisé.' },
            'local-favorite': { name: 'Favori local', description: 'Annonce de démonstration d\'un produit favori des acheteurs locaux.' },
            'trending-deal': { name: 'Offre tendance', description: 'Annonce de démonstration d\'une offre tendance à durée limitée.' },
            'iphone-14-pro-max': { name: 'iPhone 14 Pro Max', description: 'Annonce de démonstration — smartphone premium Apple pour tester la marketplace.' },
            'samsung-galaxy-s23-ultra': { name: 'Samsung Galaxy S23 Ultra', description: 'Annonce de démonstration — flagship Samsung avec appareil photo avancé.' },
            'tecno-camon-20': { name: 'Tecno Camon 20', description: 'Annonce de démonstration — smartphone abordable pour le marché local.' },
            'hp-elitebook': { name: 'HP EliteBook', description: 'Annonce de démonstration — ordinateur portable professionnel HP.' },
            'macbook-pro': { name: 'MacBook Pro', description: 'Annonce de démonstration — ordinateur portable Apple haut de gamme.' },
            'galaxy-tab-s9': { name: 'Samsung Galaxy Tab S9', description: 'Annonce de démonstration — tablette Samsung polyvalente.' },
            'ipad-air': { name: 'iPad Air', description: 'Annonce de démonstration — tablette Apple légère et performante.' },
            'gaming-desktop': { name: 'PC de gaming', description: 'Annonce de démonstration — ordinateur de bureau gaming sur mesure.' },
            'sony-headphones': { name: 'Casque Sony', description: 'Annonce de démonstration — casque audio Sony premium.' },
            'jbl-speaker': { name: 'Enceinte JBL', description: 'Annonce de démonstration — enceinte Bluetooth JBL.' },
            'samsung-smart-tv': { name: 'Samsung Smart TV', description: 'Annonce de démonstration — téléviseur intelligent Samsung.' },
        },
    },
    en: {
        categories: {
            electronics: {
                name: 'Electronics',
                description: 'Shop the latest electronics from verified local sellers. Compare prices, read reviews, and buy smartphones, laptops, TVs, and accessories with confidence.',
            },
            fashion: { name: 'Fashion', description: 'Discover trending fashion, shoes, bags, and accessories from trusted local sellers at great prices.' },
            'home-living': { name: 'Home & Living', description: 'Transform your space with furniture, decor, kitchenware, and home essentials from local sellers.' },
            'health-beauty': { name: 'Health & Beauty', description: 'Shop skincare, hair care, makeup, and wellness products from top local beauty sellers.' },
            vehicles: { name: 'Vehicles', description: 'Browse cars, motorcycles, spare parts, and vehicle accessories from verified dealers near you.' },
        },
        subcategories: {
            'phones-tablets': { name: 'Phones & Tablets', description: 'Smartphones and tablets for communication, work, and entertainment.' },
            computers: { name: 'Computers', description: 'Desktops, all-in-ones, and custom PC builds for home and office.' },
            'audio-video': { name: 'Audio & Video', description: 'Home theater, headphones, and multimedia equipment from trusted brands.' },
            accessories: { name: 'Accessories', description: 'Essential phone and computer accessories to complete your setup.' },
            'mobile-phones': { name: 'Mobile Phones', description: 'Discover the latest smartphones from top brands at competitive local prices.' },
            'laptops-computers': { name: 'Laptops & Computers', description: 'Powerful laptops and notebooks for work, study, and everyday productivity.' },
            'audio-sound': { name: 'Audio & Sound', description: 'Premium speakers, headphones, and audio gear for every lifestyle.' },
            tvs: { name: 'TVs', description: 'Smart TVs and home entertainment displays for every room.' },
        },
        demo_products: {
            'premium-item': {
                name: 'Premium Marketplace Item',
                description: 'Preview product — demo listing for marketplace testing. This item is shown while real seller inventory is being added. You can add it to your cart to test the shopping experience.',
            },
            'best-seller': { name: 'Best Seller Product', description: 'Demo listing of a popular product on PenePene.' },
            'new-arrival': { name: 'New Arrival', description: 'Demo listing of a new arrival on the marketplace.' },
            'sponsored-pick': { name: 'Sponsored Pick', description: 'Demo listing of a sponsored product.' },
            'local-favorite': { name: 'Local Favorite', description: 'Demo listing of a local buyer favorite.' },
            'trending-deal': { name: 'Trending Deal', description: 'Demo listing of a limited-time trending deal.' },
            'iphone-14-pro-max': { name: 'iPhone 14 Pro Max', description: 'Demo listing — premium Apple smartphone for marketplace testing.' },
            'samsung-galaxy-s23-ultra': { name: 'Samsung Galaxy S23 Ultra', description: 'Demo listing — Samsung flagship with advanced camera.' },
            'tecno-camon-20': { name: 'Tecno Camon 20', description: 'Demo listing — affordable smartphone for the local market.' },
            'hp-elitebook': { name: 'HP EliteBook', description: 'Demo listing — professional HP laptop.' },
            'macbook-pro': { name: 'MacBook Pro', description: 'Demo listing — high-end Apple laptop.' },
            'galaxy-tab-s9': { name: 'Samsung Galaxy Tab S9', description: 'Demo listing — versatile Samsung tablet.' },
            'ipad-air': { name: 'iPad Air', description: 'Demo listing — lightweight and powerful Apple tablet.' },
            'gaming-desktop': { name: 'Gaming Desktop', description: 'Demo listing — custom gaming desktop PC.' },
            'sony-headphones': { name: 'Sony Headphones', description: 'Demo listing — premium Sony headphones.' },
            'jbl-speaker': { name: 'JBL Speaker', description: 'Demo listing — JBL Bluetooth speaker.' },
            'samsung-smart-tv': { name: 'Samsung Smart TV', description: 'Demo listing — Samsung smart TV.' },
        },
    },
};

catalog.ln = {
    categories: {
        electronics: { name: 'Électronique', description: catalog.fr.categories.electronics.description },
        fashion: { name: 'Mode', description: catalog.fr.categories.fashion.description },
    },
    subcategories: {
        'phones-tablets': { name: 'Téléphones & tablettes', description: catalog.fr.subcategories['phones-tablets'].description },
        computers: { name: 'Ordinateurs', description: catalog.fr.subcategories.computers.description },
        'audio-video': { name: 'Audio & vidéo', description: catalog.fr.subcategories['audio-video'].description },
        accessories: { name: 'Accessoires', description: catalog.fr.subcategories.accessories.description },
    },
    demo_products: {
        'premium-item': catalog.fr.demo_products['premium-item'],
    },
};

catalog.sw = {
    categories: {
        electronics: { name: 'Vifaa vya elektroniki', description: 'Nunua vifaa vya hivi karibuni kutoka kwa wauzaji wa ndani waliothibitishwa.' },
        fashion: { name: 'Mitindo', description: 'Gundua mitindo, viatu na vifaa kutoka kwa wauzaji wa kuaminika.' },
    },
    subcategories: {
        'phones-tablets': { name: 'Simu & tableti', description: 'Simu mahiri na tableti kwa mawasiliano, kazi na burudani.' },
        computers: { name: 'Kompyuta', description: 'Kompyuta za mezani na za ofisi kwa nyumbani na kazini.' },
        'audio-video': { name: 'Sauti & video', description: 'Vifaa vya sauti na video kutoka kwa chapa za kuaminika.' },
        accessories: { name: 'Vifaa vya ziada', description: 'Vifaa muhimu vya simu na kompyuta.' },
    },
    demo_products: {
        'premium-item': {
            name: 'Bidhaa bora ya marketplace',
            description: 'Bidhaa ya onyesho — orodha ya majaribio kwa marketplace.',
        },
    },
};

const productExt = {
    fr: {
        quantity: 'Quantité',
        available_items: ':count articles disponibles',
        product_description: 'Description du produit',
        secure_payments: 'Paiements sécurisés',
        secure_payments_desc: 'Paiements 100 % sécurisés par mobile money ou carte.',
        local_delivery_desc: 'Livraison organisée directement avec le vendeur.',
        no_reviews_yet: 'Aucun avis pour le moment',
        sold: 'Vendus',
        rating: 'Note',
        joined: 'Inscrit',
        seller_new: 'Nouveau',
        whatsapp: 'WhatsApp',
        demo_preview_badge: 'Produit de démonstration — annonce test pour la marketplace',
        chat_buyer_only: 'Seuls les comptes acheteurs peuvent contacter les vendeurs.',
        chat_unavailable: 'Le chat vendeur n\'est pas disponible pour cette annonce.',
        chat_error: 'Impossible de démarrer le chat.',
        breadcrumb_home: 'Accueil',
    },
    en: {
        quantity: 'Quantity',
        available_items: ':count items available',
        product_description: 'Product Description',
        secure_payments: 'Secure Payments',
        secure_payments_desc: '100% secure payments using mobile money or cards.',
        local_delivery_desc: 'Delivery arranged directly with the seller.',
        no_reviews_yet: 'No reviews yet',
        sold: 'Sold',
        rating: 'Rating',
        joined: 'Joined',
        seller_new: 'New',
        whatsapp: 'WhatsApp',
        demo_preview_badge: 'Preview product — demo listing for marketplace testing',
        chat_buyer_only: 'Only buyer accounts can message sellers.',
        chat_unavailable: 'Seller chat is not available for this listing.',
        chat_error: 'Unable to start chat.',
        breadcrumb_home: 'Home',
    },
    ln: {
        quantity: 'Motango',
        available_items: ':count biloko ezali',
        product_description: 'Ndimbola ya produit',
        secure_payments: 'Kofuta ya sécurisé',
        secure_payments_desc: 'Kofuta 100 % sécurisé na mobile money to carte.',
        local_delivery_desc: 'Livraison esalemi directement na motɛki.',
        no_reviews_yet: 'Avis moko te nanu',
        sold: 'Etíami',
        rating: 'Note',
        joined: 'Ekotaki',
        seller_new: 'Ya sika',
        demo_preview_badge: 'Produit ya démonstration — annonce test',
        breadcrumb_home: 'Liboso',
    },
    sw: {
        quantity: 'Kiasi',
        available_items: 'Bidhaa :count zinapatikana',
        product_description: 'Maelezo ya bidhaa',
        secure_payments: 'Malipo salama',
        secure_payments_desc: 'Malipo salama 100% kwa pesa ya simu au kadi.',
        local_delivery_desc: 'Uwasilishaji unapangwa moja kwa moja na muuzaji.',
        no_reviews_yet: 'Hakuna maoni bado',
        sold: 'Imeuzwa',
        rating: 'Ukadiriaji',
        joined: 'Alijiunga',
        seller_new: 'Mpya',
        demo_preview_badge: 'Bidhaa ya onyesho — orodha ya majaribio',
        breadcrumb_home: 'Nyumbani',
    },
};

const categoriesPageExt = {
    fr: {
        home: 'Accueil',
        categories: 'Catégories',
        shop_by_type: 'Acheter par type de :category',
        shop_by_type_subtitle: 'Parcourez les sous-catégories pour trouver exactement ce dont vous avez besoin.',
        featured_category: ':category en vedette',
        featured_subtitle: 'Offres sélectionnées et produits les mieux notés de vendeurs de confiance.',
        popular_brands: 'Marques populaires',
        popular_brands_subtitle: 'Achetez auprès des marques les plus fiables.',
        all_products_title: 'Tous les produits :category',
        all_products_subtitle: ':count produits dans cette catégorie.',
        view_all_grid: 'Voir tout en grille',
        no_products_yet: 'Aucun produit pour le moment',
        no_products_check_back: 'Revenez bientôt ou parcourez une autre catégorie.',
        browse_category: 'Parcourir :category',
        shop_with_confidence: 'Achetez :category en toute confiance',
        shop_with_confidence_desc: 'Chaque achat sur PenePene est soutenu par des vendeurs vérifiés, un paiement sécurisé et un support local réactif.',
        verified_sellers_desc: 'Achetez uniquement auprès de commerçants approuvés et de confiance.',
        local_delivery: 'Livraison locale',
        local_delivery_desc: 'Options de livraison rapide depuis des vendeurs de votre ville.',
        buyer_support: 'Support acheteur',
        buyer_support_desc: 'Obtenez de l\'aide avant et après chaque achat.',
        browse_all_category: 'Parcourir tout :category',
        default_category_desc: 'Découvrez les meilleurs :category de vendeurs locaux vérifiés sur PenePene.',
    },
    en: {
        home: 'Home',
        categories: 'Categories',
        shop_by_type: 'Shop by :category Type',
        shop_by_type_subtitle: 'Browse subcategories to find exactly what you need.',
        featured_category: 'Featured :category',
        featured_subtitle: 'Hand-picked deals and top-rated products from trusted sellers.',
        popular_brands: 'Popular Brands',
        popular_brands_subtitle: 'Shop from the world\'s most trusted brands.',
        all_products_title: 'All :category Products',
        all_products_subtitle: 'Showing :count products in this category.',
        view_all_grid: 'View all in grid',
        no_products_yet: 'No products yet',
        no_products_check_back: 'Check back soon or browse another category.',
        browse_category: 'Browse :category',
        shop_with_confidence: 'Shop :category with Confidence',
        shop_with_confidence_desc: 'Every purchase on PenePene is backed by verified sellers, secure checkout, and responsive local support.',
        verified_sellers_desc: 'Buy only from approved and trusted merchants.',
        local_delivery: 'Local Delivery',
        local_delivery_desc: 'Fast delivery options from sellers in your city.',
        buyer_support: 'Buyer Support',
        buyer_support_desc: 'Get help before and after every purchase.',
        browse_all_category: 'Browse All :category',
        default_category_desc: 'Discover the best :category from verified local sellers on PenePene.',
    },
    ln: {
        home: 'Liboso',
        categories: 'Ba catégories',
        shop_by_type: 'Somba na lolenge ya :category',
        shop_by_type_subtitle: 'Parcourir ba sous-catégories mpo na kozua oyo ozali koluka.',
        featured_category: ':category ya minene',
        popular_brands: 'Ba marques minene',
        all_products_title: 'Biloko nyonso ya :category',
        no_products_yet: 'Biloko moko te nanu',
        local_delivery: 'Livraison ya mboka',
        buyer_support: 'Lisalisi ya acheteur',
        browse_all_category: 'Parcourir :category nyonso',
    },
    sw: {
        home: 'Nyumbani',
        categories: 'Kategoria',
        shop_by_type: 'Nunua kwa aina ya :category',
        shop_by_type_subtitle: 'Vinjari kategoria ndogo kupata unachohitaji.',
        featured_category: ':category bora',
        popular_brands: 'Chapa maarufu',
        all_products_title: 'Bidhaa zote za :category',
        no_products_yet: 'Hakuna bidhaa bado',
        local_delivery: 'Uwasilishaji wa ndani',
        buyer_support: 'Msaada wa mnunuzi',
        browse_all_category: 'Vinjari :category zote',
    },
};

const filtersExt = {
    fr: { seller_type: 'Type de vendeur', filters: 'Filtres' },
    en: { seller_type: 'Seller Type', filters: 'Filters' },
    ln: { seller_type: 'Lolenge ya motɛki', filters: 'Ba filtres' },
    sw: { seller_type: 'Aina ya muuzaji', filters: 'Vichujio' },
};

for (const locale of ['fr', 'en', 'ln', 'sw']) {
    const filePath = join(langDir, `${locale}.json`);
    const data = JSON.parse(readFileSync(filePath, 'utf8'));

    data.catalog = catalog[locale];
    data.product = { ...data.product, ...productExt[locale] };
    data.categories_page = { ...data.categories_page, ...categoriesPageExt[locale] };
    data.filters = { ...data.filters, ...filtersExt[locale] };

    writeFileSync(filePath, JSON.stringify(data, null, 4) + '\n', 'utf8');
    console.log(`Updated ${locale}.json with catalog translations`);
}
