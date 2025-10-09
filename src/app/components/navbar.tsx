"use client";
import React, { useEffect, useRef, useState } from "react";
import Logo from "../../assets/logo.png";
import Image from "next/image";
import Link from "next/link";
import Hero from "../../assets/hero.jpg";

const navItems = [
	{ label: "Gallery", href: "/#gallery" },
	{ label: "Facilities", href: "/#facilities" },
	{ label: "Availability", href: "/#availability" },
	{ label: "Testimonials", href: "/#testimonials" },
];

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("");
    const [atTop, setAtTop] = useState(true);
    const linksContainerRef = useRef<HTMLDivElement | null>(null);
    const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
    const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({ left: 0, width: 0, opacity: 0 });

    const getSectionId = (href: string) => href.replace("/#", "").replace("#", "");

    useEffect(() => {
        const sectionIds = navItems.map((n) => getSectionId(n.href));
        const elements = sectionIds
            .map((id) => (typeof document !== "undefined" ? document.getElementById(id) : null))
            .filter(Boolean) as Element[];

        if (elements.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (visible && visible.target && (visible.target as HTMLElement).id) {
                    setActiveSection((visible.target as HTMLElement).id);
                }
            },
            { rootMargin: "0px 0px -60% 0px", threshold: [0.25, 0.5, 0.75, 1] }
        );

        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const onScroll = () => setAtTop(window.scrollY < 24);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const moveIndicatorTo = (id?: string) => {
        if (!id) return;
        const container = linksContainerRef.current;
        const target = id && linkRefs.current[id];
        if (!container || !target) return;
        const cRect = container.getBoundingClientRect();
        const tRect = target.getBoundingClientRect();
        const left = tRect.left - cRect.left;
        setIndicatorStyle({ left, width: tRect.width, opacity: 1 });
    };

    useEffect(() => {
        if (activeSection) moveIndicatorTo(activeSection);
    }, [activeSection]);

    useEffect(() => {
        const onResize = () => moveIndicatorTo(activeSection);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [activeSection]);


        return (
                <header className="fixed top-0 left-0 w-full z-50 flex flex-col items-center bg-transparent">
                <nav
                    id="main-navbar"
                    className={`nav-appear ${atTop ? "nav-light bg-transparent" : "nav-dark bg-white shadow-md border-b border-stone-200"} transition-colors duration-300 flex justify-between items-center w-full px-4 sm:px-6 py-3 relative`}
                >
									{/* Logo or Title */}
													<Link href="/#hero" aria-label="Go to Hero section">
														<Image src={Logo} alt="Public Hall Logo" width={50} height={50} className="cursor-pointer" />
													</Link>

					{/* Desktop Nav */}
                    <div ref={linksContainerRef} className="navbar-desktop relative hidden sm:flex gap-6 sm:gap-8 items-center" onMouseLeave={() => moveIndicatorTo(activeSection)}>
                                    {navItems.map((item) => {
                                        const id = getSectionId(item.href);
                                        const isActive = activeSection === id;
                                        return (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                ref={(el) => { linkRefs.current[id] = el; }}
                                                onMouseEnter={() => moveIndicatorTo(id)}
                                                className={`nav-link text-base font-medium ${isActive ? "active" : ""}`}
                                            >
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                    <span
                                        aria-hidden
                                        className="absolute -bottom-1 h-[2px] bg-[#e63946] rounded-full transition-all duration-300"
                                        style={{ left: `${indicatorStyle.left}px`, width: `${indicatorStyle.width}px`, opacity: indicatorStyle.opacity }}
                                    />
					</div>
                    <Link
                        href="/#contact"
                        className="navbar-desktop hidden sm:block bg-[#e63946] text-white font-semibold text-base px-6 py-2 rounded-[2.5rem] sm:rounded-[3rem] cursor-pointer shadow hover:bg-[#d62839] transition border-none"
                    >
                        Contact us
                    </Link>

					{/* Hamburger for mobile */}
                    <button
                        className="navbar-mobile hamburger flex sm:hidden flex-col justify-center items-center cursor-pointer w-10 h-10 p-0 bg-transparent border-none"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Open menu"
                        aria-expanded={menuOpen}
                    >
                        <span className={`bar ${menuOpen ? "bar-top-open" : ""}`}></span>
                        <span className={`bar ${menuOpen ? "bar-middle-open" : ""}`}></span>
                        <span className={`bar ${menuOpen ? "bar-bottom-open" : ""}`}></span>
                    </button>
				</nav>

					{/* Side Menu for Mobile */}
					{menuOpen && (
                    <div className="fixed top-0 right-0 w-[85vw] max-w-[260px] h-screen bg-white text-[#181411] shadow-lg z-[999] flex flex-col p-4 gap-4 animate-slideIn">
							<button
                                className="self-end bg-transparent border-none text-3xl cursor-pointer mb-4"
								onClick={() => setMenuOpen(false)}
								aria-label="Close menu"
							>
								&times;
							</button>
                                        {navItems.map((item) => {
                                            const id = getSectionId(item.href);
                                            const isActive = activeSection === id;
                                            return (
                                                <Link
                                                    key={item.label}
                                                    href={item.href}
                                                    className={`border-none text-lg font-medium px-4 py-3 rounded-xl cursor-pointer text-left transition ${isActive ? "text-[#e63946]" : ""}`}
                                                    onClick={() => setMenuOpen(false)}
                                                >
                                                    {item.label}
                                                </Link>
                                            );
                                        })}
                                        <Link
                                            href="/#contact"
                                            onClick={() => setMenuOpen(false)}
                                            className="bg-[#e63946] text-white font-semibold text-lg px-6 py-3 rounded-full cursor-pointer shadow hover:bg-[#d62839] transition border-none text-center"
                                        >
                                            Contact us
                                        </Link>
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
                        .nav-link {
                            position: relative;
                            padding: 0.5rem 0.75rem;
                            border-radius: 0.75rem;
                            transition: color .2s ease, background-color .2s ease;
                        }
                        .nav-dark .nav-link { color: #181411; }
                        .nav-light .nav-link { color: #ffffff; }
                        .nav-link:hover { background: transparent; }
                        .nav-appear { animation: navDropIn .4s ease-out both; }
                        @keyframes navDropIn { from { transform: translateY(-12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

                        /* Hamburger animation */
                        .hamburger .bar { width: 1.75rem; height: 0.125rem; border-radius: 9999px; margin: 0.1875rem 0; transition: transform .2s ease, opacity .2s ease, background-color .2s ease; }
                        .nav-dark .hamburger .bar { background: #181411; }
                        .nav-light .hamburger .bar { background: #ffffff; }
                        .hamburger .bar-top-open { transform: translateY(0.3125rem) rotate(45deg); }
                        .hamburger .bar-middle-open { opacity: 0; }
                        .hamburger .bar-bottom-open { transform: translateY(-0.3125rem) rotate(-45deg); }
						@keyframes slideIn {
							from { right: -320px; opacity: 0; }
							to { right: 0; opacity: 1; }
						}
					`}</style>
		</header>
	);
};

export default Navbar;
