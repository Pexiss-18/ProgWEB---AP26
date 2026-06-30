"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Scissors, LogOut, Menu, X } from "lucide-react";
import { removeToken } from "@/lib/auth";
import PlanetIcon from "@/components/login/PlanetIcon";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/servicos", label: "Serviços", icon: Scissors },
];

export default function Sidebar({ email }: { email?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    removeToken();
    router.push("/login");
  }

  const content = (
    <>
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div style={{ filter: "drop-shadow(0 0 6px rgba(201,168,76,0.3))" }}>
          <PlanetIcon className="w-12 h-12" />
        </div>
        <p className="mt-3 text-[11px] tracking-[0.3em] uppercase text-ag-gold">
          Marlon
        </p>
        <div className="mt-2 w-10 h-px bg-ag-gold opacity-40" aria-hidden="true" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] tracking-wide transition-all border-l-[3px] ${
                active
                  ? "bg-ag-crimson/20 text-ag-beige border-ag-crimson"
                  : "text-ag-sepia border-transparent hover:text-ag-beige hover:bg-white/5"
              }`}
            >
              <Icon
                size={18}
                className={active ? "text-ag-gold" : "text-ag-sepia group-hover:text-ag-gold"}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* WhatsApp */}
      <a
        href="https://wa.me/5511999999999"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 justify-center rounded-lg py-2.5 text-[13px] font-medium transition-colors"
        style={{
          background: "rgba(37,211,102,0.1)",
          border: "1px solid rgba(37,211,102,0.3)",
          color: "#25d166",
        }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
          <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-1.866-.832-3.085-1.483-4.298-3.37-.328-.518.328-.481.94-1.604.103-.197.052-.367-.05-.518-.099-.15-.673-1.62-.92-2.213-.247-.594-.5-.51-.673-.51-.176 0-.349 0-.498.005-.15.005-.4.05-.598.27-.247.272-.93.91-.93 2.226 0 1.31.853 2.582 1.018 2.768.166.187 1.946 2.967 4.713 4.041 2.766 1.07 2.766.713 3.66.633.892-.08 2.012-.838 2.262-1.65.247-.81.247-1.501.176-1.65-.073-.144-.273-.227-.5-.347z" />
          <path d="M12.04 1.92C6.476 1.92 1.95 6.444 1.95 11.99c0 1.97.553 3.875 1.6 5.527L2 21.06l3.61-.946a10.06 10.06 0 0 0 6.43 2.327c5.563 0 10.09-4.523 10.09-10.07 0-2.691-1.05-5.225-2.953-7.128a10.027 10.027 0 0 0-7.137-2.92zm0 18.34a8.19 8.19 0 0 1-4.18-1.143l-.299-.178-3.116.817.834-3.041-.196-.314a8.227 8.227 0 0 1-1.262-4.41c0-4.54 3.7-8.236 8.241-8.236 2.202 0 4.27.86 5.83 2.418a8.183 8.183 0 0 1 2.413 5.823c0 4.541-3.7 8.264-8.265 8.264z" />
        </svg>
        Fale no WhatsApp
      </a>

      {/* Footer */}
      <div className="border-t border-ag-panel mt-6 pt-4">
        {email && (
          <p className="text-xs text-ag-sepia mb-3 truncate">{email}</p>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-[13px] text-ag-sepia hover:text-red-400 hover:bg-white/5 transition-all"
        >
          <LogOut size={18} />
          Sair
        </button>
        <p className="text-[9px] text-ag-sepia opacity-40 mt-3 text-center">v1.0.0</p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-ag-dark border-b border-ag-border">
        <PlanetIcon className="w-8 h-8" />
        <button
          aria-label="Abrir menu"
          onClick={() => setMobileOpen(true)}
          className="text-ag-sepia hover:text-ag-gold transition-colors"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="flex flex-col w-[260px] h-full bg-ag-dark border-r border-ag-border px-6 py-8 shadow-[inset_-12px_0_24px_-12px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Fechar menu"
              onClick={() => setMobileOpen(false)}
              className="self-end text-ag-sepia hover:text-ag-gold transition-colors mb-2"
            >
              <X size={20} />
            </button>
            {content}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] min-h-screen bg-ag-dark border-r border-ag-border px-6 py-8 shrink-0 shadow-[inset_-12px_0_24px_-12px_rgba(0,0,0,0.6)]">
        {content}
      </aside>
    </>
  );
}
