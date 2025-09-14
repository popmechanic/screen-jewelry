'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import db from '@/lib/db';
import { Home, Edit, LayoutDashboard } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const user = db.useUser();

  if (!user) return null;

  const navItems = [
    { href: '/', label: 'Gallery', icon: Home },
    { href: '/editor', label: 'Editor', icon: Edit },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <nav className="flex items-center space-x-4">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
              isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </Link>
        );
      })}
      <button
        onClick={() => db.auth.signOut()}
        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
      >
        Sign Out
      </button>
    </nav>
  );
}