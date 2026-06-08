import React, { useState } from 'react';
import Navbar from '@/Components/Layout/Navbar';
import Footer from '@/Components/Layout/Footer';
import MobileMenu from '@/Components/Layout/MobileMenu';

export default function AppLayout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
            
            <MobileMenu 
                isOpen={isMobileMenuOpen} 
                onClose={() => setIsMobileMenuOpen(false)} 
            />

            <main className="flex-grow pt-16">
                {children}
            </main>

            <Footer />
        </div>
    );
}
