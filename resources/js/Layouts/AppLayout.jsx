import React, { useState } from 'react';
import Navbar from '@/Components/Layout/Navbar';
import Footer from '@/Components/Layout/Footer';
import MobileMenu from '@/Components/Layout/MobileMenu';
import Toast from '@/Components/UI/Toast';

export default function AppLayout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Toast />
            <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
            
            <MobileMenu 
                isOpen={isMobileMenuOpen} 
                onClose={() => setIsMobileMenuOpen(false)} 
            />

            <main className="flex-grow pt-20 lg:pt-[136px]">
                {children}
            </main>

            <Footer />
        </div>
    );
}
