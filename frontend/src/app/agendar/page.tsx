"use client";

import { useState } from "react";
import { CheckCircle, Check, Clock, MessageCircle, Scissors, Menu, X } from "lucide-react";
import { HttpClient } from "@/infrastructure/http/HttpClient";
import { HttpServicoRepository } from "@/infrastructure/repositories/HttpServicoRepository";
import { HttpAgendamentoRepository } from "@/infrastructure/repositories/HttpAgendamentoRepository";
import { ListarServicosAtivos } from "@/application/use-cases/ListarServicosAtivos";
import { ListarSlotsDisponiveis } from "@/application/use-cases/ListarSlotsDisponiveis";
import { CriarAgendamento } from "@/application/use-cases/CriarAgendamento";
import { useAgendar } from "@/presentation/hooks/useAgendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import PlanetIcon from "@/components/login/PlanetIcon";

function RazorIcon({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 13.5 13.5 3a2.121 2.121 0 0 1 3 3L6 16.5" />
      <path d="M6 16.5 3 21l4.5-3" />
      <path d="m11 5.5 4.5 4.5" />
    </svg>
  );
}

function ServicoIcon({ nome, size = 22, className = "" }: { nome: string; size?: number; className?: string }) {
  if (nome.toLowerCase().includes("barba")) {
    return <RazorIcon size={size} className={className} />;
  }
  return <Scissors size={size} className={className} />;
}

const STEPS = [
  { n: 1, label: "Serviço" },
  { n: 2, label: "Horário" },
  { n: 3, label: "Dados" },
] as const;

export default function AgendarPage() {
  const httpClient = new HttpClient();
  const servicoRepo = new HttpServicoRepository(httpClient);
  const agendamentoRepo = new HttpAgendamentoRepository(httpClient);

  const listarServicosAtivos = new ListarServicosAtivos(servicoRepo);
  const listarSlotsDisponiveis = new ListarSlotsDisponiveis(agendamentoRepo);
  const criarAgendamento = new CriarAgendamento(agendamentoRepo);

  const {
    passo,
    setPasso,
    servicos,
    servicoSelecionado,
    setServicoSelecionado,
    dataSelecionada,
    setDataSelecionada,
    horarioSelecionado,
    setHorarioSelecionado,
    slots,
    loadingSlots,
    nome,
    setNome,
    telefone,
    setTelefone,
    loading,
    erro,
    handleAgendar,
    reiniciar,
  } = useAgendar(listarServicosAtivos, listarSlotsDisponiveis, criarAgendamento);

  const [mobileOpen, setMobileOpen] = useState(false);

  const slotMinutos = (s: number) => (s === 1 ? "30 min" : `${s * 30} min`);

  const slotsManha = slots.filter((h) => Number(h.split(":")[0]) < 12);
  const slotsTarde = slots.filter((h) => Number(h.split(":")[0]) >= 12);

  const sidebarContent = (
    <>
      <div className="flex flex-col items-center mb-8">
        <div style={{ filter: "drop-shadow(0 0 6px rgba(201,168,76,0.3))" }}>
          <PlanetIcon className="w-12 h-12" />
        </div>
        <h2
          className="text-xl font-bold tracking-[0.18em] uppercase text-ag-beige mt-3"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Marlon
        </h2>
        <div className="mt-2 w-10 h-px bg-ag-gold opacity-40" aria-hidden="true" />
      </div>

      <a
        href="https://wa.me/5511999999999"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 justify-center rounded-lg py-2.5 text-sm font-medium transition-colors"
        style={{
          background: "rgba(37,211,102,0.1)",
          border: "1px solid rgba(37,211,102,0.3)",
          color: "#25d166",
        }}
      >
        <MessageCircle size={16} />
        Fale no WhatsApp
      </a>

      <div className="mt-auto pt-8 space-y-1 text-xs text-ag-sepia tracking-wide">
        <p className="uppercase text-[9px] text-ag-gold tracking-[0.2em]">Segunda — Sábado</p>
        <p>09:00 — 20:00</p>
        <p className="mt-2 uppercase text-[9px] text-ag-gold tracking-[0.2em]">Endereço</p>
        <p>Rua dos Barbeiros, 123</p>
      </div>
    </>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-leather-texture">
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

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="flex flex-col w-[260px] h-full bg-ag-dark border-r border-ag-border px-6 py-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Fechar menu"
              onClick={() => setMobileOpen(false)}
              className="self-end text-ag-sepia hover:text-ag-gold transition-colors mb-2"
            >
              <X size={20} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] min-h-screen bg-ag-dark/90 border-r border-ag-border px-6 py-8 shrink-0 shadow-[5px_0_20px_rgba(0,0,0,0.5)] z-10">
        {sidebarContent}
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen px-6 lg:px-12 py-10">
        {/* Stepper */}
        {passo < 4 && (
          <div className="flex items-center border-b border-ag-border py-6 mb-10 max-w-[560px]">
            {STEPS.map(({ n, label }, i) => {
              const status = passo > n ? "complete" : passo === n ? "active" : "inactive";
              return (
                <div key={n} className="flex items-center flex-1 last:flex-initial">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        status === "active"
                          ? "bg-ag-crimson border border-ag-gold text-white"
                          : status === "complete"
                          ? "bg-ag-gold text-ag-dark"
                          : "border border-[#3a2a1a] text-ag-sepia bg-transparent"
                      }`}
                    >
                      {status === "complete" ? <Check size={14} /> : n}
                    </div>
                    <span
                      className={`text-[9px] tracking-[0.15em] uppercase ${
                        status === "inactive" ? "text-ag-sepia" : "text-ag-beige"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-px mx-4 mb-5 transition-colors ${
                        passo > n ? "bg-ag-gold" : "bg-ag-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* PASSO 1: Escolha o Serviço */}
        {passo === 1 && (
          <div className="max-w-3xl">
            <h1
              className="text-4xl font-bold text-ag-beige mb-8"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Escolha o Serviço
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {servicos.map((s) => {
                const selected = servicoSelecionado?.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => { setServicoSelecionado(s); setPasso(2); }}
                    className={`relative text-left p-6 rounded-xl border transition-all duration-200 ${
                      selected
                        ? "border-2 border-ag-crimson bg-ag-crimson/8"
                        : "border-ag-border bg-ag-panel hover:border-ag-gold hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(201,168,76,0.1)]"
                    }`}
                  >
                    {selected && (
                      <span className="absolute top-3 right-3 text-[9px] uppercase tracking-wider text-ag-gold flex items-center gap-1">
                        <Check size={12} /> Selecionado
                      </span>
                    )}
                    <ServicoIcon nome={s.nome} className="text-ag-gold mb-4" />
                    <h3 className="text-[13px] font-semibold tracking-[0.15em] uppercase text-ag-beige mb-2">
                      {s.nome}
                    </h3>
                    <p
                      className="text-2xl text-ag-gold mb-3"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      {s.preco.formatado}
                    </p>
                    <span
                      className="inline-block text-[9px] uppercase tracking-wider rounded px-2 py-0.5"
                      style={{ background: "rgba(139,26,26,0.3)", border: "1px solid #8b1a1a", color: "#e8dcc8" }}
                    >
                      {slotMinutos(s.slotSize)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PASSO 2: Escolha o Horário */}
        {passo === 2 && (
          <div className="max-w-2xl">
            <h1
              className="text-4xl font-bold text-ag-beige mb-2"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Escolha o Horário
            </h1>
            <p className="text-sm text-ag-sepia mb-6">
              {servicoSelecionado?.nome} · {servicoSelecionado?.preco.formatado}
            </p>

            {/* Date picker */}
            <div className="mb-6">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-ag-sepia mb-2">
                Data
              </label>
              <input
                type="date"
                value={dataSelecionada}
                min={format(new Date(), "yyyy-MM-dd")}
                onChange={(e) => { setDataSelecionada(e.target.value); setHorarioSelecionado(null); }}
                className="w-full rounded-lg px-4 py-3 text-sm placeholder-[#3a2a1a] skeuo-input"
              />
              <p className="text-xs text-ag-sepia mt-1">
                {format(new Date(dataSelecionada + "T12:00:00"), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>

            {/* Slots grid */}
            {loadingSlots ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-8">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-lg animate-shimmer" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-ag-sepia">Nenhum horário disponível para esta data.</p>
            ) : (
              <>
                {slotsManha.length > 0 && (
                  <>
                    <p className="text-[9px] tracking-[0.2em] uppercase text-ag-gold mb-3">Manhã</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-6">
                      {slotsManha.map((h) => (
                        <button
                          key={h}
                          onClick={() => setHorarioSelecionado(h)}
                          className={`py-2.5 rounded-md text-sm text-center transition-all border ${
                            horarioSelecionado === h
                              ? "bg-ag-crimson border-ag-crimson text-white"
                              : "bg-ag-panel border-ag-border text-ag-beige hover:border-ag-gold hover:text-ag-gold"
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {slotsTarde.length > 0 && (
                  <>
                    <p className="text-[9px] tracking-[0.2em] uppercase text-ag-gold mb-3">Tarde</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-8">
                      {slotsTarde.map((h) => (
                        <button
                          key={h}
                          onClick={() => setHorarioSelecionado(h)}
                          className={`py-2.5 rounded-md text-sm text-center transition-all border ${
                            horarioSelecionado === h
                              ? "bg-ag-crimson border-ag-crimson text-white"
                              : "bg-ag-panel border-ag-border text-ag-beige hover:border-ag-gold hover:text-ag-gold"
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setPasso(1)}
                className="px-6 py-3 rounded-lg text-sm skeuo-btn-metal"
              >
                Voltar
              </button>
              <button
                disabled={!horarioSelecionado}
                onClick={() => setPasso(3)}
                className="flex-1 disabled:opacity-40 disabled:cursor-not-allowed py-3 rounded-lg skeuo-btn"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* PASSO 3: Dados pessoais */}
        {passo === 3 && (
          <div className="flex flex-col lg:flex-row gap-10 max-w-4xl">
            <div className="max-w-md flex-1">
              <h1
                className="text-4xl font-bold text-ag-beige mb-2"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Seus Dados
              </h1>
              <p className="text-sm text-ag-sepia mb-8 lg:hidden">
                {servicoSelecionado?.nome} · {horarioSelecionado} ·{" "}
                {format(new Date(dataSelecionada + "T12:00:00"), "dd/MM/yyyy")}
              </p>

              <form onSubmit={handleAgendar} className="space-y-5">
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-ag-sepia mb-1.5">
                    Seu Nome
                  </label>
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Como quer ser chamado?"
                    required
                    className="w-full rounded-lg px-4 py-3 text-sm placeholder-[#3a2a1a] skeuo-input"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-ag-sepia mb-1.5">
                    Telefone (WhatsApp)
                  </label>
                  <input
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="5511999999999"
                    required
                    className="w-full rounded-lg px-4 py-3 text-sm placeholder-[#3a2a1a] skeuo-input"
                  />
                  <p className="text-[10px] text-ag-sepia mt-1">
                    Formato: 55 + DDD + número (ex: 5511999999999)
                  </p>
                </div>

                {erro && <p className="text-xs text-red-400">{erro}</p>}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPasso(2)}
                    className="px-6 py-3 rounded-lg text-sm skeuo-btn-metal"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 disabled:opacity-50 py-3 rounded-lg skeuo-btn"
                  >
                    {loading ? "Agendando..." : "Agendar Agora"}
                  </button>
                </div>
              </form>
            </div>

            {/* Resumo lateral */}
            <div className="hidden lg:block w-72 shrink-0">
              <div className="skeuo-panel border-ag-gold/40 p-6 sticky top-10">
                <p className="text-[9px] tracking-[0.2em] uppercase text-ag-gold mb-4">Resumo</p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ag-sepia">Serviço</span>
                    <span className="text-ag-beige font-medium">{servicoSelecionado?.nome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ag-sepia">Data</span>
                    <span className="text-ag-beige font-medium">
                      {format(new Date(dataSelecionada + "T12:00:00"), "dd/MM/yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ag-sepia">Horário</span>
                    <span className="text-ag-beige font-medium">{horarioSelecionado}</span>
                  </div>
                  <div className="h-px bg-ag-border my-2" />
                  <div className="flex justify-between">
                    <span className="text-ag-sepia">Total</span>
                    <span
                      className="text-ag-gold text-lg"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      {servicoSelecionado?.preco.formatado}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASSO 4: Confirmação */}
        {passo === 4 && (
          <div className="flex flex-col items-center justify-center flex-1 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-green-900/20 border border-green-700/40 flex items-center justify-center mb-6">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h1
              className="text-4xl font-bold text-ag-beige mb-3"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Agendado!
            </h1>
            <p className="text-ag-sepia mb-2">
              {servicoSelecionado?.nome} com <strong className="text-ag-beige">{nome}</strong>
            </p>
            <p className="text-ag-sepia mb-8">
              <Clock size={12} className="inline mr-1" />
              {horarioSelecionado} · {format(new Date(dataSelecionada + "T12:00:00"), "dd/MM/yyyy")}
            </p>
            <p className="text-sm text-ag-sepia mb-8">
              Em breve você receberá uma confirmação via WhatsApp.
            </p>
            <button
              onClick={reiniciar}
              className="px-8 py-3 rounded-lg text-sm skeuo-btn-metal"
            >
              Fazer novo agendamento
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
