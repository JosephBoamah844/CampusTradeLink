import { useRouter } from 'next/router';
import Link from 'next/link';
import { clsx } from 'clsx';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  UserIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  UserIcon as UserIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
} from '@heroicons/react/24/solid';

const navigation = [
  {
    name: 'Your Campus',
    href: '/',
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
  },
  {
    name: 'Explore',
    href: '/explore',
    icon: MagnifyingGlassIcon,
    activeIcon: MagnifyingGlassIconSolid,
  },
  {
    name: 'Messages',
    href: '/messages',
    icon: ChatBubbleLeftRightIcon,
    activeIcon: ChatBubbleLeftRightIconSolid,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: UserIcon,
    activeIcon: UserIconSolid,
  },
];

export default function BottomNavigation() {
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <nav className="flex">
        {navigation.map((item) => {
          const isActive = router.pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors',
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}