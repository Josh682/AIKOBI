'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Menu, X, ArrowUpRight } from 'lucide-react';

export function AikobiTopbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Beranda', href: '/' },
    { label: 'Konsultasi Bisnis', href: '/konsultasi' },
    { label: 'Tanya KOBI', href: '/tanya' },
    { label: 'Tentang', href: '/tentang' },
    { label: 'Sandbox', href: '/tokens-test' },
  ];

  return (
    <header className="sticky top-3 sm:top-4 z-50 w-full px-3 sm:px-6 max-w-7xl mx-auto transition-transform duration-200">
      <div className="liquid-glass-nav px-4 sm:px-6 h-14 sm:h-16 rounded-full flex items-center justify-between">
        {/* Brand Monogram & Title (Horizontal Compact Lockup) */}
        <Link
          href="/"
          className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
            <Image
              src="/brand/logo-mark.png"
              alt="AIKOBI Symbol"
              width={36}
              height={36}
              className="w-full h-full object-contain dark:hidden"
              priority
            />
            <Image
              src="/brand/logo-mark-dark.png"
              alt="AIKOBI Symbol"
              width={36}
              height={36}
              className="w-full h-full object-contain hidden dark:block"
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              AIKOBI
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              Konsultan Bisnis
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Navigasi Utama">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href === '/konsultasi' && pathname === '/ai') ||
              (link.href === '/tanya' && pathname === '/pasar');

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Status Beacon + Theme Toggle + Mobile Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Tokopedia Sensor Ready Static Operational Beacon */}
          <div
            className="hidden lg:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold select-none"
            title="Sistem sensor dan ekstraksi Tokopedia aktif normal"
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Tokopedia Sensor Ready</span>
          </div>

          <ThemeToggle />

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 liquid-glass-modal p-4 space-y-1.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold w-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Tokopedia Sensor Ready
          </div>

          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href === '/konsultasi' && pathname === '/ai') ||
              (link.href === '/tanya' && pathname === '/pasar');

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <span>{link.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
