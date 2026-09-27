"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Home, Compass, User, MessageCircle, PlusSquare } from "lucide-react";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/auth");

  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [isMerchant, setIsMerchant] = useState(false);

  useEffect(() => {
    if (isAuthPage) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        try { sessionStorage.setItem("after_login", pathname); } catch {}
        router.replace("/onboarding");
      } else setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace("/onboarding");
    });
    return () => sub.subscription.unsubscribe();
  }, [pathname, isAuthPage, router]);

  useEffect(() => {
    if (isAuthPage) return;
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user.id;
      if (!uid) return;
      const { data: p } = await supabase.from("profiles").select("role").eq("id", uid).maybeSingle();
      if (alive) setIsMerchant(p?.role === "merchant");
    });
    return () => {
      alive = false;
    };
  }, [isAuthPage]);

  if (isAuthPage) {
    return <main className="min-h-screen w-full bg-[#ECE9E2]">{children}</main>;
  }

  if (!ready) return null;

  const navItems = isMerchant
    ? [
        { label: "الرئيسية", href: "/home", icon: Home },
        { label: "استكشف", href: "/category", icon: Compass },
        { label: "نشر", href: "/profile/studio", icon: PlusSquare },
        { label: "الدردشة", href: "/chat", icon: MessageCircle },
        { label: "حسابي", href: "/profile", icon: User },
      ]
    : [
        { label: "الرئيسية", href: "/home", icon: Home },
        { label: "استكشف", href: "/category", icon: Compass },
        { label: "الدردشة", href: "/chat", icon: MessageCircle },
        { label: "حسابي", href: "/profile", icon: User },
      ];

  return (
    <div className="flex flex-col min-h-screen bg-paper text-[#1e3a5f] dir-rtl">
      {/* 1. الهيدر العلوي (Header) */}
      <header className="sticky top-0 z-40 w-full bg-paper border-b-2 border-[#1e3a5f]/15 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2">
            <Logo className="h-7 w-auto text-[#1e3a5f]" />
          </Link>

          {/* روابط التنقل تظهر بالهيدر على الشاشات الكبيرة فقط */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive ? "text-[#1e3a5f] font-bold" : "text-[#1e3a5f]/60 hover:text-[#1e3a5f]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 2. المحتوى الرئيسي للموقع (Main Content) */}
      <main className="flex-1 max-w-7xl w-full mx-auto pb-20 md:pb-6 px-4 py-4">
        {children}
      </main>

      {/* 3. شريط التنقل السفلي للأجهزة المحمولة (Mobile Bottom Navigation) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-paper border-t-2 border-[#1e3a5f]/15 px-4 py-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-medium transition-colors ${
                  isActive ? "text-[#1e3a5f] font-bold" : "text-[#1e3a5f]/50 hover:text-[#1e3a5f]"
                }`}
              >
                <Icon size={20} className={isActive ? "stroke-[2.5px]" : "stroke-[1.75px]"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
