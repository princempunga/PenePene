import fs from 'fs';
import path from 'path';

const replacements = [
    ['Start Selling', "t('nav.start_selling')"],
    ['No products found', "t('products_page.no_products')"],
    ['Coming Soon', "t('common_ext.coming_soon')"],
    ['Explore Marketplace', "t('common_ext.explore_marketplace')"],
    ['Browse Products', "t('cart.browse_products')"],
    ['My Dashboard', "t('dashboard.title')"],
    ['Support Tickets', "t('support.title')"],
    ['My Reviews', "t('reviews_page.title')"],
];

function walk(dir, files = []) {
    for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) {
            walk(full, files);
        } else if (full.endsWith('.jsx')) {
            files.push(full);
        }
    }
    return files;
}

let count = 0;

for (const file of walk('resources/js')) {
    let src = fs.readFileSync(file, 'utf8');
    if (src.includes('useTranslation')) {
        continue;
    }

    let changed = false;
    for (const [from, to] of replacements) {
        if (src.includes(`>${from}<`) || src.includes(`"${from}"`) || src.includes(`'${from}'`)) {
            src = src.replaceAll(`>${from}<`, `>{${to}}<`);
            src = src.replaceAll(`"${from}"`, `{${to}}`);
            src = src.replaceAll(`'${from}'`, `{${to}}`);
            changed = true;
        }
    }

    if (!changed) {
        continue;
    }

    if (!src.includes("useTranslation")) {
        src = src.replace(
            /^(import React[^\n]*\n)/,
            "$1import useTranslation from '@/hooks/useTranslation';\n",
        );
        src = src.replace(
            /export default function (\w+)\([^)]*\)\s*\{/,
            (match) => `${match}\n    const { t } = useTranslation();`,
        );
    }

    fs.writeFileSync(file, src);
    count++;
    console.log('updated', file);
}

console.log('total', count);
