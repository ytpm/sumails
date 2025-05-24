import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { LightThemeProvider } from '@/components/light-theme-provider';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <LightThemeProvider>
      <Header />
      {children}
      <ScrollToTop />
      <Footer />
    </LightThemeProvider>
  );
}
