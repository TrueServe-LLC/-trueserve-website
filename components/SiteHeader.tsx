"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/drive", label: "Drive" },
  { href: "/merchant", label: "For Merchants" },
  { href: "/rewards", label: "Rewards" },
  { href: "/contact", label: "Help" },
];

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accountHref, setAccountHref] = useState("/user/settings");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const refreshHeaderSession = async () => {
      try {
        const response = await fetch("/api/auth/header-session", {
          cache: "no-store",
          credentials: "include",
        });
        if (!response.ok) return;
        const session = await response.json();
        if (!mounted) return;
        setIsAuthenticated(Boolean(session.authenticated));
        setAccountHref(session.accountHref || "/user/settings");
      } catch (error) {
        console.error("Unable to refresh header session:", error);
      }
    };

    void refreshHeaderSession();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      void refreshHeaderSession();
    });

    const handleFocus = () => void refreshHeaderSession();
    window.addEventListener("focus", handleFocus);

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="ts-fig-header">
      <div className="ts-fig-container ts-fig-header-inner">
        <Logo size="sm" />
        <div className="ts-fig-nav" role="navigation" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={isActive(link.href) ? "active" : undefined}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="ts-fig-header-actions">
          <Link href={isAuthenticated ? accountHref : "/login"} className="ts-fig-link">
            {isAuthenticated ? "Account" : "Sign In"}
          </Link>
          <Link href={isAuthenticated ? "/restaurants" : "/signup"} className="ts-fig-btn">
            {isAuthenticated ? "Order now" : "Sign Up"}
          </Link>
          <button
            type="button"
            className="ts-fig-mobile-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-controls="site-mobile-menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <div id="site-mobile-menu" className={`ts-fig-mobile-menu${menuOpen ? " is-open" : ""}`}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={isActive(link.href) ? "active" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link className="ts-fig-mobile-menu-secondary" href={isAuthenticated ? accountHref : "/login"} onClick={() => setMenuOpen(false)}>
          {isAuthenticated ? "Account" : "Sign In"}
        </Link>
        <Link className="ts-fig-mobile-menu-primary" href={isAuthenticated ? "/restaurants" : "/signup"} onClick={() => setMenuOpen(false)}>
          {isAuthenticated ? "Order now" : "Sign Up"}
        </Link>
      </div>
    </header>
  );
}
