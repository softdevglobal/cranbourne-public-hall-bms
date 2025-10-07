"use client";
import React, { useState } from "react";
import Logo from "../../assets/logo.png";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import LoginModal from "../../components/LoginModal";

const navItems = [
	{ label: "Gallery", href: "/#gallery" },
	{ label: "Facilities", href: "/#facilities" },
	{ label: "Availability", href: "/#availability" },
	{ label: "Testimonials", href: "/#testimonials" },
	{ label: "Contact", href: "/#contact" },
];

const Navbar = () => {
	const [menuOpen, setMenuOpen] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const { isAuthenticated } = useAuth();

	const handleBookNowClick = () => {
		if (!isAuthenticated) {
			setShowLoginModal(true);
		} else {
			window.location.href = '/booknow';
		}
	};


		return (
				<header className="fixed top-0 left-0 w-full z-50 flex flex-col items-center bg-transparent">
				<nav id="main-navbar" className="flex justify-between items-center bg-white rounded-[2.5rem] sm:rounded-[3rem] shadow-lg px-5 sm:px-5 py-2 mt-1 sm:mt-4 mx-auto max-w-[900px] w-[90%]">
									{/* Logo or Title */}
													<Link href="/#hero" aria-label="Go to Hero section">
														<Image src={Logo} alt="Public Hall Logo" width={50} height={50} className="cursor-pointer" />
													</Link>

					{/* Desktop Nav */}
					<div className="navbar-desktop hidden sm:flex gap-10">
									{navItems.map((item) => (
										<Link
											key={item.label}
											href={item.href}
											className="bg-transparent border-none text-base font-medium text-[#222] px-4 py-2 rounded-xl cursor-pointer hover:bg-[#f3f3f3] transition"
										>
											{item.label}
										</Link>
									))}
					</div>
					<button
						onClick={handleBookNowClick}
						className="navbar-desktop hidden sm:block bg-[#e63946] text-white font-semibold text-base px-6 py-2 rounded-[2.5rem] sm:rounded-[3rem] cursor-pointer shadow hover:bg-[#d62839] transition border-none"
					>
						Book Now
					</button>

					{/* Hamburger for mobile */}
					<button
						className="navbar-mobile flex sm:hidden flex-col justify-center items-center cursor-pointer w-10 h-10 p-0 bg-transparent border-none"
						onClick={() => setMenuOpen(!menuOpen)}
					>
						<span className="w-7 h-1 bg-[#222] rounded m-1"></span>
						<span className="w-7 h-1 bg-[#222] rounded m-1"></span>
						<span className="w-7 h-1 bg-[#222] rounded m-1"></span>
					</button>
				</nav>

					{/* Side Menu for Mobile */}
					{menuOpen && (
					<div className="fixed top-0 right-0 w-[85vw] max-w-[260px] h-screen bg-white shadow-lg z-[999] flex flex-col p-4 gap-4 animate-slideIn">
							<button
								className="self-end bg-transparent border-none text-3xl cursor-pointer mb-4"
								onClick={() => setMenuOpen(false)}
								aria-label="Close menu"
							>
								&times;
							</button>
										{navItems.map((item) => (
											<Link
												key={item.label}
												href={item.href}
												className="bg-transparent border-none text-lg font-medium text-[#222] px-4 py-3 rounded-xl cursor-pointer text-left hover:bg-[#f3f3f3] transition"
												onClick={() => setMenuOpen(false)}
											>
												{item.label}
											</Link>
										))}
										<button
											onClick={() => {
												setMenuOpen(false);
												handleBookNowClick();
											}}
											className="bg-[#e63946] text-white font-semibold text-lg px-6 py-3 rounded-full cursor-pointer shadow hover:bg-[#d62839] transition border-none"
										>
											Book Now
										</button>
						</div>
					)}

					<style>{`
						@media (max-width: 700px) {
							.navbar-desktop {
								display: none !important;
							}
							.navbar-mobile {
								display: flex !important;
							}
						}
						@keyframes slideIn {
							from { right: -320px; opacity: 0; }
							to { right: 0; opacity: 1; }
						}
					`}</style>

					{/* Login Modal */}
					{showLoginModal && (
						<LoginModal
							onClose={() => setShowLoginModal(false)}
							onSuccess={() => {
								setShowLoginModal(false);
								window.location.href = '/booknow';
							}}
						/>
					)}
		</header>
	);
};

export default Navbar;
