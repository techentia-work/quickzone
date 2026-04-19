"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, ShoppingCart, User } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  activeMatch?: RegExp;
};

const items: NavItem[] = [
  { href: "/", label: "Home", icon: Home, activeMatch: /^\/$/ },
  {
    href: "/categories",
    label: "Categories",
    icon: Layers,
    activeMatch: /^\/categories/,
  },
  { href: "/cart", label: "Cart", icon: ShoppingCart, activeMatch: /^\/cart/ },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    activeMatch: /^\/(profile|auth)/,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[95] block sm:hidden bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-t border-gray-200 safe-bottom">
      <ul className="grid grid-cols-4">
        {items.map(({ href, label, icon: Icon, activeMatch }) => {
          const active = activeMatch?.test(pathname) ?? false;
          return (
            <li key={label}>
              <Link
                href={href}
                className="flex flex-col items-center justify-center py-2.5 text-[11px]"
              >
                <Icon
                  className={`${
                    active ? "text-green-600" : "text-gray-500"
                  } h-5 w-5`}
                />
                <span
                  className={`${
                    active ? "text-green-700" : "text-gray-600"
                  } mt-1`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default MobileBottomNav;
