"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { Logo } from '../shared/Logo';
import { useCartStore } from '../../store/cart.store';
import { useMounted } from '../../hooks/use-mounted';

import flo from '../../app/(public)/images/flo.png';

export function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMounted = useMounted();
  const itemCount = useCartStore((state) => state.getItemCount());
  const pathname = usePathname();

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Catálogo', href: '/productos' },
    { name: 'Seguimiento', href: '/seguimiento' },
    { name: 'Contacto', href: '/#contacto' },
  ];

  return (
    <header className="fixed top-4 inset-x-0 z-50 w-full flex justify-center px-4 pointer-events-none">
      <div className="mx-auto w-full max-w-5xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full px-4 sm:px-6 pointer-events-auto transition-all duration-300">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md">
              <Logo className="text-xl" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:space-x-10 lg:space-x-12 items-center">
            {navLinks.map((link) => {
              const isActive = link.href === '/' 
                ? pathname === '/' 
                : link.href.includes('#') 
                  ? false 
                  : pathname.startsWith(link.href);
              
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`relative group text-base lg:text-lg font-serif transition-all duration-300 px-2 py-1 ${
                    isActive ? 'text-brown italic font-bold' : 'text-brown/70 hover:text-brown'
                  }`}
                >
                  <span className="relative z-10">{link.name}</span>
                  
                  {/* Active Floral Indicator */}
                  {isActive && (
                    <div className="absolute -top-4 -right-3 w-6 h-6 opacity-80 animate-fade-in-up z-0 pointer-events-none">
                      <Image src={flo} alt="" layout="fill" objectFit="contain" className="animate-spin-slow" />
                    </div>
                  )}
                  
                  {/* Hover Underline */}
                  <div className={`absolute bottom-0 left-0 h-[1.5px] bg-gold/50 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              );
            })}
          </nav>

          {/* Cart Icon & Mobile Menu Button */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link 
              href="/carrito"
              className={`transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold relative inline-flex items-center justify-center gap-2 ${
                isMounted && itemCount > 0 
                  ? 'bg-brown text-cream hover:bg-brown/90 px-4 py-2 rounded-full font-serif italic text-sm shadow-md'
                  : 'text-brown hover:text-gold p-2 rounded-full'
              }`}
              aria-label="Ver carrito"
            >
              <ShoppingBag size={isMounted && itemCount > 0 ? 18 : 22} className={isMounted && itemCount === 0 ? "text-[#887870] hover:text-[#c8a96b] transition-colors" : ""} />
              {isMounted && itemCount > 0 && (
                <>
                  <span>Pedir</span>
                  <span className="flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-cream text-[10px] font-bold text-brown shadow-sm not-italic font-sans">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                </>
              )}
            </Link>
            
            <button
              className="md:hidden p-2 text-brown hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full bg-white/50 border border-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-24 inset-x-4 md:hidden pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl shadow-brown/5 rounded-3xl overflow-hidden p-2">
            {navLinks.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href.split('#')[0]);
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center px-4 py-3.5 rounded-2xl text-lg font-serif transition-colors ${
                    isActive ? 'bg-gold/10 text-brown italic font-bold' : 'text-brown/80 hover:bg-gold/5 hover:text-brown'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                  {isActive && (
                    <div className="ml-auto w-6 h-6 relative opacity-80">
                      <Image src={flo} alt="" layout="fill" objectFit="contain" className="animate-spin-slow" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
