import useTranslation from '@/hooks/useTranslation';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowRight, MessageSquare, Users } from 'lucide-react';

export default function CommunityForum() {
    const { t } = useTranslation();
    return (
        <AppLayout>
            <Head title="Community Forum" />

            <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
                <div className="max-w-2xl w-full text-center">
                    <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-sm font-bold px-4 py-2 rounded-full mb-8 uppercase tracking-wider">
                        Coming Soon
                    </div>

                    <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <Users size={36} className="text-primary-600" />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                        PenePene Community Forum
                    </h1>

                    <p className="text-lg text-gray-600 leading-relaxed mb-10 max-w-xl mx-auto">
                        We&apos;re building a space where buyers and sellers can share tips, ask questions,
                        and connect with the PenePene community. Stay tuned — the forum launches soon.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/seller/register"
                            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg"
                        >
                            {t('nav.start_selling')}
                            <ArrowRight size={18} />
                        </Link>
                        <Link
                            href="/seller-resources"
                            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold px-6 py-4"
                        >
                            <MessageSquare size={18} />
                            Browse Seller Resources
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
