"use client";

import { cn } from "@/utils";
import { Inbox, Menu, X, User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const Header = () => {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const { isAuthenticated, authUser, signOut, isLoading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

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

	const handleSignOut = async () => {
		try {
			await signOut();
		} catch (error) {
			console.error('Error signing out:', error);
		}
	};

	const scrollToSection = (sectionId: string) => {
		// Close mobile menu first
		setIsMobileMenuOpen(false);
		
		// If we're not on the home page, navigate there first
		if (pathname !== '/') {
			// Navigate to home page with the section hash
			router.push(`/#${sectionId}`);
			return;
		}
		
		// If we're already on the home page, scroll directly
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			});
		}
	};

	const AuthButtons = () => {
		if (isLoading) {
			return (
				<div className="flex items-center space-x-4">
					<div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
					<div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
				</div>
			);
		}

		if (isAuthenticated) {
			return (
				<div className="flex items-center space-x-4">
					<Link href="/account/settings">
						<Button variant="outline" size="sm" className="flex items-center space-x-2">
							<User className="h-4 w-4" />
							<span className="hidden sm:inline">My Account</span>
						</Button>
					</Link>
				</div>
			);
		}

		return (
			<div className="flex items-center space-x-4">
				<Link href="/auth/login">
					<Button variant="outline" size="sm">
						Log in
					</Button>
				</Link>
				<Link href="/auth/signup">
					<Button size="sm">
						Get Started
					</Button>
				</Link>
			</div>
		);
	};

	const MobileAuthButtons = () => {
		if (isLoading) {
			return (
				<div className="flex flex-col space-y-3 pt-4">
					<div className="h-9 bg-gray-200 rounded animate-pulse"></div>
					<div className="h-9 bg-gray-200 rounded animate-pulse"></div>
				</div>
			);
		}

		if (isAuthenticated) {
			return (
				<div className="flex flex-col space-y-3 pt-4">
					<Link href="/account/settings" onClick={() => setIsMobileMenuOpen(false)}>
						<Button variant="outline" className="w-full justify-start">
							<User className="h-4 w-4 mr-2" />
							My Account
						</Button>
					</Link>
					<Button 
						variant="outline" 
						className="w-full justify-start text-destructive hover:text-destructive"
						onClick={() => {
							handleSignOut();
							setIsMobileMenuOpen(false);
						}}
					>
						<LogOut className="h-4 w-4 mr-2" />
						Sign Out
					</Button>
				</div>
			);
		}

		return (
			<div className="flex flex-col space-y-3 pt-4">
				<Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
					<Button variant="outline" className="w-full">
						Log in
					</Button>
				</Link>
				<Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
					<Button className="w-full">
						Get Started
					</Button>
				</Link>
			</div>
		);
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
						<button
							onClick={() => scrollToSection('features')}
							className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
						>
							Features
						</button>
						<button
							onClick={() => scrollToSection('how-it-works')}
							className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
						>
							How It Works
						</button>
						<button
							onClick={() => scrollToSection('testimonials')}
							className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
						>
							Testimonials
						</button>
						<button
							onClick={() => scrollToSection('pricing')}
							className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
						>
							Pricing
						</button>
						<button
							onClick={() => scrollToSection('faq')}
							className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
						>
							FAQ
						</button>
					</nav>

					{/* Desktop Auth Buttons */}
					<div className="hidden md:flex">
						<AuthButtons />
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
							<button
								onClick={() => scrollToSection('features')}
								className="text-base font-medium text-gray-700 transition-colors hover:text-primary-600 text-left"
							>
								Features
							</button>
							<button
								onClick={() => scrollToSection('how-it-works')}
								className="text-base font-medium text-gray-700 transition-colors hover:text-primary-600 text-left"
							>
								How It Works
							</button>
							<button
								onClick={() => scrollToSection('testimonials')}
								className="text-base font-medium text-gray-700 transition-colors hover:text-primary-600 text-left"
							>
								Testimonials
							</button>
							<button
								onClick={() => scrollToSection('pricing')}
								className="text-base font-medium text-gray-700 transition-colors hover:text-primary-600 text-left"
							>
								Pricing
							</button>
							<button
								onClick={() => scrollToSection('faq')}
								className="text-base font-medium text-gray-700 transition-colors hover:text-primary-600 text-left"
							>
								FAQ
							</button>
							
							{/* Mobile Auth Buttons */}
							<MobileAuthButtons />
						</nav>
					</div>
				)}
			</div>
		</header>
	);
};

export default Header;