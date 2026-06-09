const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── Auth ──────────────────────────────────────────────────────────────────

export async function loginAdmin(email: string, senha: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  if (!res.ok) throw new Error("Credenciais inválidas");
  const data = await res.json();
  return data.access_token as string;
}

// ─── Serviços ──────────────────────────────────────────────────────────────

export interface Servico {
  id: number;
  nome: string;
  preco: number;
  slot_size: number; // 1 = 30min, 2 = 60min
  ativo: boolean;
}

export async function listarServicos(): Promise<Servico[]> {
  const res = await fetch(`${API_BASE}/api/servicos`);
  if (!res.ok) throw new Error("Erro ao buscar serviços");
  return res.json();
}

// ─── Agendamentos ──────────────────────────────────────────────────────────

export interface SlotDisponivel {
  hora: string; // "09:00"
}

export interface Agendamento {
  id: number;
  servico_id: number;
  data_hora_inicio: string;
  nome_cliente: string;
  telefone_cliente: string;
  status: "PENDENTE" | "CONFIRMADO" | "CANCELADO";
  slot_size: number;
  criado_em: string;
}

export async function listarSlotsDisponiveis(
  data: string,
  servicoId: number
): Promise<SlotDisponivel[]> {
  const res = await fetch(
    `${API_BASE}/api/agendamentos/disponiveis?data=${data}&servico_id=${servicoId}`
  );
  if (!res.ok) throw new Error("Erro ao buscar slots");
  const body = await res.json();
  return body.slots as SlotDisponivel[];
}

export async function criarAgendamento(payload: {
  servico_id: number;
  data_hora_inicio: string;
  nome_cliente: string;
  telefone_cliente: string;
}): Promise<Agendamento> {
  const res = await fetch(`${API_BASE}/api/agendamentos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Horário indisponível");
  }
  return res.json();
}

export async function listarAgendamentosAdmin(
  token: string,
  data: string
): Promise<Agendamento[]> {
  const res = await fetch(`${API_BASE}/api/admin/agendamentos?data=${data}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Não autorizado");
  return res.json();
}

export async function atualizarStatusAgendamento(
  token: string,
  id: number,
  status: string
): Promise<Agendamento> {
  const res = await fetch(`${API_BASE}/api/admin/agendamentos/${id}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Erro ao atualizar status");
  return res.json();
}
