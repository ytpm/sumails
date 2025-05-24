"use client";

import { cn } from "@/utils";
import { Inbox, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 w-full transition-all duration-300",
        isScrolled ? "bg-white py-3 shadow-md" : "bg-transparent py-5",
      )}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Inbox className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-gray-900">Sumails</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
            >
              Testimonials
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
            >
              FAQ
            </a>
          </nav>

          <div className="hidden items-center space-x-4 md:flex">
            <a href="#" className="btn btn-outline">
              Log in
            </a>
            <a href="#" className="btn btn-primary">
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="p-2 text-gray-700 focus:outline-none md:hidden"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="animate-slide-down mt-4 py-4 md:hidden">
            <nav className="flex flex-col space-y-4">
              <a
                href="#features"
                className="text-base font-medium text-gray-700 transition-colors hover:text-primary-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-base font-medium text-gray-700 transition-colors hover:text-primary-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                className="text-base font-medium text-gray-700 transition-colors hover:text-primary-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Testimonials
              </a>
              <a
                href="#pricing"
                className="text-base font-medium text-gray-700 transition-colors hover:text-primary-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#faq"
                className="text-base font-medium text-gray-700 transition-colors hover:text-primary-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </a>
              <div className="flex flex-col space-y-3 pt-4">
                <a href="#" className="btn btn-outline w-full">
                  Log in
                </a>
                <a href="#" className="btn btn-primary w-full">
                  Get Started
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;