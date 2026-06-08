import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SectionHeader({ title, subtitle, actionText, actionLink }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl"
            >
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-2 text-base text-gray-500">
                        {subtitle}
                    </p>
                )}
            </motion.div>
            
            {actionText && actionLink && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mt-4 sm:mt-0"
                >
                    <Link 
                        href={actionLink} 
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold group transition-colors"
                    >
                        {actionText}
                        <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            )}
        </div>
    );
}
