"use client";

import { cn } from "@/utils";
import { Inbox, Menu, X, User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTrigger,
} from "@/components/ui/dialog";

const Header = () => {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const { isAuthenticated, authUser, signOut, isLoading } = useAuth();

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
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline" size="sm" className="flex items-center space-x-2">
								<User className="h-4 w-4" />
								<span className="hidden sm:inline">My Account</span>
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-md">
							<div className="flex flex-col space-y-4 p-4">
								<div className="text-center">
									<h3 className="text-lg font-semibold">Account Menu</h3>
									{authUser?.email && (
										<p className="text-sm text-muted-foreground">{authUser.email}</p>
									)}
								</div>
								<div className="flex flex-col space-y-2">
									<Link href="/account/settings">
										<Button variant="outline" className="w-full justify-start">
											<User className="h-4 w-4 mr-2" />
											Account Settings
										</Button>
									</Link>
									<Link href="/account/connected-accounts">
										<Button variant="outline" className="w-full justify-start">
											<Inbox className="h-4 w-4 mr-2" />
											Connected Accounts
										</Button>
									</Link>
									<Button 
										variant="outline" 
										className="w-full justify-start text-destructive hover:text-destructive"
										onClick={handleSignOut}
									>
										<LogOut className="h-4 w-4 mr-2" />
										Sign Out
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
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
							Account Settings
						</Button>
					</Link>
					<Link href="/account/connected-accounts" onClick={() => setIsMobileMenuOpen(false)}>
						<Button variant="outline" className="w-full justify-start">
							<Inbox className="h-4 w-4 mr-2" />
							Connected Accounts
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