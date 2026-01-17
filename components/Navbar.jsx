'use client';
// Navbar Component

import { useAuth } from '@/components/AuthProvider';
import { Search, LogOut, ChevronDown, Menu, CheckSquare, Users, Shield } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import MobileSidebar from '@/components/MobileSidebar';

export default function Navbar({ role }) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    // Manual Search Logic
    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (searchTerm) {
            params.set('search', searchTerm);
        } else {
            params.delete('search');
        }
        router.replace(`?${params.toString()}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Navigation Links Config
    const links = [
        { href: '/user/dashboard', label: 'My Tasks', icon: CheckSquare, roles: ['user', 'admin', 'superadmin'] },
        { href: '/admin/dashboard', label: 'Admin', icon: Users, roles: ['admin'] },
        { href: '/superadmin/dashboard', label: 'System', icon: Shield, roles: ['superadmin'] },
    ];
    const filteredLinks = links.filter(link => {
        // Use authenticated user role first, fallback to prop role (e.g. while loading or guest)
        const currentRole = user?.role || role;
        return link.roles.includes(currentRole);
    });

    // Role-specific config
    const config = {
        user: {
            title: "TaskForce",
            gradient: "from-green-400 to-teal-500",
            iconBg: "from-green-500 to-teal-600",
            placeholder: "Search my tasks..."
        },
        admin: {
            title: "TaskForce Admin",
            gradient: "from-blue-400 to-purple-500",
            iconBg: "from-blue-500 to-purple-600",
            placeholder: "Search users or tasks..."
        },
        superadmin: {
            title: "TaskForce Super",
            gradient: "from-pink-400 to-rose-500",
            iconBg: "from-pink-500 to-rose-600",
            placeholder: "Search users or tasks..."
        }
    };

    const roleConfig = config[role] || config.user;
    const userName = user?.name || role?.charAt(0).toUpperCase() + role?.slice(1) || 'User';
    const userEmail = user?.email || `${role}@example.com`;

    return (
        <>
            <nav className="flex items-center justify-between p-4 mb-8 glass-dark rounded-xl border border-gray-800 relative z-30">
                {/* Left Section: Logo & Desktop Nav */}
                <div className="flex items-center gap-8">
                    <h2 className={`text-xl font-bold bg-gradient-to-r ${roleConfig.gradient} bg-clip-text text-transparent`}>
                        {roleConfig.title}
                    </h2>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center gap-1">
                        {filteredLinks.map(link => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                        ${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}
                                    `}
                                >
                                    <Icon size={16} />
                                    {link.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* Right Section: Search & Profile & Mobile Toggle */}
                <div className="flex items-center gap-3 lg:gap-4">

                    {/* Search - Hidden on very small screens if needed, or adaptable */}
                    <div className="hidden md:flex items-center bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-800 w-48 lg:w-64 hover:border-gray-700 transition-colors">
                        <button onClick={handleSearch} className="text-gray-500 mr-2 hover:text-white transition-colors">
                            <Search size={16} />
                        </button>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchTerm(val);
                                if (val === '') {
                                    const params = new URLSearchParams(searchParams.toString());
                                    params.delete('search');
                                    router.replace(`?${params.toString()}`);
                                }
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={roleConfig.placeholder}
                            className="bg-transparent text-sm text-gray-300 focus:outline-none w-full placeholder-gray-600"
                        />
                    </div>

                    {/* Mobile Search Icon (optional, if desktop search hidden) */}
                    <button className="md:hidden p-2 text-gray-400 hover:text-white bg-gray-900/50 rounded-lg border border-gray-800" onClick={() => {/* Toggle search modal? */ }}>
                        <Search size={20} />
                    </button>

                    {/* Profile Dropdown - Desktop Only for full details, Icon for all */}
                    <div className="hidden lg:flex items-center gap-4 relative" ref={dropdownRef}>
                        <div
                            className="flex items-center gap-3 pl-4 border-l border-gray-800 cursor-pointer group"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{userName}</p>
                                <p className="text-xs text-gray-500">{userEmail}</p>
                            </div>
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${roleConfig.iconBg} flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-transparent group-hover:ring-gray-700 transition-all`}>
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <ChevronDown size={14} className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50">
                                <div className="p-2">
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden p-2 text-gray-400 hover:text-white bg-gray-900/50 rounded-lg border border-gray-800"
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </nav>

            <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        </>
    );
}
