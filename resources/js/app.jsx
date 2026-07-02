import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import SplashLoader from '@/Components/UI/SplashLoader';

const appName = import.meta.env.VITE_APP_NAME || 'PenePene';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <SplashLoader>
                <App {...props} />
            </SplashLoader>
        );
    },
    progress: {
        color: '#0056B3',
        includeCSS: true,
        showSpinner: false,
        delay: 80,
    },
});
