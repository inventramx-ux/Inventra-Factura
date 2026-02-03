import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="border-t border-white/10 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Image
                            src="/inventralogo.png"
                            alt=""
                            width={120}
                            height={28}
                            className="h-6 w-auto mb-4"
                        />
                        <p className="text-gray-500 text-sm max-w-sm">
                            AI-powered product research that helps you discover trending inventory before the competition.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white text-sm font-medium mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/#features" className="text-gray-500 text-sm hover:text-white transition-colors">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="/#pricing" className="text-gray-500 text-sm hover:text-white transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-gray-500 text-sm hover:text-white transition-colors">
                                    Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white text-sm font-medium mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="#" className="text-gray-500 text-sm hover:text-white transition-colors">
                                    Documentation
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-500 text-sm hover:text-white transition-colors">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-500 text-sm hover:text-white transition-colors">
                                    Privacy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 text-gray-600 text-sm">
                    <p>&copy; {new Date().getFullYear()} InventrAI. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}