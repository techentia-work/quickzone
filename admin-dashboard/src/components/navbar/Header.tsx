"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClientUtils } from "@/lib/utils/index";
import { ROUTES } from "@/lib/consts";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Home", path: ROUTES.ROOT },
  ];

  const isActive = (path: string) => pathname === path;

  const handleAuthClick = () => {
    if (authClientUtils.isAuthenticated()) {
      router.push(ROUTES.ADMIN.ROOT);
    } else {
      router.push(ROUTES.AUTH.LOGIN);
    }
  };

  const handleLogout = () => {
    authClientUtils.logout();
    setIsAuthenticated(false); // reflect immediately
    router.push(ROUTES.ROOT);
  };

  // Check auth state on mount + storage changes
  useEffect(() => {
    setIsAuthenticated(authClientUtils.isAuthenticated());

    const handleStorageChange = () => {
      setIsAuthenticated(authClientUtils.isAuthenticated());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      
      </div>
    </header>
  );
};

export default Header;
