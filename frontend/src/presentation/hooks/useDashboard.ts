import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ListarAgendamentosAdmin } from "@/application/use-cases/ListarAgendamentosAdmin";
import { AtualizarStatusAgendamento } from "@/application/use-cases/AtualizarStatusAgendamento";
import { ListarServicosAtivos } from "@/application/use-cases/ListarServicosAtivos";
import { ITokenStorage } from "@/domain/repositories/ITokenStorage";
import { Agendamento } from "@/domain/entities/Agendamento";
import { Servico } from "@/domain/entities/Servico";
import { format } from "date-fns";

export function useDashboard(
  listarAgendamentosAdmin: ListarAgendamentosAdmin,
  atualizarStatusAgendamento: AtualizarStatusAgendamento,
  listarServicosAtivos: ListarServicosAtivos,
  tokenStorage: ITokenStorage
) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState(new Date());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const dataStr = format(data, "yyyy-MM-dd");

  const fetchAgendamentos = useCallback(
    async (tok: string, d: string) => {
      setLoading(true);
      try {
        const list = await listarAgendamentosAdmin.execute(tok, d);
        setAgendamentos(list);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    },
    [router, listarAgendamentosAdmin]
  );

  useEffect(() => {
    const tok = tokenStorage.getToken();
    if (!tok) {
      router.push("/login");
      return;
    }
    setToken(tok);
    listarServicosAtivos.execute().then(setServicos);
    fetchAgendamentos(tok, dataStr);
  }, [router, dataStr, fetchAgendamentos, listarServicosAtivos, tokenStorage]);

  async function handleStatus(id: number, status: "PENDENTE" | "CONFIRMADO" | "CANCELADO") {
    if (!token) return;
    try {
      const updated = await atualizarStatusAgendamento.execute(token, id, status);
      setAgendamentos((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      console.error(err);
    }
  }

  const reloadAgendamentos = () => {
    if (token) {
      fetchAgendamentos(token, dataStr);
    }
  };

  return {
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
  };
}
