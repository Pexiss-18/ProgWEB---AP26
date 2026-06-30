"use client";

import { User, Lock } from "lucide-react";
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
      style={{ background: "#f5ede0" }}
    >
      {/* Header */}
      <div className="mb-8">
        <h2
          className="text-[2rem] text-[#1a0e08]"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Bem-vindo
        </h2>
        <p className="mt-1 text-[11px] text-[#7a6a58]">
          Entre com suas credenciais
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSignIn} className="flex flex-col gap-5" noValidate>
        {/* Username field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="ag-username"
            className="text-[10px] tracking-[0.15em] uppercase text-[#5a4a3a]"
          >
            Username
          </label>
          <div className="relative">
            <User
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a4a3a]/60"
              aria-hidden="true"
            />
            <input
              id="ag-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full rounded-lg pl-10 pr-4 py-3 text-sm text-[#1a0e08] placeholder-[#5a4a3a]/40 outline-none transition-colors focus:outline-2 focus:outline-[#c9a84c]"
              style={{ background: "#ede5d8", border: "1px solid #c4b49a" }}
              placeholder="seu usuário"
            />
          </div>
        </div>

        {/* Password field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="ag-password"
            className="text-[10px] tracking-[0.15em] uppercase text-[#5a4a3a]"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a4a3a]/60"
              aria-hidden="true"
            />
            <input
              id="ag-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-lg pl-10 pr-4 py-3 text-sm text-[#1a0e08] placeholder-[#5a4a3a]/40 outline-none transition-colors focus:outline-2 focus:outline-[#c9a84c]"
              style={{ background: "#ede5d8", border: "1px solid #c4b49a" }}
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Error message */}
        {error && <p className="text-xs text-red-600">{error}</p>}

        {/* Buttons */}
        <div className="flex flex-col gap-3 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="skeuo-btn w-full rounded-lg py-3.5 text-[11px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Sign In"}
          </button>

          {/* Separator */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-[#c4b49a]" aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#7a6a58]">ou</span>
            <div className="flex-1 h-px bg-[#c4b49a]" aria-hidden="true" />
          </div>

          <button
            type="button"
            className="w-full py-3 rounded-lg border border-[#8b1a1a] text-[#8b1a1a] text-[10px] tracking-[0.2em] uppercase bg-transparent transition-colors hover:bg-[#8b1a1a]/8"
          >
            Sign Up
          </button>
        </div>

        {/* Forgot password */}
        <div className="text-center mt-1">
          <button
            type="button"
            className="text-[10px] text-[#7a6a58] hover:underline transition-colors"
          >
            Forgot Password?
          </button>
        </div>
      </form>
    </div>
  );
}
