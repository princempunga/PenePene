<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Product;
use App\Models\Seller;
use App\Models\Subcategory;
use App\Services\DemoSimulationService;
use Illuminate\Support\Str;

class DemoProductService
{
    private const DEFAULT_IMAGE = '/images/demo-products/default.jpg';

    private const DEMO_SELLER = [
        'business_name'  => 'Tech Store Tz',
        'is_verified'    => true,
        'city'           => 'Dar es Salaam',
        'average_rating' => 4.7,
    ];

    private const CATEGORY_META = [
        'electronics' => [
            'description' => 'Shop the latest electronics from verified local sellers. Compare prices, read reviews, and buy smartphones, laptops, TVs, and accessories with confidence.',
            'image'       => '/images/categories/electronics.jpg',
        ],
        'fashion' => [
            'description' => 'Discover trending fashion, shoes, bags, and accessories from trusted local sellers at great prices.',
            'image'       => '/images/categories/fashion.jpg',
        ],
        'home-living' => [
            'description' => 'Transform your space with furniture, decor, kitchenware, and home essentials from local sellers.',
            'image'       => '/images/categories/home-living.jpg',
        ],
        'vehicles' => [
            'description' => 'Browse cars, motorcycles, spare parts, and vehicle accessories from verified dealers near you.',
            'image'       => '/images/categories/vehicles.jpg',
        ],
        'health-beauty' => [
            'description' => 'Shop skincare, hair care, makeup, and wellness products from top local beauty sellers.',
            'image'       => '/images/categories/health-beauty.jpg',
        ],
    ];

    private const SUBCATEGORY_META = [
        'mobile-phones' => [
            'name'        => 'Mobile Phones',
            'description' => 'Discover the latest smartphones from top brands at competitive local prices.',
            'image'       => '/images/demo-products/iphone.jpg',
        ],
        'laptops-computers' => [
            'name'        => 'Laptops & Computers',
            'description' => 'Powerful laptops and notebooks for work, study, and everyday productivity.',
            'image'       => '/images/demo-products/macbook.jpg',
        ],
        'accessories' => [
            'name'        => 'Accessories',
            'description' => 'Essential phone and computer accessories to complete your setup.',
            'image'       => '/images/demo-products/powerbank.jpg',
        ],
        'audio-sound' => [
            'name'        => 'Audio & Sound',
            'description' => 'Premium speakers, headphones, and audio gear for every lifestyle.',
            'image'       => '/images/demo-products/speaker.jpg',
        ],
        'tvs' => [
            'name'        => 'TVs',
            'description' => 'Smart TVs and home entertainment displays for every room.',
            'image'       => '/images/demo-products/tv.jpg',
        ],
        'phones-tablets' => [
            'name'        => 'Phones & Tablets',
            'description' => 'Smartphones and tablets for communication, work, and entertainment.',
            'image'       => '/images/demo-products/samsung.jpg',
        ],
        'computers' => [
            'name'        => 'Computers',
            'description' => 'Desktops, all-in-ones, and custom PC builds for home and office.',
            'image'       => '/images/demo-products/desktop.jpg',
        ],
        'audio-video' => [
            'name'        => 'Audio & Video',
            'description' => 'Home theater, headphones, and multimedia equipment from trusted brands.',
            'image'       => '/images/demo-products/headphones.jpg',
        ],
    ];

    public static function normalizeSubcategorySlug(?string $slug, string $categorySlug = 'electronics'): ?string
    {
        if (empty($slug)) {
            return null;
        }

        $slug = Str::slug($slug);

        if (str_starts_with($slug, $categorySlug . '-')) {
            return substr($slug, strlen($categorySlug) + 1);
        }

        return $slug;
    }

    public static function resolveSubcategory(?string $slug, ?string $categorySlug = null): ?Subcategory
    {
        if (empty($slug)) {
            return null;
        }

        $slug = Str::slug($slug);

        $subcategory = Subcategory::where('slug', $slug)->first();

        if (! $subcategory && $categorySlug) {
            $subcategory = Subcategory::where('slug', $categorySlug . '-' . $slug)->first();
        }

        if (! $subcategory && $categorySlug) {
            $normalized = self::normalizeSubcategorySlug($slug, $categorySlug);
            $subcategory = Subcategory::where('slug', $categorySlug . '-' . $normalized)->first();
        }

        return $subcategory;
    }

    public static function subcategoryMetaKeys(): array
    {
        return array_keys(self::SUBCATEGORY_META);
    }

    public static function subcategoryMeta(?Subcategory $subcategory, ?string $rawSlug = null, string $categorySlug = 'electronics'): array
    {
        $key = self::normalizeSubcategorySlug($subcategory?->slug ?? $rawSlug, $categorySlug);
        $meta = self::SUBCATEGORY_META[$key] ?? null;

        return [
            'name'        => $subcategory?->name ?? $meta['name'] ?? 'Products',
            'description' => $subcategory?->description ?? $meta['description'] ?? 'Browse quality products from verified local sellers.',
            'image'       => $subcategory?->image ?? $meta['image'] ?? self::categoryImage(null),
            'slug'        => $subcategory?->slug ?? ($categorySlug . '-' . ($key ?? 'products')),
        ];
    }

    public static function forSubcategory(?Subcategory $subcategory, ?Category $category = null, ?string $rawSlug = null): array
    {
        $categorySlug = $category?->slug ?? 'electronics';
        $key = self::normalizeSubcategorySlug($subcategory?->slug ?? $rawSlug, $categorySlug);

        $catalog = self::catalog();
        $items = $catalog[$key] ?? [];

        if (empty($items) && $category) {
            return array_slice(self::forCategory($category), 0, 6);
        }

        return self::formatProducts($items, $category);
    }

    public static function forCategory(?Category $category): array
    {
        $slug = $category?->slug ?? 'general';
        $items = self::categoryCatalog()[$slug] ?? self::genericCatalog();

        return self::formatProducts($items, $category);
    }

    public static function featuredForCategory(?Category $category, int $limit = 8): array
    {
        return array_slice(self::forCategory($category), 0, $limit);
    }

    public static function generalCatalog(): array
    {
        return self::formatProducts(self::genericCatalog(), null);
    }

    public static function flashDeals(?Category $category = null): array
    {
        $items = array_map(function (array $item) {
            $item['sale_price'] = round($item['price'] * 0.75, 2);
            $item['badge'] = 'Hot Deal';

            return $item;
        }, self::categoryCatalog()['electronics'] ?? self::genericCatalog());

        return self::formatProducts($items, $category);
    }

    public static function categoryDescription(?Category $category): string
    {
        $slug = $category?->slug ?? 'general';

        if (! empty($category?->description)) {
            return $category->description;
        }

        return self::CATEGORY_META[$slug]['description']
            ?? 'Browse quality products from verified local sellers on PenePene.';
    }

    public static function categoryImage(?Category $category): string
    {
        $slug = $category?->slug ?? 'general';

        return $category?->image
            ?? self::CATEGORY_META[$slug]['image']
            ?? '/images/categories/default.jpg';
    }

    public static function popularBrands(): array
    {
        return [
            ['name' => 'Samsung', 'logo' => '/images/demo-products/samsung.jpg'],
            ['name' => 'Apple', 'logo' => '/images/demo-products/iphone.jpg'],
            ['name' => 'Sony', 'logo' => '/images/demo-products/headphones.jpg'],
            ['name' => 'HP', 'logo' => '/images/demo-products/hp-laptop.jpg'],
            ['name' => 'Dell', 'logo' => '/images/demo-products/hp-laptop.jpg'],
            ['name' => 'LG', 'logo' => '/images/demo-products/tv.jpg'],
            ['name' => 'JBL', 'logo' => '/images/demo-products/speaker.jpg'],
            ['name' => 'Tecno', 'logo' => '/images/demo-products/tecno.jpg'],
        ];
    }

    private static function formatProducts(array $items, ?Category $category): array
    {
        return array_map(function (array $item, int $index) use ($category) {
            return [
                'id'              => 'demo-' . ($item['slug'] ?? $index),
                'is_demo'         => true,
                'name'            => $item['name'],
                'slug'            => 'demo-' . ($item['slug'] ?? Str::slug($item['name'])),
                'price'           => $item['price'],
                'sale_price'      => $item['sale_price'] ?? null,
                'currency'        => 'USD',
                'city'            => $item['city'] ?? 'Kinshasa',
                'average_rating'  => $item['rating'],
                'total_reviews'   => $item['reviews'] ?? (abs(crc32($item['slug'] ?? (string) $index)) % 169) + 12,
                'badge'           => $item['badge'],
                'brand'           => $item['brand'] ?? null,
                'condition'       => $item['condition'] ?? 'New',
                'demo_image'      => $item['image'],
                'images'          => [],
                'is_sponsored'    => $item['badge'] === 'Sponsored',
                'seller'          => array_merge(self::DEMO_SELLER, [
                    'business_name' => $item['seller'] ?? self::DEMO_SELLER['business_name'],
                ]),
                'category'        => $category ? [
                    'id'   => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                ] : ['name' => 'Electronics', 'slug' => 'electronics'],
            ];
        }, $items, array_keys($items));
    }

    private static function categoryCatalog(): array
    {
        return [
            'electronics' => array_merge(...array_map(fn ($items) => array_slice($items, 0, 2), array_values(self::catalog()))),
            'fashion' => [
                ['name' => 'Men\'s Casual Jacket', 'slug' => 'mens-casual-jacket', 'price' => 89, 'rating' => 4.5, 'badge' => 'Popular', 'brand' => 'Zara', 'image' => '/images/categories/fashion.jpg', 'seller' => 'Fashion Hub Kinshasa'],
                ['name' => 'Women\'s Summer Dress', 'slug' => 'womens-summer-dress', 'price' => 65, 'sale_price' => 49, 'rating' => 4.6, 'badge' => 'Hot Deal', 'brand' => 'H&M', 'image' => '/images/categories/fashion.jpg'],
                ['name' => 'Leather Sneakers', 'slug' => 'leather-sneakers', 'price' => 120, 'rating' => 4.4, 'badge' => 'New', 'brand' => 'Nike', 'image' => '/images/demo-products/default.jpg'],
                ['name' => 'Designer Handbag', 'slug' => 'designer-handbag', 'price' => 199, 'rating' => 4.7, 'badge' => 'Sponsored', 'brand' => 'Coach', 'image' => '/images/categories/fashion.jpg'],
                ['name' => 'Gold Chain Necklace', 'slug' => 'gold-chain-necklace', 'price' => 75, 'rating' => 4.3, 'badge' => 'Popular', 'brand' => 'Local Jeweler', 'image' => '/images/demo-products/default.jpg'],
                ['name' => 'Classic Denim Jeans', 'slug' => 'classic-denim-jeans', 'price' => 55, 'rating' => 4.5, 'badge' => 'New', 'brand' => 'Levi\'s', 'image' => '/images/categories/fashion.jpg'],
            ],
            'home-living' => [
                ['name' => 'Modern Sofa Set', 'slug' => 'modern-sofa-set', 'price' => 899, 'rating' => 4.6, 'badge' => 'Popular', 'brand' => 'HomeStyle', 'image' => '/images/categories/home-living.jpg'],
                ['name' => 'Ceramic Dinner Set', 'slug' => 'ceramic-dinner-set', 'price' => 79, 'rating' => 4.4, 'badge' => 'New', 'brand' => 'KitchenPro', 'image' => '/images/categories/home-living.jpg'],
                ['name' => 'LED Floor Lamp', 'slug' => 'led-floor-lamp', 'price' => 129, 'rating' => 4.5, 'badge' => 'Sponsored', 'brand' => 'Philips', 'image' => '/images/demo-products/default.jpg'],
                ['name' => 'Memory Foam Mattress', 'slug' => 'memory-foam-mattress', 'price' => 349, 'sale_price' => 299, 'rating' => 4.7, 'badge' => 'Hot Deal', 'brand' => 'SleepWell', 'image' => '/images/categories/home-living.jpg'],
                ['name' => 'Wall Art Canvas', 'slug' => 'wall-art-canvas', 'price' => 45, 'rating' => 4.2, 'badge' => 'Popular', 'brand' => 'DecorPlus', 'image' => '/images/demo-products/default.jpg'],
                ['name' => 'Storage Ottoman', 'slug' => 'storage-ottoman', 'price' => 89, 'rating' => 4.3, 'badge' => 'New', 'brand' => 'HomeStyle', 'image' => '/images/categories/home-living.jpg'],
            ],
            'vehicles' => [
                ['name' => 'Toyota Corolla 2020', 'slug' => 'toyota-corolla-2020', 'price' => 18500, 'rating' => 4.8, 'badge' => 'Popular', 'brand' => 'Toyota', 'image' => '/images/categories/vehicles.jpg', 'seller' => 'Auto Dealers Kinshasa'],
                ['name' => 'Honda Motorcycle CB125', 'slug' => 'honda-cb125', 'price' => 2200, 'rating' => 4.6, 'badge' => 'New', 'brand' => 'Honda', 'image' => '/images/categories/vehicles.jpg'],
                ['name' => 'Brake Pad Set', 'slug' => 'brake-pad-set', 'price' => 85, 'rating' => 4.4, 'badge' => 'Sponsored', 'brand' => 'Bosch', 'image' => '/images/demo-products/default.jpg'],
                ['name' => 'Isuzu Truck NKR', 'slug' => 'isuzu-truck-nkr', 'price' => 28000, 'rating' => 4.5, 'badge' => 'Hot Deal', 'brand' => 'Isuzu', 'image' => '/images/categories/vehicles.jpg'],
                ['name' => 'Car Battery 12V', 'slug' => 'car-battery-12v', 'price' => 120, 'rating' => 4.3, 'badge' => 'Popular', 'brand' => 'Varta', 'image' => '/images/demo-products/default.jpg'],
                ['name' => 'Alloy Wheel Set', 'slug' => 'alloy-wheel-set', 'price' => 450, 'rating' => 4.5, 'badge' => 'New', 'brand' => 'OZ Racing', 'image' => '/images/categories/vehicles.jpg'],
            ],
            'health-beauty' => [
                ['name' => 'Vitamin C Serum', 'slug' => 'vitamin-c-serum', 'price' => 29, 'rating' => 4.7, 'badge' => 'Popular', 'brand' => 'The Ordinary', 'image' => '/images/categories/health-beauty.jpg'],
                ['name' => 'Hydrating Face Cream', 'slug' => 'hydrating-face-cream', 'price' => 35, 'rating' => 4.6, 'badge' => 'New', 'brand' => 'CeraVe', 'image' => '/images/categories/health-beauty.jpg'],
                ['name' => 'Hair Growth Oil', 'slug' => 'hair-growth-oil', 'price' => 22, 'rating' => 4.4, 'badge' => 'Sponsored', 'brand' => 'Local Naturals', 'image' => '/images/demo-products/default.jpg'],
                ['name' => 'Perfume Eau de Parfum', 'slug' => 'perfume-edp', 'price' => 89, 'sale_price' => 69, 'rating' => 4.8, 'badge' => 'Hot Deal', 'brand' => 'Chanel', 'image' => '/images/categories/health-beauty.jpg'],
                ['name' => 'Electric Toothbrush', 'slug' => 'electric-toothbrush', 'price' => 59, 'rating' => 4.5, 'badge' => 'Popular', 'brand' => 'Oral-B', 'image' => '/images/demo-products/default.jpg'],
                ['name' => 'Baby Care Gift Set', 'slug' => 'baby-care-gift-set', 'price' => 45, 'rating' => 4.6, 'badge' => 'New', 'brand' => 'Johnson\'s', 'image' => '/images/categories/health-beauty.jpg'],
            ],
        ];
    }

    private static function genericCatalog(): array
    {
        return [
            ['name' => 'Premium Marketplace Item', 'slug' => 'premium-item', 'price' => 99, 'rating' => 4.5, 'badge' => 'Popular', 'brand' => 'PenePene', 'image' => '/images/demo-products/default.jpg'],
            ['name' => 'Best Seller Product', 'slug' => 'best-seller', 'price' => 149, 'sale_price' => 119, 'rating' => 4.7, 'badge' => 'Hot Deal', 'brand' => 'Local Brand', 'image' => '/images/demo-products/default.jpg'],
            ['name' => 'New Arrival', 'slug' => 'new-arrival', 'price' => 79, 'rating' => 4.4, 'badge' => 'New', 'brand' => 'Verified Seller', 'image' => '/images/demo-products/default.jpg'],
            ['name' => 'Sponsored Pick', 'slug' => 'sponsored-pick', 'price' => 199, 'rating' => 4.6, 'badge' => 'Sponsored', 'brand' => 'Top Store', 'image' => '/images/demo-products/default.jpg'],
            ['name' => 'Local Favorite', 'slug' => 'local-favorite', 'price' => 59, 'rating' => 4.3, 'badge' => 'Popular', 'brand' => 'Kinshasa Shop', 'image' => '/images/demo-products/default.jpg'],
            ['name' => 'Trending Deal', 'slug' => 'trending-deal', 'price' => 129, 'sale_price' => 99, 'rating' => 4.8, 'badge' => 'Hot Deal', 'brand' => 'Flash Store', 'image' => '/images/demo-products/default.jpg'],
        ];
    }

    private static function catalog(): array
    {
        return [
            'mobile-phones' => [
                ['name' => 'iPhone 14 Pro Max', 'slug' => 'iphone-14-pro-max', 'price' => 1299, 'rating' => 4.9, 'badge' => 'Popular', 'brand' => 'Apple', 'image' => '/images/demo-products/iphone.jpg', 'seller' => 'Apple Reseller Kinshasa'],
                ['name' => 'Samsung Galaxy S23 Ultra', 'slug' => 'samsung-galaxy-s23-ultra', 'price' => 1199, 'sale_price' => 1099, 'rating' => 4.8, 'badge' => 'Hot Deal', 'brand' => 'Samsung', 'image' => '/images/demo-products/samsung.jpg'],
                ['name' => 'Tecno Camon 20', 'slug' => 'tecno-camon-20', 'price' => 289, 'rating' => 4.5, 'badge' => 'New', 'brand' => 'Tecno', 'image' => '/images/demo-products/tecno.jpg', 'city' => 'Lubumbashi'],
                ['name' => 'Infinix Note 30', 'slug' => 'infinix-note-30', 'price' => 249, 'rating' => 4.4, 'badge' => 'Popular', 'brand' => 'Infinix', 'image' => '/images/demo-products/samsung.jpg', 'city' => 'Goma'],
                ['name' => 'Redmi Note 12', 'slug' => 'redmi-note-12', 'price' => 199, 'rating' => 4.6, 'badge' => 'New', 'brand' => 'Xiaomi', 'image' => '/images/demo-products/tecno.jpg'],
            ],
            'laptops-computers' => [
                ['name' => 'HP EliteBook', 'slug' => 'hp-elitebook', 'price' => 899, 'rating' => 4.7, 'badge' => 'Popular', 'brand' => 'HP', 'image' => '/images/demo-products/hp-laptop.jpg'],
                ['name' => 'Dell Latitude', 'slug' => 'dell-latitude', 'price' => 849, 'rating' => 4.6, 'badge' => 'Sponsored', 'brand' => 'Dell', 'image' => '/images/demo-products/hp-laptop.jpg'],
                ['name' => 'MacBook Pro', 'slug' => 'macbook-pro', 'price' => 1999, 'rating' => 4.9, 'badge' => 'Hot Deal', 'brand' => 'Apple', 'image' => '/images/demo-products/macbook.jpg'],
                ['name' => 'Lenovo ThinkPad', 'slug' => 'lenovo-thinkpad', 'price' => 799, 'rating' => 4.5, 'badge' => 'New', 'brand' => 'Lenovo', 'image' => '/images/demo-products/hp-laptop.jpg'],
                ['name' => 'ASUS VivoBook', 'slug' => 'asus-vivobook', 'price' => 649, 'rating' => 4.4, 'badge' => 'Popular', 'brand' => 'ASUS', 'image' => '/images/demo-products/macbook.jpg'],
            ],
            'accessories' => [
                ['name' => 'Wireless Charger', 'slug' => 'wireless-charger', 'price' => 35, 'rating' => 4.3, 'badge' => 'New', 'brand' => 'Anker', 'image' => '/images/demo-products/powerbank.jpg'],
                ['name' => 'Phone Case', 'slug' => 'phone-case', 'price' => 18, 'rating' => 4.2, 'badge' => 'Popular', 'brand' => 'Spigen', 'image' => '/images/demo-products/powerbank.jpg'],
                ['name' => 'Bluetooth Keyboard', 'slug' => 'bluetooth-keyboard', 'price' => 59, 'rating' => 4.5, 'badge' => 'Sponsored', 'brand' => 'Logitech', 'image' => '/images/demo-products/powerbank.jpg'],
                ['name' => 'Power Bank', 'slug' => 'power-bank', 'price' => 45, 'rating' => 4.6, 'badge' => 'Hot Deal', 'brand' => 'Anker', 'image' => '/images/demo-products/powerbank.jpg'],
                ['name' => 'USB-C Cable', 'slug' => 'usb-c-cable', 'price' => 12, 'rating' => 4.1, 'badge' => 'New', 'brand' => 'Baseus', 'image' => '/images/demo-products/powerbank.jpg'],
            ],
            'audio-sound' => [
                ['name' => 'JBL Speaker', 'slug' => 'jbl-speaker', 'price' => 129, 'rating' => 4.7, 'badge' => 'Popular', 'brand' => 'JBL', 'image' => '/images/demo-products/speaker.jpg'],
                ['name' => 'Sony Headphones', 'slug' => 'sony-headphones', 'price' => 249, 'rating' => 4.8, 'badge' => 'Hot Deal', 'brand' => 'Sony', 'image' => '/images/demo-products/headphones.jpg'],
                ['name' => 'AirPods Pro', 'slug' => 'airpods-pro', 'price' => 199, 'rating' => 4.9, 'badge' => 'Sponsored', 'brand' => 'Apple', 'image' => '/images/demo-products/headphones.jpg'],
                ['name' => 'Bluetooth Earbuds', 'slug' => 'bluetooth-earbuds', 'price' => 49, 'rating' => 4.4, 'badge' => 'New', 'brand' => 'Xiaomi', 'image' => '/images/demo-products/headphones.jpg'],
                ['name' => 'Home Theater Speaker', 'slug' => 'home-theater-speaker', 'price' => 399, 'rating' => 4.6, 'badge' => 'Popular', 'brand' => 'Sony', 'image' => '/images/demo-products/speaker.jpg'],
            ],
            'tvs' => [
                ['name' => 'Samsung Smart TV', 'slug' => 'samsung-smart-tv', 'price' => 599, 'rating' => 4.7, 'badge' => 'Popular', 'brand' => 'Samsung', 'image' => '/images/demo-products/tv.jpg'],
                ['name' => 'LG OLED TV', 'slug' => 'lg-oled-tv', 'price' => 1299, 'rating' => 4.9, 'badge' => 'Hot Deal', 'brand' => 'LG', 'image' => '/images/demo-products/tv.jpg'],
                ['name' => 'Hisense 43 Inch TV', 'slug' => 'hisense-43-tv', 'price' => 349, 'rating' => 4.5, 'badge' => 'New', 'brand' => 'Hisense', 'image' => '/images/demo-products/tv.jpg'],
                ['name' => 'TCL Android TV', 'slug' => 'tcl-android-tv', 'price' => 399, 'rating' => 4.4, 'badge' => 'Sponsored', 'brand' => 'TCL', 'image' => '/images/demo-products/tv.jpg'],
            ],
            'phones-tablets' => [
                ['name' => 'Samsung Galaxy Tab S9', 'slug' => 'galaxy-tab-s9', 'price' => 699, 'rating' => 4.7, 'badge' => 'Popular', 'brand' => 'Samsung', 'image' => '/images/demo-products/samsung.jpg'],
                ['name' => 'iPad Air', 'slug' => 'ipad-air', 'price' => 599, 'rating' => 4.8, 'badge' => 'Hot Deal', 'brand' => 'Apple', 'image' => '/images/demo-products/iphone.jpg'],
                ['name' => 'Redmi Pad', 'slug' => 'redmi-pad', 'price' => 199, 'rating' => 4.4, 'badge' => 'New', 'brand' => 'Xiaomi', 'image' => '/images/demo-products/tecno.jpg'],
                ['name' => 'Samsung Galaxy A54', 'slug' => 'galaxy-a54', 'price' => 349, 'rating' => 4.5, 'badge' => 'Popular', 'brand' => 'Samsung', 'image' => '/images/demo-products/samsung.jpg'],
            ],
            'computers' => [
                ['name' => 'Gaming Desktop', 'slug' => 'gaming-desktop', 'price' => 1499, 'rating' => 4.8, 'badge' => 'Hot Deal', 'brand' => 'Custom', 'image' => '/images/demo-products/desktop.jpg'],
                ['name' => 'Dell Desktop PC', 'slug' => 'dell-desktop-pc', 'price' => 699, 'rating' => 4.6, 'badge' => 'Popular', 'brand' => 'Dell', 'image' => '/images/demo-products/desktop.jpg'],
                ['name' => 'HP All-in-One', 'slug' => 'hp-all-in-one', 'price' => 799, 'rating' => 4.5, 'badge' => 'Sponsored', 'brand' => 'HP', 'image' => '/images/demo-products/desktop.jpg'],
                ['name' => 'Custom PC Setup', 'slug' => 'custom-pc-setup', 'price' => 1899, 'rating' => 4.9, 'badge' => 'New', 'brand' => 'Custom', 'image' => '/images/demo-products/desktop.jpg'],
            ],
            'audio-video' => [
                ['name' => 'Sony Headphones', 'slug' => 'sony-headphones-av', 'price' => 249, 'rating' => 4.8, 'badge' => 'Popular', 'brand' => 'Sony', 'image' => '/images/demo-products/headphones.jpg'],
                ['name' => 'JBL Party Speaker', 'slug' => 'jbl-party-speaker', 'price' => 299, 'rating' => 4.6, 'badge' => 'Hot Deal', 'brand' => 'JBL', 'image' => '/images/demo-products/speaker.jpg'],
                ['name' => 'LG Soundbar', 'slug' => 'lg-soundbar', 'price' => 349, 'rating' => 4.5, 'badge' => 'Sponsored', 'brand' => 'LG', 'image' => '/images/demo-products/speaker.jpg'],
                ['name' => '4K Projector', 'slug' => '4k-projector', 'price' => 599, 'rating' => 4.4, 'badge' => 'New', 'brand' => 'Epson', 'image' => '/images/demo-products/tv.jpg'],
            ],
        ];
    }

    public static function defaultImage(): string
    {
        return self::DEFAULT_IMAGE;
    }

    public static function publicImageUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        $path = ltrim($path, '/');

        if (str_starts_with($path, 'images/')) {
            return file_exists(public_path($path)) ? '/' . $path : null;
        }

        if (str_starts_with($path, 'storage/')) {
            $path = substr($path, 8);
        }

        if (str_starts_with($path, 'app/public/')) {
            $path = substr($path, 11);
        }

        $publicFile = public_path('storage/' . $path);

        return file_exists($publicFile) ? '/storage/' . $path : null;
    }

    public static function categoryHeroImage(?string $categorySlug): string
    {
        return match ($categorySlug) {
            'electronics'   => '/images/demo-products/iphone.jpg',
            'fashion'       => '/images/demo-products/default.jpg',
            'home-living'   => '/images/demo-products/default.jpg',
            'vehicles'      => '/images/demo-products/default.jpg',
            'health-beauty' => '/images/demo-products/default.jpg',
            default         => self::DEFAULT_IMAGE,
        };
    }

    public static function productImageUrl(Product $product): string
    {
        $primary = $product->images->firstWhere('is_primary', true) ?? $product->images->first();

        if ($primary?->image_path) {
            $url = self::publicImageUrl($primary->image_path);

            if ($url) {
                return $url;
            }
        }

        $demo = self::findBySlug($product->slug);

        if (! empty($demo['demo_image'])) {
            return self::publicImageUrl(ltrim($demo['demo_image'], '/')) ?? $demo['demo_image'];
        }

        return self::categoryHeroImage($product->category?->slug);
    }

    public static function heroProducts(int $count = 2): array
    {
        $slugs = [
            'demo-iphone-14-pro-max',
            'demo-samsung-galaxy-s23-ultra',
            'demo-sony-headphones',
            'demo-macbook-pro',
        ];

        $products = [];

        foreach ($slugs as $slug) {
            $demo = self::findBySlug($slug);

            if (! $demo) {
                continue;
            }

            $demo['image_url'] = $demo['demo_image'] ?? self::DEFAULT_IMAGE;
            $products[] = $demo;

            if (count($products) >= $count) {
                break;
            }
        }

        return $products;
    }

    public static function findBySlug(string $slug): ?array
    {
        $slug = Str::slug($slug);

        if (! str_starts_with($slug, 'demo-')) {
            $slug = 'demo-' . $slug;
        }

        return self::demoProductIndex()[$slug] ?? null;
    }

    public static function relatedForDemo(array $product, int $limit = 4): array
    {
        $categorySlug = $product['category']['slug'] ?? null;

        $related = collect(self::demoProductIndex())
            ->filter(fn (array $item) => $item['slug'] !== $product['slug'])
            ->when($categorySlug, fn ($items) => $items->filter(
                fn (array $item) => ($item['category']['slug'] ?? null) === $categorySlug
            ))
            ->take($limit)
            ->values()
            ->all();

        if (count($related) < $limit) {
            $related = collect(self::demoProductIndex())
                ->filter(fn (array $item) => $item['slug'] !== $product['slug'])
                ->take($limit)
                ->values()
                ->all();
        }

        return $related;
    }

    public static function prepareForShow(array $product): array
    {
        $imagePath = ltrim($product['demo_image'] ?? self::DEFAULT_IMAGE, '/');

        return array_merge($product, [
            'description'      => $product['description'] ?? self::previewDescription($product),
            'initial_stock'    => $product['initial_stock'] ?? 99,
            'confirmed_sales'  => $product['confirmed_sales'] ?? 0,
            'currency'         => $product['currency'] ?? 'USD',
            'images'           => [
                [
                    'id'          => 'demo-image',
                    'image_path'  => $imagePath,
                    'is_primary'  => true,
                ],
            ],
            'seller'           => array_merge([
                'slug'           => 'demo-seller',
                'logo'           => null,
                'phone'          => '+243812345678',
                'created_at'     => now()->subYears(2)->toISOString(),
                'average_rating' => $product['seller']['average_rating'] ?? 4.7,
            ], $product['seller'] ?? []),
        ]);
    }

    public static function cartSnapshot(array $product): array
    {
        return [
            'is_demo'      => true,
            'name'         => $product['name'],
            'slug'         => $product['slug'],
            'price'        => $product['price'],
            'sale_price'   => $product['sale_price'] ?? null,
            'image'        => $product['demo_image'] ?? self::DEFAULT_IMAGE,
            'seller_name'  => $product['seller']['business_name'] ?? 'Verified Seller',
        ];
    }

    public static function ensureDatabaseProduct(array $demo): Product
    {
        $seller = DemoSimulationService::demoSeller()
            ?? Seller::query()
                ->whereHas('user')
                ->where('status', 'verified')
                ->first()
            ?? Seller::query()->whereHas('user')->first();

        if (! $seller) {
            throw new \RuntimeException('No seller is available to process this order.');
        }

        $category = Category::where('slug', $demo['category']['slug'] ?? 'electronics')->first();

        return Product::updateOrCreate(
            ['slug' => $demo['slug']],
            [
                'seller_id'      => $seller->id,
                'category_id'    => $category?->id,
                'name'           => $demo['name'],
                'description'    => self::previewDescription($demo),
                'price'          => $demo['price'],
                'sale_price'     => $demo['sale_price'] ?? null,
                'currency'       => $demo['currency'] ?? 'USD',
                'initial_stock'  => 999,
                'confirmed_sales'=> Product::where('slug', $demo['slug'])->value('confirmed_sales') ?? 0,
                'status'         => 'active',
                'city'           => $demo['city'] ?? 'Kinshasa',
            ]
        );
    }

    private static function previewDescription(array $product): string
    {
        $brand = $product['brand'] ?? 'top brands';
        $condition = $product['condition'] ?? 'New';

        return "Preview listing for {$product['name']}. This {$condition} item from {$brand} is shown while real seller inventory is being added to PenePene. You can add it to your cart to test the shopping experience — checkout will be available once live listings go online.";
    }

    private static function demoProductIndex(): array
    {
        static $index = null;

        if ($index !== null) {
            return $index;
        }

        $products = [];

        foreach (Category::all() as $category) {
            $products = array_merge($products, self::forCategory($category));
        }

        foreach (self::catalog() as $items) {
            $products = array_merge($products, self::formatProducts($items, null));
        }

        $products = array_merge($products, self::generalCatalog());

        $index = [];

        foreach ($products as $product) {
            $index[$product['slug']] = $product;
        }

        return $index;
    }

    public static function subcategoryCardImage(string $subSlug, string $categorySlug = 'electronics'): string
    {
        $key = self::normalizeSubcategorySlug($subSlug, $categorySlug);

        return self::SUBCATEGORY_META[$key]['image'] ?? self::DEFAULT_IMAGE;
    }

    public static function filterDemo(array $products, array $filters): array
    {
        return array_values(array_filter($products, function (array $product) use ($filters) {
            $price = (float) ($product['sale_price'] ?? $product['price']);

            if (! empty($filters['min_price']) && $price < (float) $filters['min_price']) {
                return false;
            }

            if (! empty($filters['max_price']) && $price > (float) $filters['max_price']) {
                return false;
            }

            if (! empty($filters['city'])) {
                $city = strtolower($filters['city']);
                $productCity = strtolower($product['city'] ?? '');
                $sellerCity = strtolower($product['seller']['city'] ?? '');

                if (! str_contains($productCity, $city) && ! str_contains($sellerCity, $city)) {
                    return false;
                }
            }

            if (! empty($filters['brand'])) {
                $brand = strtolower($filters['brand']);
                $productBrand = strtolower($product['brand'] ?? '');
                $productName = strtolower($product['name'] ?? '');

                if ($productBrand !== $brand && ! str_contains($productName, $brand)) {
                    return false;
                }
            }

            if (! empty($filters['verified_seller']) && empty($product['seller']['is_verified'])) {
                return false;
            }

            if (! empty($filters['condition'])) {
                $condition = strtolower($filters['condition']);
                $productCondition = strtolower($product['condition'] ?? 'new');

                if ($productCondition !== $condition) {
                    return false;
                }
            }

            return true;
        }));
    }

    public static function sortDemo(array $products, ?string $sort): array
    {
        $collection = collect($products);

        return match ($sort) {
            'price_asc'  => $collection->sortBy(fn ($p) => $p['sale_price'] ?? $p['price'])->values()->all(),
            'price_desc' => $collection->sortByDesc(fn ($p) => $p['sale_price'] ?? $p['price'])->values()->all(),
            'rating'     => $collection->sortByDesc('average_rating')->values()->all(),
            'popular', 'popularity' => $collection->sortByDesc('total_reviews')->values()->all(),
            default      => $products,
        };
    }
}
