import {
    Smartphone,
    Shirt,
    Sofa,
    Sparkles,
    Car,
    Dumbbell,
    ShoppingBasket,
    Flower2,
    UtensilsCrossed,
    Truck,
    Building2,
    Wrench,
    Package,
    Laptop,
    Headphones,
    Tv,
    Watch,
    Gem,
    Home,
    BedDouble,
    ChefHat,
    Paintbrush,
    HeartPulse,
    SprayCan,
    Scissors,
    Cog,
    Bike,
    Apple,
    Coffee,
    Wheat,
    MapPin,
    Briefcase,
    Hammer,
    GraduationCap,
    PartyPopper,
    Camera,
    Gamepad2,
    Refrigerator,
    Leaf,
} from 'lucide-react';

/** Icônes + couleurs par slug de catégorie principale */
export const CATEGORY_ICON_MAP = {
    electronics: {
        Icon: Smartphone,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        ring: 'ring-blue-100',
        hoverBg: 'group-hover:bg-blue-100',
    },
    fashion: {
        Icon: Shirt,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        ring: 'ring-rose-100',
        hoverBg: 'group-hover:bg-rose-100',
    },
    'home-living': {
        Icon: Sofa,
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        ring: 'ring-amber-100',
        hoverBg: 'group-hover:bg-amber-100',
    },
    'health-beauty': {
        Icon: Sparkles,
        color: 'text-fuchsia-600',
        bg: 'bg-fuchsia-50',
        ring: 'ring-fuchsia-100',
        hoverBg: 'group-hover:bg-fuchsia-100',
    },
    automotive: {
        Icon: Cog,
        color: 'text-slate-700',
        bg: 'bg-slate-100',
        ring: 'ring-slate-200',
        hoverBg: 'group-hover:bg-slate-200',
    },
    'sports-outdoors': {
        Icon: Dumbbell,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        ring: 'ring-emerald-100',
        hoverBg: 'group-hover:bg-emerald-100',
    },
    groceries: {
        Icon: ShoppingBasket,
        color: 'text-lime-700',
        bg: 'bg-lime-50',
        ring: 'ring-lime-100',
        hoverBg: 'group-hover:bg-lime-100',
    },
    'home-garden': {
        Icon: Flower2,
        color: 'text-green-600',
        bg: 'bg-green-50',
        ring: 'ring-green-100',
        hoverBg: 'group-hover:bg-green-100',
    },
    'food-drinks': {
        Icon: UtensilsCrossed,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        ring: 'ring-orange-100',
        hoverBg: 'group-hover:bg-orange-100',
    },
    vehicles: {
        Icon: Car,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        ring: 'ring-indigo-100',
        hoverBg: 'group-hover:bg-indigo-100',
    },
    'real-estate': {
        Icon: Building2,
        color: 'text-cyan-700',
        bg: 'bg-cyan-50',
        ring: 'ring-cyan-100',
        hoverBg: 'group-hover:bg-cyan-100',
    },
    services: {
        Icon: Wrench,
        color: 'text-violet-600',
        bg: 'bg-violet-50',
        ring: 'ring-violet-100',
        hoverBg: 'group-hover:bg-violet-100',
    },
};

const DEFAULT_META = {
    Icon: Package,
    color: 'text-primary-600',
    bg: 'bg-primary-50',
    ring: 'ring-primary-100',
    hoverBg: 'group-hover:bg-primary-100',
};

/** Correspondance mot-clé dans le slug → icône sous-catégorie */
const SUBCATEGORY_RULES = [
    { pattern: /mobile|phone|smartphone/i, Icon: Smartphone },
    { pattern: /laptop|computer|pc|macbook/i, Icon: Laptop },
    { pattern: /audio|sound|headphone|speaker/i, Icon: Headphones },
    { pattern: /tv|television|monitor|display/i, Icon: Tv },
    { pattern: /accessor|watch|wearable/i, Icon: Watch },
    { pattern: /camera|photo/i, Icon: Camera },
    { pattern: /game|console|gaming/i, Icon: Gamepad2 },
    { pattern: /men|women|cloth|shirt|dress|fashion|sportswear/i, Icon: Shirt },
    { pattern: /shoe|sneaker|boot/i, Icon: Package },
    { pattern: /bag|accessor|jewel|gem/i, Icon: Gem },
    { pattern: /furniture|sofa|bed|bedding/i, Icon: BedDouble },
    { pattern: /kitchen|cook|chef/i, Icon: ChefHat },
    { pattern: /decor|paint|home/i, Icon: Paintbrush },
    { pattern: /garden|plant|flower|outdoor/i, Icon: Leaf },
    { pattern: /makeup|cosmetic|beauty|fragrance|skincare|hair/i, Icon: SprayCan },
    { pattern: /health|care|scissor/i, Icon: Scissors },
    { pattern: /fitness|gym|sport/i, Icon: Dumbbell },
    { pattern: /car|vehicle|truck|motor/i, Icon: Car },
    { pattern: /bike|bicycle/i, Icon: Bike },
    { pattern: /part|spare|automotive/i, Icon: Cog },
    { pattern: /fresh|produce|fruit|apple/i, Icon: Apple },
    { pattern: /beverage|drink|coffee/i, Icon: Coffee },
    { pattern: /snack|grain|cereal|canned|food/i, Icon: Wheat },
    { pattern: /house|rent|sale|land|commercial|estate|property/i, Icon: Home },
    { pattern: /clean|repair|tutor|event|cater|service/i, Icon: Briefcase },
    { pattern: /hammer|tool/i, Icon: Hammer },
    { pattern: /graduat|tutor|school/i, Icon: GraduationCap },
    { pattern: /party|event/i, Icon: PartyPopper },
    { pattern: /fridge|appliance/i, Icon: Refrigerator },
    { pattern: /local|deliver/i, Icon: MapPin },
    { pattern: /heart|pulse/i, Icon: HeartPulse },
];

export function getCategoryIconMeta(slug) {
    if (!slug) return DEFAULT_META;
    return CATEGORY_ICON_MAP[slug] || DEFAULT_META;
}

export function getSubcategoryIcon(slug, categorySlug) {
    const haystack = `${slug || ''} ${categorySlug || ''}`;
    for (const rule of SUBCATEGORY_RULES) {
        if (rule.pattern.test(haystack)) {
            return rule.Icon;
        }
    }
    const parent = getCategoryIconMeta(categorySlug);
    return parent.Icon;
}
