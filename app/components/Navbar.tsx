'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black backdrop-blur-lg border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/inventralogo.png"
                            alt="Inventra Factura"
                            width={32}
                            height={32}
                            className="h-8 w-auto"
                            priority
                        />
                        <span className="text-white font-semibold hidden sm:inline">Inventra Factura</span>
                    </Link>

                    {/* Center Navigation - Características & Planes */}
                    <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                        <Link href="/#features" className="text-slate-300 hover:text-white transition-colors">
                            Características
                        </Link>
                        <Link href="/#pricing" className="text-slate-300 hover:text-white transition-colors">
                            Planes
                        </Link>
                    </div>

                    {/* Right side - Auth buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <SignedOut>
                            <Link href="/sign-in" className="text-slate-300 hover:text-white transition-colors">
                                Iniciar Sesión
                            </Link>
                            <Link href="/sign-up" className="bg-white text-black font-medium py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                                Registrarse
                            </Link>
                        </SignedOut>
                        <SignedIn>
                            <Link href="/dashboard" className="bg-white text-black font-medium py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                                Dashboard
                            </Link>
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: 'w-9 h-9'
                                    }
                                }}
                            />
                        </SignedIn>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-slate-800">
                        <div className="flex flex-col gap-4">
                            <Link href="/#features" className="text-slate-300 hover:text-white transition-colors">
                                Características
                            </Link>
                            <Link href="/#pricing" className="text-slate-300 hover:text-white transition-colors">
                                Planes
                            </Link>
                            <SignedOut>
                                <Link href="/sign-in" className="text-slate-300 hover:text-white transition-colors">
                                    Iniciar Sesión
                                </Link>
                                <Link href="/sign-up" className="bg-white text-black font-medium py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors text-sm text-center">
                                    Registrarse
                                </Link>
                            </SignedOut>
                            <SignedIn>
                                <Link href="/dashboard" className="bg-white text-black font-medium py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors text-sm text-center">
                                    Dashboard
                                </Link>
                                <div className="flex items-center gap-2">
                                    <UserButton afterSignOutUrl="/" />
                                    <span className="text-slate-400 text-sm">Cuenta</span>
                                </div>
                            </SignedIn>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}