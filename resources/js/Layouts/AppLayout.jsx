import React, { useState } from 'react';
import Navbar from '@/Components/Layout/Navbar';
import MobileNavbar from '@/Components/Layout/MobileNavbar';
import MobileBottomNav from '@/Components/Layout/MobileBottomNav';
import Footer from '@/Components/Layout/Footer';
import MobileMenu from '@/Components/Layout/MobileMenu';
import Toast from '@/Components/UI/Toast';
import PageTransition from '@/Components/UI/PageTransition';

export default function AppLayout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 pb-[60px] md:pb-0">
            <Toast />
            <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
            <MobileNavbar />
            <MobileBottomNav onMenuClick={() => setIsMobileMenuOpen(true)} />
            
            <MobileMenu 
                isOpen={isMobileMenuOpen} 
                onClose={() => setIsMobileMenuOpen(false)} 
            />

            <main className="flex-grow pt-[60px] md:pt-20 lg:pt-[136px] flex flex-col">
                <PageTransition>
                    {children}
                </PageTransition>
            </main>

            <div className="hidden md:block">
                <Footer />
            </div>
        </div>
    );
}
