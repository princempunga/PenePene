import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import RdcGovLogo from '@/Components/Brand/RdcGovLogo';

export default function GovernmentAuthLayout({
    title,
    subtitle,
    headline,
    benefits = [],
    children,
    maxWidth = 'max-w-[480px]',
    footer,
}) {
    return (
        <div className="min-h-screen flex overflow-x-hidden bg-[#eef4fb]">
            <div className="hidden lg:flex lg:w-[48%] xl:w-[46%] relative overflow-hidden flex-col justify-between p-10 xl:p-14 rdc-gov-panel">
                <div className="rdc-flag-stripe rdc-flag-stripe-top" />
                <div className="rdc-flag-stripe rdc-flag-stripe-mid" />
                <div className="rdc-flag-stripe rdc-flag-stripe-bot" />
                <div className="auth-orb auth-orb-gold opacity-40" />
                <div className="auth-grid-pattern absolute inset-0 opacity-30" />

                <motion.div className="relative z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                    <RdcGovLogo asLink={false} surface variant="full" />
                </motion.div>

                <motion.div
                    className="relative z-10 flex-1 flex flex-col justify-center py-10"
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.12 }}
                >
                    <p className="text-[#F7D618] text-sm font-semibold tracking-[0.18em] uppercase mb-4">
                        Portail officiel
                    </p>
                    <h1 className="text-[2rem] xl:text-[2.5rem] font-extrabold leading-[1.12] text-white mb-8 tracking-tight max-w-lg">
                        {headline}
                    </h1>
                    <ul className="space-y-4 max-w-md">
                        {benefits.map((item, i) => (
                            <motion.li
                                key={i}
                                className="flex items-start gap-3 text-[15px] text-blue-50/95 leading-relaxed"
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25 + i * 0.09 }}
                            >
                                <CheckCircle2 className="text-[#F7D618] shrink-0 mt-0.5" size={20} strokeWidth={2.5} />
                                <span>{item}</span>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>

                <motion.p className="relative z-10 text-xs text-blue-100/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
                    © {new Date().getFullYear()} République Démocratique du Congo
                </motion.p>
            </div>

            <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12 min-h-screen">
                <motion.div
                    className={`w-full ${maxWidth}`}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65 }}
                >
                    <div className="lg:hidden flex justify-center mb-8">
                        <RdcGovLogo asLink={false} variant="full" />
                    </div>

                    <div className="rdc-form-card bg-white rounded-[1.75rem] border border-[#007FFF]/10 shadow-[0_24px_64px_-28px_rgba(0,127,255,0.18)] p-8 sm:p-10">
                        <div className="mb-6 text-center lg:text-left">
                            <div className="flex gap-1 h-1 rounded-full overflow-hidden mb-5 max-w-[200px] mx-auto lg:mx-0">
                                <span className="flex-1 bg-[#007FFF]" />
                                <span className="flex-1 bg-[#F7D618]" />
                                <span className="flex-1 bg-[#CE1126]" />
                            </div>
                            <h2 className="text-2xl sm:text-[1.65rem] font-bold text-[#002E5D] tracking-tight">{title}</h2>
                            {subtitle && <p className="mt-2 text-[15px] text-gray-500 leading-relaxed">{subtitle}</p>}
                        </div>
                        {children}
                    </div>
                    {footer && <div className="mt-7 text-center lg:text-left">{footer}</div>}
                </motion.div>
            </div>
        </div>
    );
}
