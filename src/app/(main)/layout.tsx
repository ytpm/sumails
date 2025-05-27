import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import HashScrollHandler from '@/components/HashScrollHandler';
import { LightThemeProvider } from '@/providers/themes/LightThemeProvider';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <LightThemeProvider>
      <Header />
      <HashScrollHandler />
      {children}
      <ScrollToTop />
      <Footer />
    </LightThemeProvider>
  );
}
