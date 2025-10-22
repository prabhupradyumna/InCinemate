import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: 'Overview', href: '/superadmin/overview' },
  { name: 'Users', href: '/superadmin/users' },
  { name: 'Venues', href: '/superadmin/venues' },
  { name: 'Movies', href: '/superadmin/movies' }, // <-- New Movies tab
  { name: 'Requests', href: '/superadmin/requests' },
  { name: 'Builder', href: '/superadmin/builder' },
  { name: 'Analytics', href: '/superadmin/analytics' },
  { name: 'Settings', href: '/superadmin/settings' },
];

export function PlatformOverviewNavigation() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-2 border-b mb-6">
      {tabs.map(tab => (
        <Link key={tab.name} href={tab.href}>
          <span
            className={`px-4 py-2 cursor-pointer rounded-t font-medium ${
              pathname === tab.href ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.name}
          </span>
        </Link>
      ))}
    </nav>
  );
}
