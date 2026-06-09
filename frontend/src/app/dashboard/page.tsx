"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, X, MessageCircle } from "lucide-react";
import Sidebar from "@/components/sidebar";
import StatusBadge from "@/components/status-badge";
import { HttpClient } from "@/infrastructure/http/HttpClient";
import { HttpServicoRepository } from "@/infrastructure/repositories/HttpServicoRepository";
import { HttpAgendamentoRepository } from "@/infrastructure/repositories/HttpAgendamentoRepository";
import { LocalStorageTokenStorage } from "@/infrastructure/storage/LocalStorageTokenStorage";
import { ListarServicosAtivos } from "@/application/use-cases/ListarServicosAtivos";
import { ListarAgendamentosAdmin } from "@/application/use-cases/ListarAgendamentosAdmin";
import { AtualizarStatusAgendamento } from "@/application/use-cases/AtualizarStatusAgendamento";
import { CriarAgendamentoAdmin } from "@/application/use-cases/CriarAgendamentoAdmin";
import { Servico } from "@/domain/entities/Servico";
import { Agendamento } from "@/domain/entities/Agendamento";
import { useDashboard } from "@/presentation/hooks/useDashboard";

const HORARIOS = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00","17:30","18:00",
];

export default function DashboardPage() {
  const httpClient = new HttpClient();
  const tokenStorage = new LocalStorageTokenStorage();
  const servicoRepo = new HttpServicoRepository(httpClient);
  const agendamentoRepo = new HttpAgendamentoRepository(httpClient);

  const listarServicosAtivos = new ListarServicosAtivos(servicoRepo);
  const listarAgendamentosAdmin = new ListarAgendamentosAdmin(agendamentoRepo);
  const atualizarStatusAgendamento = new AtualizarStatusAgendamento(agendamentoRepo);

  const {
    token,
    data,
    setData,
    agendamentos,
    servicos,
    loading,
    showModal,
    setShowModal,
    dataStr,
    handleStatus,
    reloadAgendamentos,
  } = useDashboard(
    listarAgendamentosAdmin,
    atualizarStatusAgendamento,
    listarServicosAtivos,
    tokenStorage
  );

  const dataDisplay = format(data, "EEEE, dd 'de' MMMM", { locale: ptBR });

  // Monta a timeline com slots
  const agendamentoPorHora: Record<string, Agendamento | null> = {};
  HORARIOS.forEach((h) => { agendamentoPorHora[h] = null; });
  agendamentos.forEach((a) => {
    const hora = format(a.dataHoraInicio, "HH:mm");
    if (hora in agendamentoPorHora) agendamentoPorHora[hora] = a;
  });

  const totalClientes = agendamentos.filter((a) => a.status !== "CANCELADO").length;
  const horasOcupadas = agendamentos
    .filter((a) => a.status !== "CANCELADO")
    .reduce((acc, a) => acc + a.slotSize * 0.5, 0);
  const horasLivres = Math.max(0, 9 - horasOcupadas);

  const servicoLabel = (id: number) =>
    servicos.find((s) => s.id === id)?.nome ?? `Serviço #${id}`;

  return (
    <div className="flex min-h-screen bg-leather-texture">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <div className="px-10 pt-10 pb-6">
          <h1
            className="text-5xl font-bold text-[#e8dcc8] leading-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Agenda de Hoje
          </h1>

          {/* Date nav */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => setData((d) => subDays(d, 1))}
              className="p-1 text-[#7a6a58] hover:text-[#e8dcc8] transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <p className="text-sm tracking-[0.12em] uppercase text-[#7a6a58]">
              {dataDisplay}
            </p>
            <button
              onClick={() => setData((d) => addDays(d, 1))}
              className="p-1 text-[#7a6a58] hover:text-[#e8dcc8] transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Métricas */}
          <div className="flex gap-4 mt-6">
            {[
              { label: "CLIENTES", value: totalClientes },
              { label: "HORAS LIVRES", value: `${horasLivres}h` },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="skeuo-panel px-6 py-3 text-center min-w-[110px]"
              >
                <p className="text-[9px] tracking-[0.2em] text-[#5a4a38] uppercase mb-1">
                  {label}
                </p>
                <p className="text-2xl font-bold text-[#e8dcc8]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#2a1a0e] mx-10" />

        {/* Timeline */}
        <div className="flex-1 px-10 py-6 space-y-2 overflow-y-auto">
          {loading ? (
            <p className="text-[#5a4a38] text-sm">Carregando...</p>
          ) : (
            HORARIOS.map((hora) => {
              const ag = agendamentoPorHora[hora];
              return (
                <div key={hora} className="flex items-center gap-6 min-h-[56px]">
                  <span className="text-sm text-[#5a4a38] w-12 shrink-0">{hora}</span>
                  {ag ? (
                    <div className="flex-1 flex items-center justify-between skeuo-panel border-l-4 border-l-[#8b1a1a] px-5 py-3 gap-4">
                      <div>
                        <p className="font-semibold text-[#e8dcc8]">{ag.nomeCliente}</p>
                        <p className="text-xs text-[#7a6a58] mt-0.5">{servicoLabel(ag.servicoId)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <a
                          href={`https://wa.me/${ag.telefoneCliente.valor}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#4a8a4a] hover:text-green-400 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle size={18} />
                        </a>
                        <StatusBadge status={ag.status} />
                        {/* Status actions */}
                        <div className="flex gap-1">
                          {ag.status !== "CONFIRMADO" && (
                            <button
                              onClick={() => handleStatus(ag.id!, "CONFIRMADO")}
                              className="text-[9px] tracking-wider px-2 py-1 border border-green-800 text-green-500 rounded hover:bg-green-900/20 transition-colors"
                            >
                              CONFIRMAR
                            </button>
                          )}
                          {ag.status !== "CANCELADO" && (
                            <button
                              onClick={() => handleStatus(ag.id!, "CANCELADO")}
                              className="text-[9px] tracking-wider px-2 py-1 border border-red-900 text-red-500 rounded hover:bg-red-900/20 transition-colors"
                            >
                              CANCELAR
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 h-px border-t border-[#1a0d07] shadow-[0_1px_0_rgba(255,255,255,0.05)] flex items-center justify-center">
                      <span className="text-[9px] tracking-[0.2em] text-[#2a1a0e] uppercase px-3">
                        Disponível
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* FAB */}
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center skeuo-btn z-20"
        >
          <Plus size={24} className="text-[#e8dcc8]" />
        </button>
      </main>

      {/* Modal walk-in */}
      {showModal && (
        <WalkInModal
          servicos={servicos}
          token={token ?? ""}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); reloadAgendamentos(); }}
        />
      )}
    </div>
  );
}

// ─── Walk-in Modal ──────────────────────────────────────────────────────────

function WalkInModal({
  servicos,
  token,
  onClose,
  onSaved,
}: {
  servicos: Servico[];
  token: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [servicoId, setServicoId] = useState<number | "">(servicos[0]?.id ?? "");
  const [dataHora, setDataHora] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const httpClient = new HttpClient();
  const agendamentoRepo = new HttpAgendamentoRepository(httpClient);
  const criarAgendamentoAdmin = new CriarAgendamentoAdmin(agendamentoRepo);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!servicoId) return;

    setLoading(true);
    setErro("");
    try {
      await criarAgendamentoAdmin.execute({
        token,
        servicoId: Number(servicoId),
        dataHoraInicio: new Date(dataHora),
        nomeCliente: nome,
        telefoneClienteRaw: telefone,
      });
      onSaved();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="skeuo-panel w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#5a4a38] hover:text-[#e8dcc8] transition-colors"
        >
          <X size={20} />
        </button>
        <h2
          className="text-xl font-bold text-[#e8dcc8] mb-6 tracking-wide"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Novo Agendamento
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] tracking-[0.15em] uppercase text-[#7a6a58] mb-1.5">
              Nome do Cliente
            </label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full rounded-lg px-4 py-2.5 text-sm skeuo-input"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.15em] uppercase text-[#7a6a58] mb-1.5">
              Telefone (WhatsApp)
            </label>
            <input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
              placeholder="5511999999999"
              className="w-full rounded-lg px-4 py-2.5 text-sm skeuo-input"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.15em] uppercase text-[#7a6a58] mb-1.5">
              Serviço
            </label>
            <select
              value={servicoId}
              onChange={(e) => setServicoId(Number(e.target.value))}
              className="w-full rounded-lg px-4 py-2.5 text-sm skeuo-input"
            >
              {servicos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} — {s.preco.formatado}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.15em] uppercase text-[#7a6a58] mb-1.5">
              Data e Hora
            </label>
            <input
              type="datetime-local"
              value={dataHora}
              onChange={(e) => setDataHora(e.target.value)}
              required
              className="w-full rounded-lg px-4 py-2.5 text-sm skeuo-input"
            />
          </div>
          {erro && <p className="text-xs text-red-400">{erro}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full disabled:opacity-50 py-3 rounded-lg mt-4 skeuo-btn"
          >
            {loading ? "Salvando..." : "Confirmar"}
          </button>
        </form>
      </div>
    </div>
  );
}
