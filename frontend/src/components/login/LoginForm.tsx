"use client";

import { HttpClient } from "@/infrastructure/http/HttpClient";
import { HttpAdminRepository } from "@/infrastructure/repositories/HttpAdminRepository";
import { LocalStorageTokenStorage } from "@/infrastructure/storage/LocalStorageTokenStorage";
import { RealizarLogin } from "@/application/use-cases/RealizarLogin";
import { useLoginForm } from "@/presentation/hooks/useLoginForm";

export default function LoginForm() {
  const httpClient = new HttpClient();
  const adminRepo = new HttpAdminRepository(httpClient);
  const tokenStorage = new LocalStorageTokenStorage();
  const realizarLogin = new RealizarLogin(adminRepo);

  const {
    username,
    setUsername,
    password,
    setPassword,
    loading,
    error,
    handleSignIn,
  } = useLoginForm(realizarLogin, tokenStorage);

  return (
    <div
      className="relative flex flex-col justify-center w-full h-full px-10 py-12"
      style={{
        background: "linear-gradient(145deg, #FFE0B2 0%, #FFF2DF 100%)",
      }}
    >
      {/* Header */}
      <div className="mb-10">
        <h2
          className="text-2xl font-light tracking-widest text-ag-dark"
          style={{ letterSpacing: "0.2em" }}
        >
          Bem-vindo
        </h2>
        <div className="mt-2 w-8 h-px bg-ag-gold" aria-hidden="true" />
      </div>

      {/* Form */}
      <form onSubmit={handleSignIn} className="flex flex-col gap-8" noValidate>
        {/* Username field */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="ag-username"
            className="text-[10px] tracking-[0.2em] uppercase text-ag-sepia"
          >
            Username
          </label>
          <input
            id="ag-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="bg-transparent border-0 border-b border-ag-beige outline-none text-ag-dark placeholder-ag-sepia/40 text-sm py-2 transition-colors focus:border-ag-gold"
            placeholder="seu usuário"
          />
        </div>

        {/* Password field */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="ag-password"
            className="text-[10px] tracking-[0.2em] uppercase text-ag-sepia"
          >
            Password
          </label>
          <input
            id="ag-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="bg-transparent border-0 border-b border-ag-beige outline-none text-ag-dark placeholder-ag-sepia/40 text-sm py-2 transition-colors focus:border-ag-gold"
            placeholder="••••••••"
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-red-600 -mt-4">{error}</p>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3 mt-2">
          {/* Sign In — more prominent */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 border border-ag-gold text-ag-gold text-[11px] tracking-[0.25em] uppercase bg-transparent transition-colors hover:bg-ag-gold/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Sign In"}
          </button>

          {/* Sign Up — slightly smaller */}
          <button
            type="button"
            className="w-full py-2 border border-ag-gold text-ag-gold text-[10px] tracking-[0.2em] uppercase bg-transparent transition-colors hover:bg-ag-gold/10"
          >
            Sign Up
          </button>
        </div>

        {/* Forgot password */}
        <div className="text-center mt-1">
          <button
            type="button"
            className="text-[9px] tracking-[0.2em] uppercase text-ag-sepia/70 hover:text-ag-sepia transition-colors"
          >
            Forgot Password?
          </button>
        </div>
      </form>

      {/* Globe icon — bottom corner */}
      <div className="absolute bottom-6 right-8 text-ag-sepia/40" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="w-5 h-5"
        >
          <circle cx="12" cy="12" r="10" />
          <ellipse cx="12" cy="12" rx="4" ry="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="12" y1="2" x2="12" y2="22" />
        </svg>
      </div>
    </div>
  );
}
