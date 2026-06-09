"use client";

import Image from "next/image";
import { CheckCircle, Clock, MessageCircle } from "lucide-react";
import { HttpClient } from "@/infrastructure/http/HttpClient";
import { HttpServicoRepository } from "@/infrastructure/repositories/HttpServicoRepository";
import { HttpAgendamentoRepository } from "@/infrastructure/repositories/HttpAgendamentoRepository";
import { ListarServicosAtivos } from "@/application/use-cases/ListarServicosAtivos";
import { ListarSlotsDisponiveis } from "@/application/use-cases/ListarSlotsDisponiveis";
import { CriarAgendamento } from "@/application/use-cases/CriarAgendamento";
import { useAgendar } from "@/presentation/hooks/useAgendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

  const slotMinutos = (s: number) => (s === 1 ? "30 min" : `${s * 30} min`);

  return (
    <div className="flex min-h-screen bg-leather-texture">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] min-h-screen bg-[#0d0700]/90 border-r border-[#2a1a0e] px-6 py-8 shrink-0 shadow-[5px_0_20px_rgba(0,0,0,0.5)] z-10">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png"
            alt="Marlon Barber Shop"
            width={120}
            height={120}
            className="object-contain"
            style={{ filter: "invert(1) sepia(0.1) brightness(0.85)" }}
          />
          <h2
            className="text-xl font-bold tracking-[0.18em] uppercase text-[#e8dcc8] mt-3"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Marlon
          </h2>
        </div>

        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 justify-center border border-[#4a8a4a]/40 rounded-lg py-2.5 text-[#4a8a4a] hover:bg-green-900/10 transition-colors text-sm font-medium"
        >
          <MessageCircle size={16} />
          Fale no WhatsApp
        </a>

        <div className="mt-auto pt-8 space-y-1 text-xs text-[#4a3a2a] tracking-wide">
          <p className="uppercase text-[9px]">Segunda — Sábado</p>
          <p>09:00 — 20:00</p>
          <p className="mt-2 uppercase text-[9px]">Endereço</p>
          <p>Rua dos Barbeiros, 123</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen px-6 lg:px-12 py-10">
        {/* Stepper */}
        {passo < 4 && (
          <div className="flex items-center gap-0 mb-10 max-w-2xl">
            {[
              { n: 1, label: "Serviço" },
              { n: 2, label: "Horário" },
              { n: 3, label: "Dados" },
            ].map(({ n, label }, i) => (
              <div key={n} className="flex items-center gap-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] tracking-[0.15em] uppercase font-bold ${
                      passo >= n ? "text-[#8b1a1a]" : "text-[#3a2a1a]"
                    }`}
                  >
                    {n}. {label}
                  </span>
                </div>
                {i < 2 && (
                  <div className="flex-1 h-px bg-[#2a1a0e] mx-6 w-24" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* PASSO 1: Escolha o Serviço */}
        {passo === 1 && (
          <div className="max-w-2xl">
            <h1
              className="text-4xl font-bold text-[#e8dcc8] mb-8"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Escolha o Serviço
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {servicos.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setServicoSelecionado(s); setPasso(2); }}
                  className={`text-left p-5 rounded-xl transition-all group ${
                    servicoSelecionado?.id === s.id
                      ? "skeuo-panel border-[#8b1a1a] ring-1 ring-[#8b1a1a] shadow-[inset_0_0_20px_rgba(139,26,26,0.2)]"
                      : "skeuo-panel hover:border-[#8b1a1a]/50 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3
                      className="text-lg font-bold tracking-wide uppercase text-[#e8dcc8]"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      {s.nome}
                    </h3>
                    <span className="text-[9px] bg-[#8b1a1a] text-[#e8dcc8] rounded px-2 py-0.5 font-bold tracking-wider shrink-0">
                      {slotMinutos(s.slotSize)}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-[#e8dcc8]">
                    {s.preco.formatado}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASSO 2: Escolha o Horário */}
        {passo === 2 && (
          <div className="max-w-2xl">
            <h1
              className="text-4xl font-bold text-[#e8dcc8] mb-2"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Escolha o Horário
            </h1>
            <p className="text-sm text-[#7a6a58] mb-6">
              {servicoSelecionado?.nome} · {servicoSelecionado?.preco.formatado}
            </p>

            {/* Date picker */}
            <div className="mb-6">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-[#7a6a58] mb-2">
                Data
              </label>
              <input
                type="date"
                value={dataSelecionada}
                min={format(new Date(), "yyyy-MM-dd")}
                onChange={(e) => { setDataSelecionada(e.target.value); setHorarioSelecionado(null); }}
                className="w-full rounded-lg px-4 py-3 text-sm placeholder-[#3a2a1a] skeuo-input"
              />
              <p className="text-xs text-[#5a4a38] mt-1">
                {format(new Date(dataSelecionada + "T12:00:00"), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>

            {/* Slots grid */}
            {loadingSlots ? (
              <p className="text-sm text-[#5a4a38]">Buscando horários...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-[#5a4a38]">Nenhum horário disponível para esta data.</p>
            ) : (
              <>
                <p className="text-[9px] tracking-[0.2em] uppercase text-[#5a4a38] mb-3">
                  Horários Disponíveis
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-8">
                  {slots.map((h) => (
                    <button
                      key={h}
                      onClick={() => setHorarioSelecionado(h)}
                      className={`py-2.5 rounded-lg text-sm text-center transition-all ${
                        horarioSelecionado === h
                          ? "bg-gradient-to-br from-[#8b1a1a] to-[#5a0f0f] border border-[#a01e1e] text-[#e8dcc8] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6)] transform translate-y-[2px]"
                          : "skeuo-btn-metal hover:text-[#e8dcc8]"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setPasso(1)}
                className="px-6 py-3 rounded-lg text-sm text-[#7a6a58] hover:text-[#e8dcc8] skeuo-btn-metal"
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
          <div className="max-w-md">
            <h1
              className="text-4xl font-bold text-[#e8dcc8] mb-2"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Seus Dados
            </h1>
            <p className="text-sm text-[#7a6a58] mb-8">
              {servicoSelecionado?.nome} · {horarioSelecionado} ·{" "}
              {format(new Date(dataSelecionada + "T12:00:00"), "dd/MM/yyyy")}
            </p>

            <form onSubmit={handleAgendar} className="space-y-5">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#7a6a58] mb-1.5">
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
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#7a6a58] mb-1.5">
                  Telefone (WhatsApp)
                </label>
                <input
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="5511999999999"
                  required
                  className="w-full rounded-lg px-4 py-3 text-sm placeholder-[#3a2a1a] skeuo-input"
                />
                <p className="text-[10px] text-[#4a3a2a] mt-1">
                  Formato: 55 + DDD + número (ex: 5511999999999)
                </p>
              </div>

              {erro && <p className="text-xs text-red-400">{erro}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPasso(2)}
                  className="px-6 py-3 rounded-lg text-sm text-[#7a6a58] hover:text-[#e8dcc8] skeuo-btn-metal"
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
        )}

        {/* PASSO 4: Confirmação */}
        {passo === 4 && (
          <div className="flex flex-col items-center justify-center flex-1 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-green-900/20 border border-green-700/40 flex items-center justify-center mb-6">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h1
              className="text-4xl font-bold text-[#e8dcc8] mb-3"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Agendado!
            </h1>
            <p className="text-[#7a6a58] mb-2">
              {servicoSelecionado?.nome} com <strong className="text-[#e8dcc8]">{nome}</strong>
            </p>
            <p className="text-[#7a6a58] mb-8">
              <Clock size={12} className="inline mr-1" />
              {horarioSelecionado} · {format(new Date(dataSelecionada + "T12:00:00"), "dd/MM/yyyy")}
            </p>
            <p className="text-sm text-[#5a4a38] mb-8">
              Em breve você receberá uma confirmação via WhatsApp.
            </p>
            <button
              onClick={reiniciar}
              className="px-8 py-3 rounded-lg text-sm text-[#7a6a58] hover:text-[#e8dcc8] skeuo-btn-metal"
            >
              Fazer novo agendamento
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
