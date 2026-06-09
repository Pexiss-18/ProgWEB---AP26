import { useState, useEffect } from "react";
import { ListarServicosAtivos } from "@/application/use-cases/ListarServicosAtivos";
import { ListarSlotsDisponiveis } from "@/application/use-cases/ListarSlotsDisponiveis";
import { CriarAgendamento } from "@/application/use-cases/CriarAgendamento";
import { Servico } from "@/domain/entities/Servico";
import { format } from "date-fns";

type Passo = 1 | 2 | 3 | 4;

export function useAgendar(
  listarServicosAtivos: ListarServicosAtivos,
  listarSlotsDisponiveis: ListarSlotsDisponiveis,
  criarAgendamento: CriarAgendamento
) {
  const [passo, setPasso] = useState<Passo>(1);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState(format(new Date(), "yyyy-MM-dd"));
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    listarServicosAtivos.execute().then(setServicos);
  }, []);

  useEffect(() => {
    if (passo === 2 && servicoSelecionado) {
      setLoadingSlots(true);
      listarSlotsDisponiveis
        .execute(dataSelecionada, servicoSelecionado.id!)
        .then((s) => setSlots(s.map((x) => x.hora)))
        .catch(() => setSlots([]))
        .finally(() => setLoadingSlots(false));
    }
  }, [passo, dataSelecionada, servicoSelecionado]);

  async function handleAgendar(e: React.FormEvent) {
    e.preventDefault();
    if (!servicoSelecionado || !horarioSelecionado) return;

    setLoading(true);
    setErro("");
    try {
      await criarAgendamento.execute({
        servicoId: servicoSelecionado.id!,
        dataHoraInicio: new Date(`${dataSelecionada}T${horarioSelecionado}:00`),
        nomeCliente: nome,
        telefoneClienteRaw: telefone,
      });
      setPasso(4);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao agendar");
    } finally {
      setLoading(false);
    }
  }

  function reiniciar() {
    setPasso(1);
    setServicoSelecionado(null);
    setHorarioSelecionado(null);
    setNome("");
    setTelefone("");
    setErro("");
  }

  return {
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
    setErro,
    handleAgendar,
    reiniciar,
  };
}
