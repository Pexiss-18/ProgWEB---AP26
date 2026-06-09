"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Scissors, LogOut } from "lucide-react";
import { removeToken } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/servicos", label: "Serviços", icon: Scissors },
];

export default function Sidebar({ email }: { email?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    removeToken();
    router.push("/login");
  }

  return (
    <aside className="flex flex-col w-[260px] min-h-screen bg-[#0d0700] border-r border-[#2a1a0e] px-6 py-8 shrink-0">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <Image
          src="/logo.png"
          alt="Marlon Barber Shop"
          width={120}
          height={120}
          className="object-contain"
          style={{ filter: "invert(1) sepia(0.2) brightness(0.9)" }}
        />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm tracking-wide transition-all ${
                active
                  ? "bg-[#8b1a1a]/20 text-[#e8dcc8] border-l-2 border-[#8b1a1a]"
                  : "text-[#7a6a58] hover:text-[#e8dcc8] hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#2a1a0e] pt-4">
        {email && (
          <p className="text-xs text-[#5a4a38] mb-3 truncate">{email}</p>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm text-[#7a6a58] hover:text-[#e8dcc8] hover:bg-white/5 transition-all"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}
