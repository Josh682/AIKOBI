'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const currentTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null;
    if (currentTheme) {
      setTheme(currentTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    try {
      localStorage.setItem('aikobi-theme', nextTheme);
    } catch {
      // ignore in incognito / restricted storage
    }
  };

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 opacity-60 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
      title={isDark ? 'Mode Terang (Clean Alabaster)' : 'Mode Gelap (Deep Obsidian)'}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer ${
        isDark
          ? 'bg-slate-800/80 hover:bg-slate-700 text-amber-400 border border-slate-700/80 shadow-md shadow-black/20'
          : 'bg-white/80 hover:bg-slate-100 text-slate-700 border border-slate-200/90 shadow-sm shadow-slate-900/5'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
