// frontend/src/components/ui/DropdownItem.tsx
import { Menu } from '@headlessui/react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  as?: 'button' | 'link';
  to?: string;
}

export function DropdownItem({
  children,
  onClick,
  className = "",
  as = 'button',
  to,
}: DropdownItemProps) {
  const baseClasses = 'block w-full text-left px-4 py-2 text-sm';

  return (
    <Menu.Item>
      {({ active }) => (
        as === 'link' && to ? (
          <Link
            to={to}
            className={`${baseClasses} ${active ? 'bg-gray-100' : ''} ${className}`}
          >
            {children}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onClick}
            className={`${baseClasses} ${active ? 'bg-gray-100' : ''} ${className}`}
          >
            {children}
          </button>
        )
      )}
    </Menu.Item>
  );
}