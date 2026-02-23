import { NavLink } from 'react-router-dom';
import { Home, Package, MessageCircle, Image, User } from 'lucide-react';

export default function BottomNav() {
    const navItems = [
        { to: '/home', icon: Home, label: 'Home' },
        { to: '/borrower', icon: Package, label: 'Borrower' },
        { to: '/lender', icon: MessageCircle, label: 'Lender' },
        { to: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-[72px] bg-white border-t border-gray-200 flex justify-around items-center px-2 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
            {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <div className="relative">
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'fill-primary' : ''} />
                                {isActive && (
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                                )}
                            </div>
                            <span className="text-[10px] font-medium">{label}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
}
