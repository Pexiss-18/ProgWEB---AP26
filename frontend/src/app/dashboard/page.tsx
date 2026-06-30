"use client";

import { useState, useMemo } from "react";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  MessageCircle,
  Users,
  Clock,
  DollarSign,
  MoreVertical,
  type LucideIcon,
} from "lucide-react";
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
  const tokenStorage = useMemo(() => new LocalStorageTokenStorage(), []);
  const listarServicosAtivos = useMemo(() => {
    const httpClient = new HttpClient();
    return new ListarServicosAtivos(new HttpServicoRepository(httpClient));
  }, []);
  const { listarAgendamentosAdmin, atualizarStatusAgendamento } = useMemo(() => {
    const agendamentoRepo = new HttpAgendamentoRepository(new HttpClient());
    return {
      listarAgendamentosAdmin: new ListarAgendamentosAdmin(agendamentoRepo),
      atualizarStatusAgendamento: new AtualizarStatusAgendamento(agendamentoRepo),
    };
  }, []);

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
  const ehHoje = dataStr === format(new Date(), "yyyy-MM-dd");
  const horaAtual = (() => {
    const agora = new Date();
    const minutos = agora.getMinutes() >= 30 ? 30 : 0;
    return `${String(agora.getHours()).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
  })();

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
  const receitaDoDia = agendamentos
    .filter((a) => a.status !== "CANCELADO")
    .reduce((acc, a) => {
      const servico = servicos.find((s) => s.id === a.servicoId);
      return acc + (servico ? servico.preco.valor : 0);
    }, 0);
  const receitaFormatada = receitaDoDia.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const servicoLabel = (id: number) =>
    servicos.find((s) => s.id === id)?.nome ?? `Serviço #${id}`;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-leather-texture">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <div className="px-6 lg:px-10 pt-10 pb-6">
          <h1
            className="text-[1.75rem] font-bold text-ag-beige leading-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Agenda de Hoje
          </h1>
          <div className="w-12 h-0.5 bg-ag-gold mt-2" aria-hidden="true" />

          {/* Date nav */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => setData((d) => subDays(d, 1))}
              className="p-1 text-ag-gold hover:text-ag-crimson transition-colors"
              aria-label="Dia anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <p className="text-xs tracking-[0.1em] uppercase text-ag-sepia">
              {dataDisplay}
            </p>
            <button
              onClick={() => setData((d) => addDays(d, 1))}
              className="p-1 text-ag-gold hover:text-ag-crimson transition-colors"
              aria-label="Próximo dia"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Métricas */}
          <div className="flex flex-wrap gap-4 mt-6 mb-2">
            <StatCard
              icon={Users}
              label="Clientes"
              value={String(totalClientes)}
              borderColor="#8b1a1a"
            />
            <StatCard
              icon={Clock}
              label="Horas Livres"
              value={`${horasLivres}h`}
              borderColor="#c9a84c"
            />
            <StatCard
              icon={DollarSign}
              label="Receita do Dia"
              value={receitaFormatada}
              borderColor="#4a8a4a"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-ag-border mx-6 lg:mx-10" />

        {/* Timeline */}
        <div className="flex-1 px-6 lg:px-10 py-6 overflow-y-auto">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg animate-shimmer" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {HORARIOS.map((hora, i) => {
                const ag = agendamentoPorHora[hora];
                const isCurrent = ehHoje && hora === horaAtual;
                const periodoAnterior = i > 0 ? HORARIOS[i - 1] < "12:00" : null;
                const mostrarSeparador =
                  i === 0 || (periodoAnterior === true && hora >= "12:00");
                return (
                  <div key={hora}>
                    {mostrarSeparador && (
                      <p className="text-[9px] tracking-[0.2em] uppercase text-ag-gold text-center py-2">
                        {hora < "12:00" ? "— Manhã —" : "— Tarde —"}
                      </p>
                    )}
                    <TimelineRow
                      hora={hora}
                      agendamento={ag}
                      isCurrent={isCurrent}
                      servicoLabel={servicoLabel}
                      onStatus={handleStatus}
                      onAgendarVago={() => setShowModal(true)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FAB */}
        <div className="fixed bottom-8 right-8 z-20 group">
          <span
            className="absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap text-xs uppercase tracking-wider text-ag-beige bg-ag-panel border border-ag-border px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          >
            Novo Agendamento
          </span>
          <button
            onClick={() => setShowModal(true)}
            aria-label="Novo agendamento"
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #8b1a1a, #6d1414)",
              boxShadow: "0 4px 20px rgba(139,26,26,0.5)",
            }}
          >
            <Plus size={24} className="text-ag-beige" />
          </button>
        </div>
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

// ─── Stat card ──────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  borderColor,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  borderColor: string;
}) {
  return (
    <div
      className="skeuo-panel flex items-center gap-3 px-6 py-4 min-w-[160px]"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <Icon size={20} className="text-ag-gold shrink-0" aria-hidden="true" />
      <div>
        <p className="text-[9px] tracking-[0.2em] text-ag-gold uppercase mb-1">
          {label}
        </p>
        <p
          className="text-[1.75rem] leading-none text-ag-beige"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Timeline row ───────────────────────────────────────────────────────────

function TimelineRow({
  hora,
  agendamento,
  isCurrent,
  servicoLabel,
  onStatus,
  onAgendarVago,
}: {
  hora: string;
  agendamento: Agendamento | null;
  isCurrent: boolean;
  servicoLabel: (id: number) => string;
  onStatus: (id: number, status: "PENDENTE" | "CONFIRMADO" | "CANCELADO") => void;
  onAgendarVago: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const dotColor = agendamento ? "#8b1a1a" : isCurrent ? "#c9a84c" : "#4a8a4a";

  return (
    <div className="flex items-start gap-4 min-h-[60px] relative">
      <span className="w-[52px] pt-3 text-xs text-ag-gold shrink-0">{hora}</span>

      <div className="w-4 flex justify-center pt-[18px] shrink-0">
        <span
          className={`w-2 h-2 rounded-full ${isCurrent && !agendamento ? "animate-pulse" : ""}`}
          style={{ background: dotColor }}
          aria-hidden="true"
        />
      </div>

      {agendamento ? (
        <div
          className="flex-1 flex items-center justify-between rounded-lg px-5 py-3 gap-4"
          style={{
            background: isCurrent ? "rgba(201,168,76,0.04)" : "#1a0e08",
            border: `1px solid ${isCurrent ? "rgba(201,168,76,0.3)" : "#2a1a0e"}`,
          }}
        >
          <div>
            <p className="font-bold text-ag-beige text-[13px]">{agendamento.nomeCliente}</p>
            <p className="text-[11px] text-ag-sepia mt-0.5">{servicoLabel(agendamento.servicoId)}</p>
          </div>
          <div className="flex items-center gap-3 relative">
            <a
              href={`https://wa.me/${agendamento.telefoneCliente.valor}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4a8a4a] hover:text-green-400 transition-colors"
              title="WhatsApp"
              aria-label="Contatar via WhatsApp"
            >
              <MessageCircle size={18} />
            </a>
            <StatusBadge status={agendamento.status} />
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Mais ações"
              className="text-ag-sepia hover:text-ag-gold transition-colors"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 z-30 skeuo-panel p-2 flex flex-col gap-1 min-w-[140px]">
                {agendamento.status !== "CONFIRMADO" && (
                  <button
                    onClick={() => { onStatus(agendamento.id!, "CONFIRMADO"); setMenuOpen(false); }}
                    className="text-[10px] tracking-wider uppercase px-2 py-1.5 text-left text-green-400 hover:bg-green-900/20 rounded transition-colors"
                  >
                    Confirmar
                  </button>
                )}
                {agendamento.status !== "CANCELADO" && (
                  <button
                    onClick={() => { onStatus(agendamento.id!, "CANCELADO"); setMenuOpen(false); }}
                    className="text-[10px] tracking-wider uppercase px-2 py-1.5 text-left text-red-400 hover:bg-red-900/20 rounded transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={onAgendarVago}
          title="Clique para agendar"
          className="group/slot flex-1 flex items-center justify-center rounded-lg py-3 transition-colors cursor-pointer"
          style={{ background: "rgba(74,138,74,0.05)", border: "1px solid rgba(74,138,74,0.15)" }}
        >
          <span className="text-[9px] tracking-[0.2em] uppercase text-green-500 group-hover/slot:hidden">
            Disponível
          </span>
          <span className="text-[9px] tracking-[0.2em] uppercase text-ag-beige hidden group-hover/slot:inline">
            Clique para agendar
          </span>
        </button>
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
          className="absolute top-4 right-4 text-ag-sepia hover:text-ag-beige transition-colors"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>
        <h2
          className="text-xl font-bold text-ag-beige mb-6 tracking-wide"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Novo Agendamento
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] tracking-[0.15em] uppercase text-ag-sepia mb-1.5">
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
            <label className="block text-[10px] tracking-[0.15em] uppercase text-ag-sepia mb-1.5">
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
            <label className="block text-[10px] tracking-[0.15em] uppercase text-ag-sepia mb-1.5">
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
            <label className="block text-[10px] tracking-[0.15em] uppercase text-ag-sepia mb-1.5">
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
